// AI Curriculum Tracker — vanilla SPA. Talks to /api/*.
const $ = (s, r = document) => r.querySelector(s);
const el = (t, props = {}, ...kids) => {
  const n = Object.assign(document.createElement(t), props);
  for (const k of kids) n.append(k?.nodeType ? k : document.createTextNode(k ?? ""));
  return n;
};
const api = async (path, opts) => {
  const r = await fetch(path, { headers: { "content-type": "application/json" }, ...opts });
  return r.json();
};
const fmt = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

let STATE = null;
let selectedPhase = null;

function embedUrl(url) {
  try {
    const u = new URL(url);
    if (u.searchParams.get("list")) return "https://www.youtube.com/embed/videoseries?list=" + u.searchParams.get("list");
    if (u.hostname.includes("youtu.be")) return "https://www.youtube.com/embed/" + u.pathname.slice(1);
    if (u.searchParams.get("v")) return "https://www.youtube.com/embed/" + u.searchParams.get("v");
  } catch {}
  return null;
}

async function load() {
  STATE = await api("/api/state");
  if (!selectedPhase) selectedPhase = STATE.schedule.status.currentPhase;
  renderStatus();
  renderTimetable();
  renderChecklist();
  renderResources();
  renderSettings();
}

function renderStatus() {
  const s = STATE.schedule.status;
  const chip = s.behind > 0
    ? `<span class="chip bad">${s.behind}w behind</span>`
    : s.behind < 0 ? `<span class="chip good">${-s.behind}w ahead</span>`
    : `<span class="chip good">on track</span>`;
  $("#statusbar").innerHTML =
    `<div class="bar"><i style="width:${s.percent}%"></i></div>` +
    `<b>${s.percent}%</b> · ${chip} · This week: <b>${s.currentPhase}</b> — ${s.currentTitle} ` +
    `· next: ${s.nextWeekTitle ?? "🎓 done"}`;
}

function phaseOrder() {
  const seen = [];
  for (const m of STATE.milestones) if (!seen.includes(m.phase)) seen.push(m.phase);
  return seen;
}

function renderTimetable() {
  const root = $("#tab-timetable");
  root.innerHTML = "";
  const byId = Object.fromEntries(STATE.milestones.map((m) => [m.id, m]));
  let lastPhase = null, card = null;
  for (const slot of STATE.schedule.slots) {
    if (slot.phase !== lastPhase) {
      lastPhase = slot.phase;
      root.append(el("div", { className: "phase-h" }, el("span", {}, slot.phase),
        el("button", { className: "link", onclick: () => { selectedPhase = slot.phase; showTab("resources"); } }, "resources →")));
      card = el("div", { className: "card" });
      root.append(card);
    }
    const m = slot.milestoneId ? byId[slot.milestoneId] : null;
    const done = m && m.done;
    const isCap = m && /Capstone|★/.test(m.title);
    const row = el("div", { className: "row" + (slot.status === "current" ? " current" : "") + (slot.type === "buffer" ? " buffer" : "") + (done ? " done" : "") });
    if (slot.type === "week" && m) {
      const cb = el("input", { type: "checkbox", checked: !!done });
      cb.onchange = () => toggle(m.id, cb.checked);
      row.append(cb);
    } else {
      row.append(el("span", { style: "width:18px" }, "·"));
    }
    row.append(el("span", { className: "idx" }, "wk " + (slot.index + 1)));
    row.append(el("span", { className: "ttl" }, slot.title, isCap ? el("span", { className: "cap" }, "  CAPSTONE") : ""));
    row.append(el("span", { className: "date" }, fmt(slot.start)));
    card.append(row);
  }
}

function renderChecklist() {
  const root = $("#tab-checklist");
  root.innerHTML = "";
  for (const phase of phaseOrder()) {
    const items = STATE.milestones.filter((m) => m.phase === phase);
    const done = items.filter((m) => m.done).length;
    root.append(el("div", { className: "phase-h" }, el("span", {}, phase), el("span", {}, `${done}/${items.length}`)));
    const card = el("div", { className: "card" });
    for (const m of items) {
      const row = el("div", { className: "row" + (m.done ? " done" : "") });
      const cb = el("input", { type: "checkbox", checked: !!m.done });
      cb.onchange = () => toggle(m.id, cb.checked);
      row.append(cb, el("span", { className: "ttl" }, m.title), el("span", { className: "idx" }, m.id));
      card.append(row);
    }
    root.append(card);
  }
}

