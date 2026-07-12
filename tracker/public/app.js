// AI Curriculum Tracker — session-first UI. One thing at a time: your current session.
const $ = (s, r = document) => r.querySelector(s);
const el = (t, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(t), props);
  for (const k of kids) n.append(k?.nodeType ? k : document.createTextNode(k ?? ""));
  return n;
};
const api = async (path, opts) => (await fetch(path, { headers: { "content-type": "application/json" }, ...opts })).json();
const fmt = (iso) => (iso ? new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "");

const KIND = {
  setup: "⚙️", watch: "▶️", read: "📖", build: "🔨",
  exercise: "✏️", checkpoint: "✅", note: "📝", paper: "📄", project: "🏆",
};

let STATE = null;

async function load() {
  STATE = await api("/api/state");
  renderStatus();
  renderNow();
  renderPlan();
  renderSettings();
}

function renderStatus() {
  const p = STATE.plan;
  const chip = p.behindWeeks > 0
    ? `<span class="chip bad">${p.behindWeeks}w behind</span>`
    : p.behindWeeks < 0 ? `<span class="chip good">${-p.behindWeeks}w ahead</span>`
    : `<span class="chip good">on track</span>`;
  $("#statusbar").innerHTML =
    `<div class="bar"><i style="width:${p.percent}%"></i></div>` +
    `<b>${p.percent}%</b> · ${p.doneSteps}/${p.totalSteps} steps · ${chip}`;
}

async function toggleStep(id, done) {
  STATE = await api(`/api/steps/${encodeURIComponent(id)}/toggle`, { method: "POST", body: JSON.stringify({ done }) });
  renderStatus(); renderNow(); renderPlan();
}

function stepRow(step, { highlight = false } = {}) {
  const row = el("div", { className: "row step" + (step.done ? " done" : "") + (highlight ? " current" : "") });
  const cb = el("input", { type: "checkbox", checked: !!step.done });
  cb.onchange = () => toggleStep(step.id, cb.checked);
  row.append(cb, el("span", { className: "badge", title: step.kind }, KIND[step.kind] || "•"));
  const ttl = el("span", { className: "ttl" }, step.title);
  if (highlight && !step.done) ttl.append(el("span", { className: "cap" }, "  ← start here"));
  row.append(ttl, el("span", { className: "date" }, `~${step.minutes}m`));
  if (step.url) row.append(el("a", { href: step.url, target: "_blank", rel: "noopener", className: "openbtn", title: "open resource" }, "↗"));
  return row;
}

function renderNow() {
  const root = $("#tab-now");
  root.innerHTML = "";
  const p = STATE.plan;
  if (!p.queue.length) { root.append(el("p", { style: "padding:20px" }, "🎓 Every step done. Go reproduce a paper.")); return; }

  // Recently done — context, and un-tickable (checkbox stays live so you can undo)
  if (p.recentDone.length) {
    root.append(el("div", { className: "phase-h" },
      el("span", {}, "◀ Recently done"), el("span", {}, "untick to undo")));
    const c = el("div", { className: "card muted" });
    p.recentDone.forEach((s) => c.append(stepRow(s)));
    root.append(c);
  }

  // Current week header
  const head = el("div", { className: "card", style: "padding:12px 14px;margin-bottom:8px" });
  head.append(el("div", { className: "cap" }, p.currentPhase),
    el("div", { style: "font-weight:700;font-size:16px;margin-top:2px" }, p.currentWeekTitle));
  root.append(head);

  // Up next — the rolling queue (~one sitting)
  root.append(el("div", { className: "phase-h" },
    el("span", {}, "▶ Up next"), el("span", {}, `~${(p.queueMinutes / 60).toFixed(1)}h`)));
  const card = el("div", { className: "card" });
  p.queue.forEach((s, i) => card.append(stepRow(s, { highlight: i === 0 })));
  root.append(card);
  root.append(el("p", { className: "hint", style: "margin-top:8px" },
    `≈ your ${p.sessionMinutes}-min sitting. Do what fits — unfinished steps carry to next time.`));

  renderNoteEditor(root);
}

