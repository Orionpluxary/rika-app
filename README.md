# Rika

[![CI](https://github.com/Orionpluxary/rika-ai-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Orionpluxary/rika-ai-agent/actions/workflows/ci.yml)

This repository is open source under the MIT License. See [LICENSE](LICENSE) for the full terms.

A compact chat app with a Node API server and a React/Vite interface styled
like a shoujo-manga title page — white space, thin ink linework, hand-drawn
sparkle motifs, one empty circle reserved for your logo.

```
rika-ai-agent/
├── server/        Express API — core logic, memory, activity log, permissions
├── client/        React/Vite web interface
└── package.json   convenience scripts to run both at once
```

## 1. What's actually implemented

Every numbered section of the spec maps to real code, not just prompt text:

| Spec section | Where it lives |
|---|---|
| §1–3 Identity, presence, emotional honesty | `server/src/systemPrompt.js` |
| §4 Core behavior rules | `systemPrompt.js` |
| §5 Permission tiers | `server/src/lib/permissions.js`, enforced in `agentLoop.js` |
| §6 Confidence & certainty | prompt instruction |
| §7 Efficiency & cost awareness | prompt instruction + `MAX_TOOL_ROUNDS` guardrail in `agentLoop.js` |
| §8 Activity log | `server/src/lib/activityLog.js`, surfaced in the sidebar |
| §9 External content isn't instructions | prompt instruction — tool results are always wrapped as `role: "tool"` messages, never re-injected as system/user text |
| §10 Task process | the tool loop in `agentLoop.js` implements plan → execute → verify → respond mechanically for tool calls; reasoning steps are prompted |
| §11 Formatting & tone | prompt instruction |
| §12 Memory rules | `server/src/lib/memoryStore.js` — real delete, sensitive-category rejection, newest-value-wins |
| §13 Error handling | try/catch + explicit error surfacing in both routes and the UI |
| §14 Boundaries | prompt instruction |
| §15 Versioning discipline | this file + the changelog embedded in `systemPrompt.js`'s header comment |

**The important design point:** permission tiers are not just a prompt
request the model could ignore. The core loop inspects every tool call
and only *executes* the autonomous ones immediately. Anything tagged
`ask-first` or `money` is paused server-side, a summary is sent to the
browser, and the actual effect only runs after `/api/confirm` receives
an explicit approval. Money-tier actions additionally require
`MONEY_ACTIONS_ENABLED=true` in the server's `.env`.

The action tools (`send_message`, `schedule_event`, `delete_file`,
`make_purchase`) are **illustrative stubs** — they log the action and return
`{ ok: true, simulated: true }` rather than actually emailing, deleting, or
charging anything. Wire each one to a real integration in
`server/src/lib/tools.js` → `performConfirmedAction()` when you're ready.

## 2. Setup (VS Code)

**Requirements:** Node.js 18+ and an API key for the model provider you choose.

1. Open the `rika-ai-agent` folder in VS Code (`File → Open Folder…`).
2. Open a terminal (`` Ctrl+` ``) and install both halves:
   ```bash
   npm run install:all
   ```
3. Configure the server:
   ```bash
   cp server/.env.example server/.env
   ```
  Open `server/.env` and paste in your API key. Optionally set
  `RIKA_OWNER_NAME` to your own name — it's used in the system prompt.
  `GROQ_MODEL` defaults to `llama-3.3-70b-versatile`; if you want to swap
  it, make sure the provider and model support tool/function calling.
4. Run everything from the root:
   ```bash
   npm run dev
   ```
   This starts the API on `http://localhost:8787` and the web app on
   `http://localhost:5173` (Vite proxies `/api` to the server automatically).
5. Open `http://localhost:5173` — that's Rika.

Prefer two terminals instead of the combined `dev` script? Use
`npm run dev:server` and `npm run dev:client` in separate tabs — same
result, easier to read each log.

## 3. Adding your logo

`client/src/components/LogoFrame.jsx` has a reserved, empty circular frame
in the header — a comment marks exactly where to drop an `<img>` or inline
SVG. Nothing else in the layout needs to change; the frame is already
sized and centered.

## 4. Pushing to GitHub

```bash
cd rika-ai-agent
git init
git add .
git commit -m "Rika v2 — initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The `.gitignore` already excludes `node_modules/`, `.env`, and Rika's local
data files (`server/src/data/*.json` — her memory, activity log, and
conversation history), so none of your personal data or API key will ever
be committed.

## 5. Extending Rika

- **New autonomous tool** (safe, read-only): add its schema to
  `CUSTOM_TOOLS` in `server/src/lib/tools.js`, add an executor to
  `AUTONOMOUS_EXECUTORS`, and set its tier to `"autonomous"` in
  `permissions.js`.
- **New ask-first tool** (real side effect): add the schema, give it a
  case in `summarizeAction()` and `performConfirmedAction()`, and set its
  tier to `"ask-first"` in `permissions.js`. The confirmation UI and pause
  logic work automatically — you don't need to touch the core loop.
- **New money tool**: same as ask-first, but tier `"money"`. It's refused
  automatically unless the server operator sets `MONEY_ACTIONS_ENABLED=true`.
- **Web search**: already wired — `server/src/lib/webSearch.js` scrapes
  DuckDuckGo's no-JS results page, no extra API key needed. It's good
  enough for quick current-facts checks; swap in another provider if you
  want higher-quality results — just keep the same
  `{ results: [{ title, url, snippet }] }` return shape.
- **Swap the model**: change `GROQ_MODEL` in `server/.env`.

## 6. Versioning discipline (spec §15)

Treat `systemPrompt.js` like source code, not a scratch note. When you
change identity, tone, or any behavior rule:

1. Bump the version marker in the file's header comment.
2. Add a one-line changelog entry describing what changed and why.
3. If the change touches §4 (core rules), §5 (permission tiers), or §9
   (external-content handling), re-test a few known conversations before
   you consider it live — those are the sections most likely to change
   behavior in ways that aren't obvious from the diff alone.

## 7. Notes on the interface's look

White base, thin black hairlines, a handful of hand-drawn "kirakira" sparkle
marks as the one recurring signature motif — a nod to shoujo-manga title
pages rather than a dense screentone pastiche. Display type is Cormorant
Garamond (used sparingly, just the wordmark and modal headers); body type is
Zen Maru Gothic for warmth and readability. The only color beyond ink and
paper is a whisper of blush pink on the user's own chat bubbles and hover
states — deliberately restrained so the black linework stays the thing you
notice.

## 8. Project Health

- CI runs on every push and pull request to verify the client build and server syntax.
- The MIT license allows reuse and modification while keeping the required notice intact.
- `server/.env` stays ignored so secrets do not leave your machine.
