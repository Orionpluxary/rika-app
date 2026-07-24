const express = require("express");
const { resolveConfirmation } = require("../lib/agentLoop");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { pendingId, approve } = req.body || {};
    if (!pendingId || typeof approve !== "boolean") {
      return res.status(400).json({ error: "`pendingId` (string) and `approve` (boolean) are required." });
    }
    const result = await resolveConfirmation(pendingId, approve);
    res.json(result);
  } catch (err) {
    console.error("[/api/confirm] error:", err);
    res.status(500).json({ error: "Rika hit an internal error.", detail: String(err.message || err) });
  }
});

module.exports = router;