function renderResources() {
  const root = $("#tab-resources");
  root.innerHTML = "";
  const sel = el("select");
  for (const p of phaseOrder()) sel.append(el("option", { value: p, selected: p === selectedPhase }, p));
  sel.onchange = () => { selectedPhase = sel.value; renderResources(); };
  root.append(el("div", { className: "form-row" }, el("span", { className: "hint" }, "Phase:"), sel));

  const list = STATE.resources.filter((r) => r.ref === selectedPhase);
  const grid = el("div", { className: "res-grid" });
  for (const r of list) {
    const c = el("div", { className: "card res" });
    c.append(el("div", { className: "k" }, r.kind));
    c.append(el("a", { href: r.url, target: "_blank", rel: "noopener" }, r.title));
    const emb = r.kind === "youtube" ? embedUrl(r.url) : null;
    if (emb) {
      const box = el("div", { className: "embed" });
      box.append(el("iframe", { src: emb, loading: "lazy", allow: "encrypted-media; picture-in-picture", allowFullscreen: true }));
      c.append(box);
    }
    if (r.pinned) {
      const del = el("button", { className: "link", style: "margin-left:8px" }, "remove");
      del.onclick = async () => { await api("/api/resources/" + r.id, { method: "DELETE" }); load(); };
      c.append(del);
    }
    grid.append(c);
  }
  root.append(grid);

  // add-link form
  const t = el("input", { type: "text", placeholder: "Title (e.g. the exact video I'm on)", style: "flex:1;min-width:180px" });
  const u = el("input", { type: "text", placeholder: "https://youtube.com/watch?v=…", style: "flex:2;min-width:220px" });
  const add = el("button", { className: "btn" }, "Pin link");
  add.onclick = async () => {
    if (!t.value || !u.value) return;
    await api("/api/resources", { method: "POST", body: JSON.stringify({ scope: "phase", ref: selectedPhase, title: t.value, url: u.value }) });
    t.value = u.value = ""; load();
  };
  root.append(el("div", { className: "phase-h" }, "Pin your own resource to " + selectedPhase));
  root.append(el("div", { className: "form-row" }, t, u, add));
}

function renderSettings() {
  const root = $("#tab-settings");
  const s = STATE.settings, st = STATE.schedule.status;
  root.innerHTML = "";
  const start = el("input", { type: "date", value: s.start_date });
  const pace = el("input", { type: "number", step: "0.25", min: "0.5", value: s.pace_weeks_per_slot, style: "width:90px" });
  const buffer = el("input", { type: "checkbox", checked: (s.buffer_per_phase ?? "1") !== "0" });
  const remind = el("input", { type: "checkbox", checked: (s.reminder_enabled ?? "1") !== "0" });

  // study-days picker (0=Sun … 6=Sat)
  const active = new Set((s.study_days ?? "1,2,3,4,5,6").split(",").map((x) => parseInt(x, 10)));
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const dayBtns = labels.map((lab, d) => {
    const b = el("button", {
      className: "btn" + (active.has(d) ? "" : " ghost"),
      style: "width:38px;padding:8px 0",
      title: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d],
    }, lab);
    b.onclick = () => { active.has(d) ? active.delete(d) : active.add(d); b.className = "btn" + (active.has(d) ? "" : " ghost"); };
    return b;
  });

  const save = el("button", { className: "btn" }, "Save schedule");
  save.onclick = async () => {
    const days = [...active].sort((a, b) => a - b).join(",") || "1,2,3,4,5,6";
    await api("/api/settings", { method: "PUT", body: JSON.stringify({
      start_date: start.value, pace_weeks_per_slot: pace.value,
      buffer_per_phase: buffer.checked ? "1" : "0", reminder_enabled: remind.checked ? "1" : "0",
      study_days: days }) });
    load();
  };
  const test = el("button", { className: "btn ghost" }, "Send test push now");
  test.onclick = async () => {
    const r = await api("/api/test-reminder", { method: "POST" });
    alert(r.sent ? `Pushed ✓  (${r.session})` : "Not sent — ntfy topic not set, or offline.");
  };

  root.append(
    el("div", { className: "phase-h" }, "Schedule"),
    el("div", { className: "card", style: "padding:14px" },
      el("div", { className: "form-row" }, el("label", { className: "field" }, "Start date", start), el("label", { className: "field" }, "Weeks per slot (pace)", pace)),
      el("div", { className: "form-row" }, buffer, el("span", {}, "Add a review & buffer week after each phase")),
      el("p", { className: "hint", style: "margin:6px 0 0" }, "Study days (each week's sessions spread across these):"),
      el("div", { className: "form-row" }, ...dayBtns),
      el("div", { className: "form-row" }, remind, el("span", {}, "Daily push reminder at 10:00 (on study days)")),
      el("div", { className: "form-row" }, save, test),
      el("p", { className: "hint" }, `Finishes ~${fmt(st.finishDate)} · ${st.totalContent} content weeks + buffers`)),
    el("div", { className: "phase-h" }, "Phone reminders (ntfy.sh)"),
    el("div", { className: "card", style: "padding:14px" },
      el("p", { className: "hint" }, "Install the free ntfy app, subscribe to your private topic, and you'll get a daily push with today's study session. Use 'Send test push now' above to check it's working."))
  );
}

async function toggle(id, done) {
  await api(`/api/milestones/${id}/toggle`, { method: "POST", body: JSON.stringify({ done }) });
  await load();
}

function showTab(name) {
  for (const b of document.querySelectorAll(".tabs button")) b.classList.toggle("active", b.dataset.tab === name);
  for (const t of document.querySelectorAll(".tab")) t.classList.toggle("hidden", t.id !== "tab-" + name);
}
document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));

load();
