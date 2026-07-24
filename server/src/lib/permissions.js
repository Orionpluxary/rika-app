// Section 5 — Permission tiers for actions.
//
// autonomous : runs immediately, no user go-ahead needed.
// ask-first  : runs only after the user confirms via the UI.
// money      : same as ask-first, but additionally requires the
//              MONEY_ACTIONS_ENABLED env flag to even be attempted —
//              this is the "separately-configured permission" the spec
//              requires and it must be a deliberate setup step, not
//              something a system prompt alone can grant.

const TOOL_TIERS = {
  web_search: "autonomous", // custom DuckDuckGo-backed tool — see lib/webSearch.js
  memory_read: "autonomous",
  memory_write: "autonomous",
  memory_forget: "ask-first", // deletion is user-visible/irreversible enough to confirm
  send_message: "ask-first",
  schedule_event: "ask-first",
  delete_file: "ask-first",
  make_purchase: "money",
};

function tierOf(toolName) {
  return TOOL_TIERS[toolName] || "ask-first"; // unknown tool -> higher tier, per Section 5
}

// Pending confirmations, keyed by id. In-memory is fine for a single-user
// personal agent; swap for a real store if Rika ever serves multiple users.
const pending = new Map();

function createPending({ toolName, input, summary, tier }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  pending.set(id, { id, toolName, input, summary, tier, createdAt: Date.now() });
  return id;
}

function getPending(id) {
  return pending.get(id) || null;
}

function resolvePending(id) {
  const item = pending.get(id);
  pending.delete(id);
  return item;
}

function moneyActionsEnabled() {
  return process.env.MONEY_ACTIONS_ENABLED === "true";
}

module.exports = { tierOf, createPending, getPending, resolvePending, moneyActionsEnabled };
