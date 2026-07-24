// Tool definitions in function-calling format:
//   { type: "function", function: { name, description, parameters } }
// Ask-first / money tier tools are described here, but the route layer
// intercepts them and routes through permissions.js.

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

function performConfirmedAction(toolName, input) {
  switch (toolName) {
    case "memory_forget":
      return memory.forget(input.key);
    case "send_message":
    case "schedule_event":
    case "delete_file":
    case "make_purchase":
      return { ok: true, simulated: true };
    default:
      return { ok: false, reason: "Unknown action." };
  }
}

function truncate(str, n) {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

module.exports = { ALL_TOOLS, AUTONOMOUS_EXECUTORS, summarizeAction, performConfirmedAction };
