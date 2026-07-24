const { chatCompletion } = require("./groqClient");
const { buildSystemPrompt } = require("../systemPrompt");
const { ALL_TOOLS, AUTONOMOUS_EXECUTORS, summarizeAction, performConfirmedAction } = require("./tools");
const { tierOf, createPending, resolvePending, moneyActionsEnabled } = require("./permissions");
const conversations = require("./conversationStore");
const activityLog = require("./activityLog");

const MAX_TOOL_ROUNDS = 8; // guardrail against runaway tool loops (Section 7)

function tierRank(tier) {
  return { autonomous: 0, "ask-first": 1, money: 2 }[tier] ?? 1;
}

function safeParseArgs(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

/**
 * Runs (or resumes) the tool loop until the model produces a final answer,
 * or until it requests one or more ask-first / money actions, at which
 * point this returns a `confirmation_required` result instead of calling
 * the API again. This module owns conversation + pending-action persistence.
 */
async function step(conversationId, round = 1) {
  if (round > MAX_TOOL_ROUNDS) {
    return { status: "done", text: "I hit my internal tool-call limit for this turn — let me know if you'd like me to keep going." };
  }

  const messages = conversations.getMessages(conversationId);
  const assistantMessage = await chatCompletion({
    system: buildSystemPrompt(),
    messages,
    tools: ALL_TOOLS,
  });

  const toolCalls = assistantMessage.tool_calls || [];
  messages.push({
    role: "assistant",
    content: assistantMessage.content ?? null,
    ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
  });

  if (toolCalls.length === 0) {
    conversations.saveMessages(conversationId, messages);
    return { status: "done", text: (assistantMessage.content || "").trim() || "(no response)" };
  }

  // Split tool calls into ones we can run right now vs. ones that need a
  // human go-ahead first. Every tool_call in this message needs a matching
  // "tool" role message before the conversation can continue, so we compute
  // the autonomous ones immediately and hold the rest.
  const toolResultMessages = [];
  const needsConfirmation = [];

  for (const call of toolCalls) {
    const name = call.function.name;
    const input = safeParseArgs(call.function.arguments);
    const tier = tierOf(name);

    if (tier === "autonomous" && AUTONOMOUS_EXECUTORS[name]) {
      const result = await AUTONOMOUS_EXECUTORS[name](input);
      toolResultMessages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    } else if (tier === "money" && !moneyActionsEnabled()) {
      toolResultMessages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify({
          ok: false,
          reason: "Money actions are disabled on this deployment (MONEY_ACTIONS_ENABLED is not set to true).",
        }),
      });
    } else {
      needsConfirmation.push({
        toolCallId: call.id,
        toolName: name,
        input,
        summary: summarizeAction(name, input),
        tier,
      });
    }
  }

  if (needsConfirmation.length === 0) {
    messages.push(...toolResultMessages);
    conversations.saveMessages(conversationId, messages);
    return step(conversationId, round + 1);
  }

  // At least one action needs a human go-ahead. Batch tier = riskiest step.
  const overallTier = needsConfirmation.reduce(
    (worst, a) => (tierRank(a.tier) > tierRank(worst) ? a.tier : worst),
    "ask-first"
  );
  const summary =
    needsConfirmation.length === 1
      ? needsConfirmation[0].summary
      : `${needsConfirmation.length} actions:\n` + needsConfirmation.map((a) => `• ${a.summary}`).join("\n");

  const pendingId = createPending({
    conversationId,
    toolResultsSoFar: toolResultMessages,
    actions: needsConfirmation,
    summary,
    tier: overallTier,
  });

  conversations.saveMessages(conversationId, messages); // save with the assistant tool_calls turn
  return {
    status: "confirmation_required",
    pendingId,
    summary,
    tier: overallTier,
    actions: needsConfirmation.map(({ toolName, input, summary }) => ({ toolName, input, summary })),
  };
}

/** Entry point for a fresh user message. */
async function handleUserMessage(conversationId, userText) {
  const messages = conversations.getMessages(conversationId);
  messages.push({ role: "user", content: userText });
  conversations.saveMessages(conversationId, messages);
  return step(conversationId);
}

/** Entry point for resolving a pending ask-first/money confirmation. */
async function resolveConfirmation(pendingId, approved) {
  const pending = resolvePending(pendingId);
  if (!pending) {
    return { status: "error", message: "That confirmation has expired or was already resolved." };
  }

  const { conversationId, toolResultsSoFar, actions } = pending;
  const finalResults = [...toolResultsSoFar];

  for (const action of actions) {
    if (approved) {
      const result = performConfirmedAction(action.toolName, action.input);
      activityLog.record({ type: action.toolName, summary: action.summary, tier: action.tier });
      finalResults.push({ role: "tool", tool_call_id: action.toolCallId, content: JSON.stringify(result) });
    } else {
      finalResults.push({
        role: "tool",
        tool_call_id: action.toolCallId,
        content: JSON.stringify({ ok: false, reason: "User declined this action." }),
      });
    }
  }

  const messages = conversations.getMessages(conversationId);
  messages.push(...finalResults);
  conversations.saveMessages(conversationId, messages);

  const result = await step(conversationId, 1);
  return { ...result, conversationId };
}

module.exports = { handleUserMessage, resolveConfirmation };
