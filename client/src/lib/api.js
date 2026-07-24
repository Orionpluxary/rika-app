const BASE = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  sendMessage: (conversationId, message) =>
    request("/chat", { method: "POST", body: JSON.stringify({ conversationId, message }) }),
  getConversation: (conversationId) => request(`/chat/${encodeURIComponent(conversationId)}`),
  confirm: (pendingId, approve) =>
    request("/confirm", { method: "POST", body: JSON.stringify({ pendingId, approve }) }),
  getMemory: () => request("/state/memory"),
  forgetMemory: (key) => request(`/state/memory/${encodeURIComponent(key)}`, { method: "DELETE" }),
  getActivity: () => request("/state/activity"),
};
