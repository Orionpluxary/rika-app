require("dotenv").config();
const express = require("express");
const cors = require("cors");

const chatRoute = require("./routes/chat");
const confirmRoute = require("./routes/confirm");
const stateRoute = require("./routes/state");

const app = express();
const PORT = process.env.PORT || 8787;

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "[Rika] GROQ_API_KEY is not set. Copy server/.env.example to server/.env and add your free key from console.groq.com/keys before chatting."
  );
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Rika" }));
app.use("/api/chat", chatRoute);
app.use("/api/confirm", confirmRoute);
app.use("/api/state", stateRoute);

app.listen(PORT, () => {
  console.log(`[Rika] server listening on http://localhost:${PORT}`);
});