function renderNoteEditor(root) {
  const n = STATE.note;
  if (!n) return;
  root.append(el("div", { className: "phase-h" },
    el("span", {}, "📝 This week's note"), el("span", {}, `notes/${n.weekId}.md`)));

  const ta = el("textarea", { value: n.body, spellcheck: true });
  ta.style.cssText = "width:100%;min-height:190px;padding:12px;border-radius:10px;border:1px solid var(--line);" +
    "background:var(--card);color:var(--ink);font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical;box-sizing:border-box";

  const status = el("span", { className: "hint" });
  const saveBtn = el("button", { className: "btn" }, "Save & push to GitHub");
  const localBtn = el("button", { className: "btn ghost" }, "Save only");

  const save = async (push) => {
    saveBtn.disabled = localBtn.disabled = true;
    status.textContent = push ? "Committing…" : "Saving…";
    try {
      const r = await api(`/api/notes/${encodeURIComponent(n.weekId)}`, {
        method: "PUT", body: JSON.stringify({ body: ta.value, push }),
      });
      if (r.error) { status.innerHTML = `⚠️ ${r.error}`; }
      else if (r.pushed) {
        status.innerHTML = `✅ Committed — <a href="${r.commitUrl}" target="_blank" rel="noopener">view on GitHub ↗</a>`;
      } else { status.textContent = "✅ Saved."; }
      if (r.plan) { STATE = r; renderStatus(); renderPlan(); }
    } catch (e) {
      status.textContent = "⚠️ " + e.message;
    }
    saveBtn.disabled = localBtn.disabled = false;
  };
  saveBtn.onclick = () => save(true);
  localBtn.onclick = () => save(false);

  const box = el("div", { className: "card", style: "padding:14px" });
  box.append(ta, el("div", { className: "form-row", style: "margin-top:10px" }, saveBtn, localBtn, status));
  if (!STATE.githubReady) {
    box.append(el("p", { className: "hint" }, "GitHub push not configured — set the GITHUB_TOKEN secret to enable auto-commit."));
  }
  root.append(box);
}

function renderPlan() {
  const root = $("#tab-plan");
  root.innerHTML = "";
  const p = STATE.plan;
  for (const w of p.weeks) {
    const hrs = (w.totalMinutes / 60).toFixed(1);
    root.append(el("div", { className: "phase-h" },
      el("span", {}, `${w.phase} · ${w.title}`), el("span", {}, `${w.doneSteps}/${w.totalSteps} · ~${hrs}h`)));
    const c = el("div", { className: "card", style: "margin-bottom:8px" });
    w.steps.forEach((s) => c.append(stepRow(s, { highlight: s.id === p.nextStepId })));
    root.append(c);
  }
}

function renderSettings() {
  const root = $("#tab-settings");
  const s = STATE.settings, p = STATE.plan;
  root.innerHTML = "";
  const start = el("input", { type: "date", value: s.start_date });
  const slen = el("input", { type: "number", step: "15", min: "30", value: s.session_minutes, style: "width:90px" });
  const remind = el("input", { type: "checkbox", checked: (s.reminder_enabled ?? "1") !== "0" });

  const active = new Set((s.study_days ?? "1,2,3,4,5,6").split(",").map((x) => parseInt(x, 10)));
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const dayBtns = labels.map((lab, d) => {
    const b = el("button", { className: "btn" + (active.has(d) ? "" : " ghost"), style: "width:38px;padding:8px 0",
      title: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d] }, lab);
    b.onclick = () => { active.has(d) ? active.delete(d) : active.add(d); b.className = "btn" + (active.has(d) ? "" : " ghost"); };
    return b;
  });

  const save = el("button", { className: "btn" }, "Save");
  save.onclick = async () => {
    const days = [...active].sort((a, b) => a - b).join(",") || "1,2,3,4,5,6";
    STATE = await api("/api/settings", { method: "PUT", body: JSON.stringify({
      start_date: start.value, session_minutes: slen.value, reminder_enabled: remind.checked ? "1" : "0", study_days: days }) });
    load();
  };
  const test = el("button", { className: "btn ghost" }, "Send test push");
  test.onclick = async () => { const r = await api("/api/test-reminder", { method: "POST" }); alert(r.sent ? `Pushed session ${r.session} ✓` : "Not sent — ntfy topic not set."); };

  root.append(
    el("div", { className: "phase-h" }, "Schedule"),
    el("div", { className: "card", style: "padding:14px" },
      el("div", { className: "form-row" }, el("label", { className: "field" }, "Start date", start), el("label", { className: "field" }, "Minutes per session", slen)),
      el("p", { className: "hint", style: "margin:6px 0 0" }, "Study days (a daily push lands on these):"),
      el("div", { className: "form-row" }, ...dayBtns),
      el("div", { className: "form-row" }, remind, el("span", {}, "Daily push reminder (on study days)")),
      el("div", { className: "form-row" }, save, test),
      el("p", { className: "hint" }, `${p.weeks.length} weeks · finishes ~${fmt(p.finishEstimate)}`)),
    el("div", { className: "phase-h" }, "Phone reminders (ntfy.sh)"),
    el("div", { className: "card", style: "padding:14px" },
      el("p", { className: "hint" }, "Subscribe to your private topic in the free ntfy app to get the daily push. Use 'Send test push' to check it."))
  );
}

function showTab(name) {
  for (const b of document.querySelectorAll(".tabs button")) b.classList.toggle("active", b.dataset.tab === name);
  for (const t of document.querySelectorAll(".tab")) t.classList.toggle("hidden", t.id !== "tab-" + name);
}
document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));

load();
