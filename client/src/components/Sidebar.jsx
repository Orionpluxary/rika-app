import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { VineRule, SmallSpark } from "./SparkleDecor.jsx";

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
      <SmallSpark size={8} className="text-ink/40" />
      {children}
    </div>
  );
}

export default function Sidebar({ onNewConversation, refreshKey }) {
  const [memory, setMemory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tab, setTab] = useState("memory");

  const connections = [
    { name: "Email", status: "available", detail: "send an email with confirmation" },
    { name: "Camera", status: "available", detail: "capture a photo with confirmation" },
    { name: "Images", status: "available", detail: "read or describe an image with confirmation" },
    { name: "Video", status: "available", detail: "read or summarize a video with confirmation" },
    { name: "Calendar", status: "available", detail: "create or move events with confirmation" },
    { name: "Files", status: "available", detail: "read, delete, or overwrite files with confirmation" },
    { name: "Messages", status: "available", detail: "send a message on your behalf with confirmation" },
  ];

  useEffect(() => {
    api.getMemory().then((r) => setMemory(r.items)).catch(() => {});
    api.getActivity().then((r) => setActivity(r.items)).catch(() => {});
  }, [refreshKey]);

  async function handleForget(key) {
    await api.forgetMemory(key);
    setMemory((m) => m.filter((item) => item.key !== key));
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-ink/12 bg-paper-soft/60">
      <div className="px-5 pt-6">
        <button
          onClick={onNewConversation}
          className="w-full rounded-full border border-ink/25 px-4 py-2 text-[13px] tracking-wide text-ink transition hover:bg-blush/50"
        >
          + new conversation
        </button>
      </div>

      <div className="px-5 pt-6">
        <VineRule className="h-3 w-full text-ink/25" />
      </div>

      <div className="flex gap-4 px-5 pt-4 text-[11px] uppercase tracking-[0.2em]">
        {["memory", "activity", "connections"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 transition ${tab === t ? "border-b border-ink text-ink" : "text-muted hover:text-ink-soft"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === "memory" && (
          <div className="space-y-3">
            <SectionLabel>what rika remembers</SectionLabel>
            {memory.length === 0 && <p className="text-[13px] text-muted">nothing stored yet.</p>}
            <ul className="space-y-2">
              {memory.map((item) => (
                <li
                  key={item.key}
                  className="group flex items-start justify-between gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-[12.5px]"
                >
                  <div>
                    <div className="font-medium text-ink-soft">{item.key}</div>
                    <div className="text-muted">{item.value}</div>
                  </div>
                  <button
                    onClick={() => handleForget(item.key)}
                    className="shrink-0 text-[10px] uppercase tracking-wide text-muted opacity-0 transition hover:text-ink group-hover:opacity-100"
                  >
                    forget
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-3">
            <SectionLabel>action log</SectionLabel>
            {activity.length === 0 && <p className="text-[13px] text-muted">no actions taken yet.</p>}
            <ul className="space-y-2">
              {activity.map((item) => (
                <li key={item.id} className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink-soft">{item.type}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted">{item.tier}</span>
                  </div>
                  <div className="text-muted">{item.summary}</div>
                  <div className="mt-1 text-[10px] text-muted/70">{new Date(item.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "connections" && (
          <div className="space-y-3">
            <SectionLabel>available connections</SectionLabel>
            <p className="text-[13px] text-muted">Rika keeps these task-focused and confirmation-based.</p>
            <ul className="space-y-2">
              {connections.map((item) => (
                <li key={item.name} className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-[12.5px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ink-soft">{item.name}</span>
                    <span className="rounded-full border border-ink/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-1 text-muted">{item.detail}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
