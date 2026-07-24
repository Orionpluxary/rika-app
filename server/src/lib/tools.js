// Tool definitions in OpenAI/Groq function-calling format:
//   { type: "function", function: { name, description, parameters } }
// Ask-first / money tier tools are *described* here (schema + how to build
// a one-line summary + a stub effect) but are never executed directly by
// this file — routes/chat.js's agent loop intercepts them and routes
// through permissions.js.

const memory = require("./memoryStore");
const { webSearch } = require("./webSearch");

function tool(name, description, properties, required) {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters: { type: "object", properties, required },
    },
  };
}

const ALL_TOOLS = [
  tool(
    "web_search",
    "Live web search.",
    { query: { type: "string", description: "Query." } },
    ["query"]
  ),
  tool(
    "memory_read",
    "Read a stored fact.",
    { key: { type: "string", description: "Fact key." } },
    ["key"]
  ),
  tool(
    "memory_write",
    "Store a user-provided fact.",
    {
      key: { type: "string", description: "Fact key." },
      value: { type: "string", description: "Fact value." },
    },
    ["key", "value"]
  ),
  tool(
    "memory_forget",
    "Delete a stored fact.",
    { key: { type: "string", description: "Fact key." } },
    ["key"]
  ),
  tool(
    "send_message",
    "Send a message on the user's behalf.",
    {
      to: { type: "string", description: "Recipient." },
      channel: { type: "string", description: "Channel." },
      body: { type: "string", description: "Message." },
    },
    ["to", "channel", "body"]
  ),
  tool(
    "schedule_event",
    "Create or move a calendar event.",
    {
      title: { type: "string" },
      when: { type: "string", description: "When." },
    },
    ["title", "when"]
  ),
  tool(
    "delete_file",
    "Delete or overwrite a file.",
    { path: { type: "string" } },
    ["path"]
  ),
  tool(
    "make_purchase",
    "Spend the user's money.",
    {
      item: { type: "string" },
      amount: { type: "string", description: "Amount." },
    },
    ["item", "amount"]
  ),
];

/** Tools the model can call and get a result back from in the same turn. */
const AUTONOMOUS_EXECUTORS = {
  web_search: async (input) => {
    try {
      return await webSearch(input.query);
    } catch (err) {
      return { results: [], error: String(err.message || err) };
    }
  },
  memory_read: (input) => {
    const value = memory.get(input.key);
    return value === null ? { found: false } : { found: true, value };
  },
  memory_write: (input) => memory.set(input.key, input.value),
};

/** Human-readable one-line summary for the ask-first confirmation UI (Section 5). */
function summarizeAction(toolName, input) {
  switch (toolName) {
    case "memory_forget":
      return `Forget the stored fact "${input.key}".`;
    case "send_message":
      return `Send a ${input.channel} to ${input.to}: "${truncate(input.body, 80)}"`;
    case "schedule_event":
      return `Schedule "${input.title}" for ${input.when}.`;
    case "delete_file":
      return `Delete file at ${input.path}.`;
    case "make_purchase":
      return `Purchase "${input.item}" for ${input.amount}.`;
    default:
      return `Run ${toolName} with ${JSON.stringify(input)}.`;
  }
}

/** Runs the actual (stub) effect once a pending action has been confirmed. */
function performConfirmedAction(toolName, input) {
  switch (toolName) {
    case "memory_forget":
      return memory.forget(input.key);
    case "send_message":
    case "schedule_event":
    case "delete_file":
    case "make_purchase":
      // Illustrative stubs — wire these up to real integrations (email API,
      // calendar API, filesystem, payment provider) as you extend Rika.
      return { ok: true, simulated: true };
    default:
      return { ok: false, reason: "Unknown action." };
  }
}

function truncate(str, n) {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

module.exports = { ALL_TOOLS, AUTONOMOUS_EXECUTORS, summarizeAction, performConfirmedAction };
