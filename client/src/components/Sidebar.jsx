import { useEffect, useMemo, useRef, useState } from "react";
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
  const [selectedConnection, setSelectedConnection] = useState("Email");
  const [selectedDevice, setSelectedDevice] = useState("pc");
  const [statuses, setStatuses] = useState({});
  const fileInputRef = useRef(null);

  const liveConnections = useMemo(
    () => [
      { name: "Email", detail: "send an email with confirmation", kind: "account" },
      { name: "Camera", detail: "capture a photo with confirmation", kind: "camera" },
      { name: "Images", detail: "read or describe an image with confirmation", kind: "file" },
      { name: "Video", detail: "read or summarize a video with confirmation", kind: "file" },
      { name: "Calendar", detail: "create or move events with confirmation", kind: "account" },
      { name: "Files", detail: "read, delete, or overwrite files with confirmation", kind: "file" },
      { name: "Messages", detail: "send a message on your behalf with confirmation", kind: "account" },
      { name: "Contacts", detail: "read or update contacts with confirmation", kind: "device" },
      { name: "Location", detail: "check or share location with confirmation", kind: "device" },
      { name: "Microphone", detail: "record audio with confirmation", kind: "microphone" },
      { name: "Downloads", detail: "save or fetch files with confirmation", kind: "file" },
    ],
    []
  );

  const connections = liveConnections;

  const devicePermissions = {
    pc: {
      label: "PC",
      note: "Best for files, browser tasks, and long responses.",
      granted: ["Email", "Images", "Video", "Calendar", "Files", "Messages", "Microphone", "Downloads"],
      ask: ["Camera", "Contacts", "Location"],
      blocked: ["Payments"],
    },
    mobile: {
      label: "Mobile",
      note: "Best for camera, contacts, and location.",
      granted: ["Email", "Camera", "Images", "Video", "Calendar", "Messages", "Contacts", "Location", "Microphone"],
      ask: ["Files", "Downloads"],
      blocked: ["Payments"],
    },
    tablet: {
      label: "Tablet",
      note: "Balanced access with a lighter file surface.",
      granted: ["Email", "Camera", "Images", "Video", "Calendar", "Messages", "Contacts"],
      ask: ["Files", "Location", "Microphone", "Downloads"],
      blocked: ["Payments"],
    },
    other: {
      label: "Other",
      note: "Custom or limited permissions depending on the device.",
      granted: ["Email", "Images", "Video", "Messages"],
      ask: ["Camera", "Calendar", "Contacts", "Location", "Files", "Microphone", "Downloads"],
      blocked: ["Payments"],
    },
  };

  const activeDevice = devicePermissions[selectedDevice];

  function permissionFor(connectionName) {
    if (statuses[connectionName]) return statuses[connectionName];
    if (activeDevice.granted.includes(connectionName)) return "ready";
    if (activeDevice.ask.includes(connectionName)) return "needs permission";
    return "limited";
  }

  function updateStatus(name, status) {
    setStatuses((current) => ({ ...current, [name]: status }));
  }

  async function requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      updateStatus("Camera", "connected");
    } catch {
      updateStatus("Camera", "blocked");
    }
  }

  async function requestMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      updateStatus("Microphone", "connected");
    } catch {
      updateStatus("Microphone", "blocked");
    }
  }

  async function requestLocation() {
    if (!navigator.geolocation) {
      updateStatus("Location", "unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => updateStatus("Location", "connected"),
      () => updateStatus("Location", "blocked"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function requestFile(kind) {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = kind === "image" ? "image/*" : kind === "video" ? "video/*" : "*/*";
    fileInputRef.current.click();
  }

  async function handleConnectionClick(item) {
    setSelectedConnection(item.name);
    if (item.name === "Camera") return requestCamera();
    if (item.name === "Microphone") return requestMicrophone();
    if (item.name === "Location") return requestLocation();
    if (item.name === "Images") return requestFile("image");
    if (item.name === "Video") return requestFile("video");
    if (item.name === "Files") return requestFile("file");
    if (item.name === "Downloads") return requestFile("file");
    updateStatus(item.name, "connect account");
  }

  function handleFilePick(event) {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      updateStatus(selectedConnection, "connected");
    }
    event.target.value = "";
  }

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
            <SectionLabel>permission center</SectionLabel>
            <p className="text-[13px] text-muted">Tap a connector to highlight it, then request access. Real browser prompts work for camera, mic, location, and files.</p>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(devicePermissions).map(([key, device]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDevice(key)}
                  className={`rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                    selectedDevice === key
                      ? "border-ink bg-white text-ink shadow-hairline"
                      : "border-ink/10 bg-white/70 text-muted hover:border-ink/20 hover:text-ink-soft"
                  }`}
                  aria-pressed={selectedDevice === key}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink-soft">{device.label}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted">{key}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{device.note}</div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink-soft">{activeDevice.label} permissions</span>
                <span className="rounded-full border border-ink/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                  {selectedDevice}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted">{activeDevice.note}</div>
            </div>

            <ul className="space-y-2">
              {connections.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleConnectionClick(item)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-[12.5px] transition ${
                      selectedConnection === item.name
                        ? "border-ink bg-white shadow-hairline"
                        : "border-ink/10 bg-white/80 hover:border-ink/20 hover:bg-white"
                    }`}
                    aria-pressed={selectedConnection === item.name}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-ink-soft">{item.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                          permissionFor(item.name) === "connected"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : permissionFor(item.name) === "connect account"
                              ? "border-sky-200 bg-sky-50 text-sky-700"
                              : permissionFor(item.name) === "needs permission"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : permissionFor(item.name) === "blocked"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-stone-200 bg-stone-50 text-stone-700"
                        }`}
                      >
                        {permissionFor(item.name)}
                      </span>
                    </div>
                    <div className="mt-1 text-muted">{item.detail}</div>
                    {item.kind === "camera" || item.kind === "microphone" || item.kind === "device" || item.kind === "file" ? (
                      <div className="mt-2 text-[11px] text-muted">
                        {selectedConnection === item.name ? "Click to ask the browser for access." : "Can request access directly."}
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-muted">Needs a connected account or provider integration.</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-ink-soft">Selected connector</span>
                <span className="text-[10px] uppercase tracking-wide text-muted">{selectedConnection}</span>
              </div>
              <div className="mt-1 text-muted">
                {connections.find((item) => item.name === selectedConnection)?.detail}
              </div>
            </div>

            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />
          </div>
        )}
      </div>
    </aside>
  );
}
