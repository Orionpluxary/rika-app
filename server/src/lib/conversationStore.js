// Conversation history, one JSON file per process, keyed by conversationId.
// Kept deliberately simple — swap for a real database if you need multi-user
// or concurrent-writer support.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const CONV_FILE = path.join(DATA_DIR, "conversations.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONV_FILE)) fs.writeFileSync(CONV_FILE, JSON.stringify({}, null, 2));
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(CONV_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeAll(all) {
  ensureFile();
  fs.writeFileSync(CONV_FILE, JSON.stringify(all, null, 2));
}

function getMessages(conversationId) {
  const all = readAll();
  const messages = all[conversationId] || [];
  return messages.slice(-16);
}

function saveMessages(conversationId, messages) {
  const all = readAll();
  all[conversationId] = messages;
  writeAll(all);
}

function listConversations() {
  const all = readAll();
  return Object.keys(all).map((id) => {
    const msgs = all[id];
    const firstUserText = msgs.find((m) => m.role === "user" && typeof m.content === "string")?.content;
    return { id, messageCount: msgs.length, preview: firstUserText || "(new conversation)" };
  });
}

module.exports = { getMessages, saveMessages, listConversations };
