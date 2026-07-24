const express = require("express");
const { randomUUID } = require("crypto");
const { handleUserMessage } = require("../lib/agentLoop");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, conversationId } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "`message` (string) is required." });
    }
    const convId = conversationId || randomUUID();
    const result = await handleUserMessage(convId, message);
    res.json({ conversationId: convId, ...result });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    res.status(500).json({ error: "Rika hit an internal error.", detail: String(err.message || err) });
  }
});

router.get("/:conversationId", (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = require("../lib/conversationStore").getMessages(conversationId);
    res.json({ conversationId, messages });
  } catch (err) {
    console.error("[/api/chat/:conversationId] error:", err);
    res.status(500).json({ error: "Rika hit an internal error.", detail: String(err.message || err) });
  }
});

module.exports = router;
