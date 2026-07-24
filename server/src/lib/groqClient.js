// Groq speaks the OpenAI Chat Completions wire format. We call it directly
// with fetch — no extra SDK dependency needed on Node 18+.

const GROQ_BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_TOKENS = Number(process.env.MAX_TOKENS || 1500);

async function chatCompletion({ system, messages, tools }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not set. Copy server/.env.example to server/.env and add your free key from console.groq.com/keys."
    );
  }

  const body = {
    model: MODEL,
    max_completion_tokens: MAX_TOKENS,
    messages: [{ role: "system", content: system }, ...messages],
  };
  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq API error (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) throw new Error("Groq API returned no choices.");
  return choice.message; // { role, content, tool_calls? }
}

module.exports = { chatCompletion, MODEL };
