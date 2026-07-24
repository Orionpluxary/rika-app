import { useRef, useState, useEffect } from "react";
import LogoFrame from "./components/LogoFrame.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MessageBubble from "./components/MessageBubble.jsx";
import Composer from "./components/Composer.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import { Sparkle, VineRule } from "./components/SparkleDecor.jsx";
import { api } from "./lib/api.js";

const STORAGE_KEY = "rika.conversationId";

function newConversationId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function toUiMessage(message) {
  if (!message || typeof message !== "object") return null;
  const text = typeof message.content === "string" ? message.content : typeof message.text === "string" ? message.text : "";
  if (!text) return null;
  return { role: message.role, text };
}

export default function App() {
  const [conversationId, setConversationId] = useState(() => localStorage.getItem(STORAGE_KEY) || newConversationId());
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, pending]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, conversationId);
    let cancelled = false;

    async function loadConversation() {
      setThinking(true);
      setError(null);
      setPending(null);
      try {
        const result = await api.getConversation(conversationId);
        if (cancelled) return;
        setMessages((result.messages || []).map(toUiMessage).filter(Boolean));
      } catch (err) {
        if (cancelled) return;
        setMessages([]);
        setError(err.message);
      } finally {
        if (!cancelled) setThinking(false);
      }
    }

    loadConversation();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  function startNewConversation() {
    const nextId = newConversationId();
    localStorage.setItem(STORAGE_KEY, nextId);
    setConversationId(nextId);
    setMessages([]);
    setPending(null);
    setError(null);
    setThinking(false);
  }

  async function handleSend(text) {
    setError(null);
    setMessages((m) => [...m, { role: "user", text }]);
    setThinking(true);
    try {
      const result = await api.sendMessage(conversationId, text);
      applyResult(result);
    } catch (err) {
      setError(err.message);
      setThinking(false);
    }
  }

  function applyResult(result) {
    if (result.status === "confirmation_required") {
      setPending(result);
      setThinking(false);
    } else if (result.status === "done") {
      setMessages((m) => [...m, { role: "assistant", text: result.text }]);
      setThinking(false);
      setRefreshKey((k) => k + 1); // memory/activity may have changed
    } else {
      setError(result.message || "Something went wrong.");
      setThinking(false);
    }
  }

  async function handleResolveConfirm(approve) {
    const pendingId = pending.pendingId;
    setPending(null);
    setThinking(true);
    try {
      const result = await api.confirm(pendingId, approve);
      applyResult(result);
    } catch (err) {
      setError(err.message);
      setThinking(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper">
      <Sidebar onNewConversation={startNewConversation} refreshKey={refreshKey} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* header */}
        <header className="relative flex flex-col items-center gap-3 border-b border-ink/12 px-6 pb-5 pt-8">
          <LogoFrame />
          <div className="text-center">
            <h1 className="font-display text-2xl italic tracking-wide text-ink">Rika</h1>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">personal app</p>
          </div>
          <VineRule className="h-3 w-56 text-ink/25" />
        </header>

        {/* messages */}
        <main ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.length === 0 && !thinking && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <Sparkle size={22} className="text-ink/30" animate />
              <p className="max-w-xs text-[13.5px] text-muted">
                say something — Rika reads, writes, and forgets memory on request, searches the web, and asks
                before she ever sends, deletes, schedules, or spends anything.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.text} />
          ))}

          {thinking && (
            <div className="flex items-center gap-2 pl-1 text-[12.5px] text-muted">
              <Sparkle size={12} animate />
              rika is thinking…
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-md rounded-lg border border-blush-line/60 bg-blush/40 px-4 py-2 text-center text-[13px] text-ink-soft">
              {error}
            </div>
          )}
        </main>

        <Composer onSend={handleSend} disabled={thinking || !!pending} />
      </div>

      <ConfirmModal pending={pending} onResolve={handleResolveConfirm} />
    </div>
  );
}
