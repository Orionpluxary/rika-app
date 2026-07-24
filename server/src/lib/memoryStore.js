// Durable memory store — one JSON file on disk.
// Section 12: only user-stated facts are stored; "forget" is a real delete,
// not a soft flag; a repeated key with a new value overwrites the old one.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MEMORY_FILE = path.join(DATA_DIR, "memory.json");

const SENSITIVE_KEY_HINTS = [
  "password", "passcode", "ssn", "social security", "credit card",
  "card number", "cvv", "bank account", "routing number", "pin",
  "diagnosis", "medication", "health condition", "medical",
];

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, JSON.stringify({}, null, 2));
}

function readAll() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeAll(obj) {
  ensureFile();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(obj, null, 2));
}

function looksSensitive(key, value) {
  const haystack = `${key} ${value}`.toLowerCase();
  return SENSITIVE_KEY_HINTS.some((hint) => haystack.includes(hint));
}

/** @returns {{key:string, value:string}[]} */
function list() {
  const all = readAll();
  return Object.entries(all).map(([key, value]) => ({ key, value }));
}

function get(key) {
  const all = readAll();
  return Object.prototype.hasOwnProperty.call(all, key) ? all[key] : null;
}

/** Set a fact. Newer value silently overwrites an older one for the same key. */
function set(key, value) {
  if (looksSensitive(key, value)) {
    return { ok: false, reason: "I don't store sensitive categories like health, financial account, or credential details." };
  }
  const all = readAll();
  all[key] = value;
  writeAll(all);
  return { ok: true };
}

/** Real delete — the key is actually removed from the file, not marked old. */
function forget(key) {
  const all = readAll();
  const existed = Object.prototype.hasOwnProperty.call(all, key);
  delete all[key];
  writeAll(all);
  return { ok: true, existed };
}

function forgetAll() {
  writeAll({});
  return { ok: true };
}

module.exports = { list, get, set, forget, forgetAll };
