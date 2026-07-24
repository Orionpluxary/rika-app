const express = require("express");
const memory = require("../lib/memoryStore");
const activityLog = require("../lib/activityLog");
const conversations = require("../lib/conversationStore");

const router = express.Router();

router.get("/memory", (req, res) => res.json({ items: memory.list() }));

router.delete("/memory/:key", (req, res) => {
  const result = memory.forget(req.params.key);
  res.json(result);
});

router.get("/activity", (req, res) => res.json({ items: activityLog.list() }));

router.get("/conversations", (req, res) => res.json({ items: conversations.listConversations() }));

module.exports = router;
