// Plain append-only record of state-changing actions.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const LOG_FILE = path.join(DATA_DIR, "activity.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeAll(entries) {
  ensureFile();
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2));
}

/**
 * @param {{type:string, summary:string, tier:'autonomous'|'ask-first'|'money'}} entry
 */
function record(entry) {
  const entries = readAll();
  const logged = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  entries.unshift(logged);
  // Keep the log bounded — this is a status feed, not an archive.
  writeAll(entries.slice(0, 200));
  return logged;
}

function list(limit = 50) {
  return readAll().slice(0, limit);
}

module.exports = { record, list };
