/* Study tracker — vanilla JS, no dependencies.
   API contract (unchanged):
     GET  /api/state
     POST /api/steps/:id/toggle {done}
     PUT  /api/settings {start_date, session_minutes, study_days, reminder_enabled}
     PUT  /api/notes/:weekId {body, push}
     POST /api/test-reminder
   If the API is unreachable (local preview), an embedded sample state is used
   and mutations are applied locally. */

"use strict";

/* ================= icons (inline SVG, Feather-style, currentColor) ================= */

function svg(inner, size) {
  return '<svg width="' + (size || 16) + '" height="' + (size || 16) +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
}

const ICONS = {
  setup: svg('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'),
  watch: svg('<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>'),
  read: svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  build: svg('<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>'),
  exercise: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  checkpoint: svg('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>'),
  note: svg('<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>'),
  paper: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
  fallback: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'),
  flame: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 13),
  flameBig: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 30),
  ring: '<svg class="ring" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><circle class="ring-track" cx="18" cy="18" r="15.5"/><circle class="ring-arc" cx="18" cy="18" r="15.5"/><polyline class="ring-check" points="11.5 18.5 16 23 24.5 13.5"/></svg>',
  award: svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>', 13),
  awardMid: svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>', 20),
  starMid: svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 20),
  flameMid: svg('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 20),
  play: svg('<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/>', 12),
  pause: svg('<rect x="5" y="4" width="4.5" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14.5" y="4" width="4.5" height="16" rx="1" fill="currentColor" stroke="none"/>', 12),
  star: svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 30),
  awardBig: svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>', 30),
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  external: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
  chevron: '<svg class="week-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>'
};

function kindIcon(kind) { return ICONS[kind] || ICONS.fallback; }

/* ================= state ================= */

let STATE = null;       // last /api/state payload
let OFFLINE = false;    // true when using embedded sample data
let noteDraft = null;   // unsaved textarea content, survives re-renders
let noteDraftWeek = null;

const $ = (sel, root) => (root || document).querySelector(sel);

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtMin(m) {
  m = Number(m) || 0;
  if (m < 60) return "~" + m + "m";
  const h = Math.floor(m / 60), r = m % 60;
  return "~" + h + "h" + (r ? " " + r + "m" : "");
}

/* ================= local momentum tracking (device-only, no API impact) ================= */

const DAYLOG_KEY = "st_day_log";

function dateKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function todayKey() { return dateKey(new Date()); }

let MOCKLOG = null; // in-memory day log for offline preview (never persisted)
let MOCKSTEPLOG = null;

const STEPLOG_KEY = "st_day_steps";

function getStepLog() {
  if (OFFLINE) return (MOCKSTEPLOG = MOCKSTEPLOG || {});
  try { return JSON.parse(localStorage.getItem(STEPLOG_KEY)) || {}; } catch (e) { return {}; }
}
function saveStepLog(log) {
  if (OFFLINE) { MOCKSTEPLOG = log; return; }
  // keep only the last 2 days to stay tiny
  const keys = Object.keys(log).sort().slice(-2);
  const trimmed = {};
  keys.forEach(k => { trimmed[k] = log[k]; });
  try { localStorage.setItem(STEPLOG_KEY, JSON.stringify(trimmed)); } catch (e) {}
}
function logStepDone(step) {
  const log = getStepLog();
  const k = todayKey();
  log[k] = (log[k] || []).filter(x => x.id !== step.id);
  log[k].push({ id: step.id, title: step.title, kind: step.kind, minutes: step.minutes });
  saveStepLog(log);
}
function unlogStep(id) {
  const log = getStepLog();
  const k = todayKey();
  if (log[k]) { log[k] = log[k].filter(x => x.id !== id); saveStepLog(log); }
}
function todaySteps() { return getStepLog()[todayKey()] || []; }

/* earned badges (device-local; phase badges also derive live from plan data) */
const BADGES_KEY = "st_badges";
let MOCKBADGES = null;

function getBadges() {
  if (OFFLINE) return (MOCKBADGES = MOCKBADGES || { "pw:2026-07-05": "2026-07-05" });
  try { return JSON.parse(localStorage.getItem(BADGES_KEY)) || {}; } catch (e) { return {}; }
}
function earnBadge(id) {
  const b = getBadges();
  if (b[id]) return;
  b[id] = todayKey();
  if (OFFLINE) { MOCKBADGES = b; return; }
  try { localStorage.setItem(BADGES_KEY, JSON.stringify(b)); } catch (e) {}
}

/* ---- daily focus timer: stopwatch or pomodoro (25/5), resets each day ---- */
const TIMER_KEY = "st_timer";
const POMO_FOCUS = 25 * 60000;
const POMO_BREAK = 5 * 60000;
let timerInterval = null;

function getTimer() {
  let t = null;
  try { t = JSON.parse(localStorage.getItem(TIMER_KEY)); } catch (e) {}
  if (!t || t.date !== todayKey()) {
    t = { date: todayKey(), mode: "watch", phase: "focus", accum: 0, startedAt: null, total: 0, pomos: 0 };
  }
  if (!t.mode) t.mode = "watch";
  if (!t.phase) t.phase = "focus";
  t.total = t.total || 0;
  t.pomos = t.pomos || 0;
  return t;
}
function saveTimer(t) {
  try { localStorage.setItem(TIMER_KEY, JSON.stringify(t)); } catch (e) {}
}
function segElapsed(t) {
  return (t.accum || 0) + (t.startedAt ? Date.now() - t.startedAt : 0);
}
function totalFocus(t) {
  return (t.total || 0) + (t.phase === "focus" ? segElapsed(t) : 0);
}
function fmtClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = String(m).padStart(2, "0"), rr = String(r).padStart(2, "0");
  return h > 0 ? h + ":" + mm + ":" + rr : mm + ":" + rr;
}
function toggleTimer() {
  const t = getTimer();
  if (t.startedAt) {
    t.accum = segElapsed(t);
    t.startedAt = null;
  } else {
    t.startedAt = Date.now();
  }
  saveTimer(t);
  render();
}
function setTimerMode(mode) {
  const t = getTimer();
  if (t.mode === mode) return;
  if (t.phase === "focus") t.total += segElapsed(t); // bank focus time before switching
  t.mode = mode;
  t.phase = "focus";
  t.accum = 0;
  t.startedAt = null;
  saveTimer(t);
  render();
}
function advancePomo(t) {
  if (t.phase === "focus") {
    t.total += segElapsed(t);
    t.pomos++;
    t.phase = "break";
    toast("Pomodoro " + t.pomos + " done \u2014 take 5");
    if (navigator.vibrate) navigator.vibrate([10, 60, 14]);
  } else {
    t.phase = "focus";
    toast("Break over \u2014 back to it");
    if (navigator.vibrate) navigator.vibrate(8);
  }
  t.accum = 0;
  t.startedAt = Date.now(); // auto-roll into the next phase
  saveTimer(t);
}
function timerDisplayValue(t) {
  if (t.mode === "pomo") {
    const dur = t.phase === "focus" ? POMO_FOCUS : POMO_BREAK;
    return fmtClock(dur - segElapsed(t));
  }
  return fmtClock(totalFocus(t));
}
function ensureTimerTick() {
  clearInterval(timerInterval);
  timerInterval = null;
  const t0 = getTimer();
  if (!t0.startedAt) { document.title = "Study"; return; }
  timerInterval = setInterval(() => {
    const t = getTimer();
    if (!t.startedAt) return;
    if (t.mode === "pomo") {
      const dur = t.phase === "focus" ? POMO_FOCUS : POMO_BREAK;
      if (segElapsed(t) >= dur) {
        advancePomo(t);
        render();
        return;
      }
    }
    const v = timerDisplayValue(t);
    const el = $("#timer-display");
    if (el) el.textContent = v;
    document.title = v + (t.mode === "pomo" && t.phase === "break" ? " break" : "") + " \u00b7 Study";
  }, 1000);
}

function timerRow() {
  const t = getTimer();
  const running = !!t.startedAt;
  const onBreak = t.mode === "pomo" && t.phase === "break";

  const row = document.createElement("div");
  row.className = "timer-row";

  const btn = document.createElement("button");
  btn.className = "timer-btn" + (running ? " running" : "") + (onBreak ? " break" : "");
  btn.setAttribute("aria-label", running ? "Pause timer" : "Start timer");
  btn.innerHTML = running ? ICONS.pause : ICONS.play;
  btn.addEventListener("click", toggleTimer);

  const disp = document.createElement("span");
  disp.className = "timer-display num" + (running ? " running" : "") + (onBreak ? " break" : "");
  disp.id = "timer-display";
  disp.textContent = timerDisplayValue(t);

  const label = document.createElement("span");
  label.className = "timer-label";
  label.textContent = t.mode === "pomo" ? (onBreak ? "break" : "focus") : (running ? "focusing" : "focus timer");

  row.append(btn, disp, label);

  if (t.mode === "pomo" && t.pomos > 0) {
    const dots = document.createElement("span");
    dots.className = "pomo-dots";
    dots.title = t.pomos + " pomodoros today";
    if (t.pomos <= 8) {
      for (let i = 0; i < t.pomos; i++) dots.append(document.createElement("i"));
    } else {
      dots.textContent = "\u00d7" + t.pomos;
    }
    row.append(dots);
  }

  const right = document.createElement("span");
  right.className = "timer-right";

  if (!running && (segElapsed(t) > 0 || t.total > 0 || t.pomos > 0)) {
    const rst = document.createElement("button");
    rst.className = "timer-reset";
    rst.textContent = "reset";
    rst.addEventListener("click", () => {
      saveTimer({ date: todayKey(), mode: t.mode, phase: "focus", accum: 0, startedAt: null, total: 0, pomos: 0 });
      render();
    });
    right.append(rst);
  }

  const seg = document.createElement("span");
  seg.className = "timer-mode";
  [["watch", "Stopwatch"], ["pomo", "Pomodoro"]].forEach(pair => {
    const b = document.createElement("button");
    b.textContent = pair[1];
    b.className = t.mode === pair[0] ? "active" : "";
    b.addEventListener("click", () => setTimerMode(pair[0]));
    seg.append(b);
  });
  right.append(seg);
  row.append(right);

  return row;
}

/* a perfect week: every study day of the current calendar week hit the full session,
   checked on the week's final study day */
function perfectWeekInfo(target) {
  const log = getDayLog();
  const studyDays = new Set((STATE.settings.study_days || "").split(",").map(x => x.trim()));
  const today = new Date();
  const dow = today.getDay();

  let lastStudyDow = -1;
  for (let i = 0; i < 7; i++) if (studyDays.has(String(i))) lastStudyDow = i;
  if (dow !== lastStudyDow) return null;

  let count = 0, minutes = 0;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (dow - i));
    const isStudy = studyDays.has(String(i));
    const m = i <= dow ? (log[dateKey(d)] || 0) : 0;
    days.push({ isStudy: isStudy, met: isStudy && m >= target });
    if (isStudy && i <= dow) {
      if (m < target) return null;
      count++;
      minutes += m;
    }
  }
  if (count < 2) return null;
  return { count: count, hours: Math.round((minutes / 60) * 10) / 10, days: days };
}

function getDayLog() {
  if (OFFLINE) {
    if (!MOCKLOG) {
      MOCKLOG = {};
      [125, 130, 0, 120, 140, 65].forEach((m, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        MOCKLOG[dateKey(d)] = m;
      });
    }
    return MOCKLOG;
  }
  try { return JSON.parse(localStorage.getItem(DAYLOG_KEY)) || {}; } catch (e) { return {}; }
}
function addTodayMinutes(delta) {
  const log = getDayLog();
  const k = todayKey();
  log[k] = Math.max(0, (log[k] || 0) + delta);
  if (OFFLINE) return; // in-memory only
  try { localStorage.setItem(DAYLOG_KEY, JSON.stringify(log)); } catch (e) {}
}
function todayMinutes() { return getDayLog()[todayKey()] || 0; }

function computeStreak() {
  const log = getDayLog();
  const studyDays = new Set((STATE.settings.study_days || "").split(",").map(x => x.trim()));
  let streak = 0;
  const d = new Date();
  if (!(log[todayKey()] > 0)) d.setDate(d.getDate() - 1); // today hasn't started yet — don't break the streak
  for (let i = 0; i < 730; i++) {
    if (studyDays.has(String(d.getDay()))) {
      if (log[dateKey(d)] > 0) streak++;
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* phase badges: a phase is earned when every step of every week in it is done */
function phaseStats(weeks) {
  const order = [];
  const map = {};
  (weeks || []).forEach(w => {
    if (!map[w.phase]) { map[w.phase] = { phase: w.phase, doneSteps: 0, totalSteps: 0 }; order.push(map[w.phase]); }
    map[w.phase].doneSteps += w.doneSteps || 0;
    map[w.phase].totalSteps += w.totalSteps || 0;
  });
  order.forEach(p => { p.complete = p.totalSteps > 0 && p.doneSteps >= p.totalSteps; });
  return order;
}

/* ================= API layer (with offline fallback) ================= */

async function apiGetState() {
  try {
    const r = await fetch("/api/state");
    if (r.status === 401) { location.reload(); return new Promise(() => {}); } // session expired -> login page
    if (!r.ok) throw new Error(r.status);
    OFFLINE = false;
    return await r.json();
  } catch (e) {
    OFFLINE = true;
    return mockState();
  }
}

async function apiToggleStep(id, done) {
  if (OFFLINE) return mockToggle(id, done);
  const r = await fetch("/api/steps/" + encodeURIComponent(id) + "/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: done })
  });
  if (!r.ok) throw new Error("toggle failed");
  return await r.json();
}

async function apiSaveSettings(payload) {
  if (OFFLINE) { Object.assign(MOCK.settings, payload); return recomputeMock(); }
  const r = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("settings failed");
  return await apiGetState();
}

async function apiSaveNote(weekId, body, push) {
  if (OFFLINE) {
    MOCK.note = { weekId: weekId, body: body };
    return { saved: true, pushed: push, commitUrl: push ? "#" : null, error: null };
  }
  const r = await fetch("/api/notes/" + encodeURIComponent(weekId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: body, push: push })
  });
  if (!r.ok) throw new Error("note save failed");
  return await r.json();
}

async function apiTestReminder() {
  if (OFFLINE) return { sent: true };
  const r = await fetch("/api/test-reminder", { method: "POST" });
  if (!r.ok) throw new Error("test reminder failed");
  return await r.json();
}

/* ================= rendering ================= */

function render() {
  renderHeader();
  renderNow();
  renderPlan();
  renderSettings();
  ensureTimerTick();
}

function renderHeader() {
  const p = STATE.plan;
  $("#progress-fill").style.width = (p.percent || 0) + "%";
  $("#progress-meta").textContent =
    p.percent + "% · " + p.doneSteps + "/" + p.totalSteps + " steps · est. finish " + p.finishEstimate;

  const chip = $("#track-chip");
  const b = p.behindWeeks || 0;
  chip.hidden = false;
  chip.classList.remove("ahead", "behind");
  if (b < 0) { chip.textContent = Math.abs(b) + "w ahead"; chip.classList.add("ahead"); }
  else if (b > 0) { chip.textContent = b + "w behind"; chip.classList.add("behind"); }
  else { chip.textContent = "on track"; }

  const streak = computeStreak();
  const sChip = $("#streak-chip");
  if (streak > 0) {
    sChip.hidden = false;
    sChip.innerHTML = ICONS.flame + streak + (streak === 1 ? " day" : " days");
  } else {
    sChip.hidden = true;
  }
}

function todayCard() {
  const target = Number(STATE.plan.sessionMinutes) || 120;
  const done = todayMinutes();
  const wrap = document.createElement("div");
  wrap.id = "today-card";

  if (done >= target) {
    const streak = computeStreak();
    wrap.className = "session-banner";
    let html =
      '<div class="session-head">' + ICONS.ring +
      '<div><div class="session-banner-title">Session complete</div>' +
      '<div class="session-banner-sub">' + fmtMin(done).replace("~", "") + " banked today" +
      (streak > 1 ? " · " + streak + "-day streak" : "") + "</div></div></div>";

    // end-of-day recap
    const doneToday = todaySteps();
    if (doneToday.length) {
      html += '<div class="recap"><p class="recap-label">Today’s recap</p>';
      doneToday.forEach(s => {
        html += '<div class="recap-row"><span class="recap-icon">' + kindIcon(s.kind) + "</span>" +
          '<span class="recap-title">' + esc(s.title) + "</span>" +
          '<span class="recap-min num">' + fmtMin(s.minutes) + "</span></div>";
      });
      const nextUp = (STATE.plan.queue || []).find(s => !s.done);
      if (nextUp) {
        html += '<div class="recap-next">' + kindIcon(nextUp.kind) +
          "<span>First up tomorrow · " + esc(nextUp.title) + "</span></div>";
      }
      html += "</div>";
    }
    wrap.innerHTML = html;
    const focused = totalFocus(getTimer());
    if (focused >= 60000) {
      const sub = wrap.querySelector(".session-banner-sub");
      if (sub) sub.textContent += " \u00b7 " + fmtClock(focused) + " focused";
    }
  } else {
    wrap.className = "today-card";
    const pct = Math.min(100, Math.round((done / target) * 100));
    wrap.innerHTML =
      '<div class="today-row"><span class="today-label">Today\u2019s session</span>' +
      '<span class="today-count"><strong>' + done + "</strong> / " + target + " min</span></div>" +
      '<div class="today-track"><div class="today-fill" style="width:' + pct + '%"></div></div>';
    wrap.append(timerRow());
  }
  return wrap;
}

function nextBadgeCard() {
  const badges = getBadges();
  const target = Number(STATE.plan.sessionMinutes) || 120;
  const candidates = [];

  // nearest incomplete phase
  const phase = phaseStats(STATE.plan.weeks).filter(p => !p.complete)
    .sort((a, b) => (b.doneSteps / b.totalSteps) - (a.doneSteps / a.totalSteps))[0];
  if (phase) {
    candidates.push({ name: phase.phase, pct: phase.doneSteps / phase.totalSteps, icon: ICONS.award });
  }

  // next streak hundred
  const streak = computeStreak();
  const earnedHundreds = Object.keys(badges).filter(k => k.indexOf("streak:") === 0)
    .map(k => Number(k.slice(7)));
  const nextMilestone = (earnedHundreds.length ? Math.max.apply(null, earnedHundreds) : 0) + 100;
  candidates.push({ name: nextMilestone + "-day streak", pct: Math.min(1, streak / nextMilestone), icon: ICONS.flame });

  // perfect week in progress (only while unbroken)
  const log = getDayLog();
  const studyDays = new Set((STATE.settings.study_days || "").split(",").map(x => x.trim()));
  const today = new Date();
  const dow = today.getDay();
  let met = 0, due = 0, totalDays = 0, broken = false;
  for (let i = 0; i < 7; i++) {
    if (!studyDays.has(String(i))) continue;
    totalDays++;
    if (i > dow) continue;
    due++;
    const d = new Date(today);
    d.setDate(d.getDate() - (dow - i));
    if ((log[dateKey(d)] || 0) >= target) met++;
    else if (i < dow) broken = true;
  }
  if (!broken && totalDays >= 2 && met > 0) {
    candidates.push({ name: "Perfect week", pct: met / totalDays, icon: ICONS.star ? ICONS.starMid : ICONS.award, small: true });
  }

  const best = candidates.filter(c => c.pct < 1).sort((a, b) => b.pct - a.pct)[0];
  if (!best) return null;

  const pct = Math.round(best.pct * 100);
  const el = document.createElement("button");
  el.className = "next-badge";
  el.setAttribute("aria-label", "Next badge: " + best.name + ", " + pct + "% \u2014 view badges");
  el.innerHTML =
    '<span class="nb-medal">' + best.icon + "</span>" +
    '<span class="nb-text"><span class="nb-label">Next badge</span>' +
    '<span class="nb-name">' + esc(best.name) + "</span></span>" +
    '<span class="nb-progress"><span class="nb-pct num">' + pct + "%</span>" +
    '<span class="nb-track"><span class="nb-fill" style="width:' + pct + '%"></span></span></span>' +
    ICONS.chevron;
  el.addEventListener("click", () => {
    const tab = document.querySelector('.tab[data-tab="settings"]');
    if (tab) tab.click();
  });
  return el;
}

function stepRow(step, opts) {
  opts = opts || {};
  const focus = !!opts.focus;
  const li = document.createElement("li");
  li.className = "step" + (step.done ? " is-done" : "") + (focus ? " is-focus" : "");
  li.dataset.stepId = step.id;

  const check = document.createElement("button");
  check.className = "check";
  check.setAttribute("role", "checkbox");
  check.setAttribute("aria-checked", step.done ? "true" : "false");
  check.setAttribute("aria-label", (step.done ? "Mark not done: " : "Mark done: ") + step.title);
  check.innerHTML = '<span class="box">' + ICONS.check + "</span>";
  check.addEventListener("click", () => toggleStep(step, check));

  const icon = document.createElement("span");
  icon.className = "step-kind";
  icon.innerHTML = kindIcon(step.kind);

  const body = document.createElement("div");
  body.className = "step-body";
  let html = "";
  if (focus) html += '<span class="start-here">Start here</span>';
  html += '<div class="step-title">' + esc(step.title) + "</div>";
  html += '<div class="step-meta"><span class="num">' + fmtMin(step.minutes) + "</span>";
  if (opts.showWeek && step.weekTitle) html += "<span>" + esc(step.weekTitle) + "</span>";
  if (step.url) {
    html += '<a class="step-link" href="' + esc(step.url) + '" target="_blank" rel="noopener">open ' +
      ICONS.external + "</a>";
  }
  html += "</div>";
  body.innerHTML = html;

  li.append(check, icon, body);
  return li;
}

function momentumCard() {
  const target = Number(STATE.plan.sessionMinutes) || 120;
  const log = getDayLog();
  const studyDays = new Set((STATE.settings.study_days || "").split(",").map(x => x.trim()));
  const names = ["S", "M", "T", "W", "T", "F", "S"];

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      mins: log[dateKey(d)] || 0,
      label: names[d.getDay()],
      isToday: i === 0,
      isStudy: studyDays.has(String(d.getDay()))
    });
  }

  const scale = Math.max(target, ...days.map(x => x.mins));
  const total = days.reduce((a, x) => a + x.mins, 0);
  const totalH = Math.round((total / 60) * 10) / 10;

  const wrap = document.createElement("div");
  wrap.className = "momentum-card";
  let bars = "";
  for (const day of days) {
    const pct = Math.min(100, Math.round((day.mins / scale) * 100));
    const cls = day.mins >= target ? " full" : day.mins > 0 ? " partial" : "";
    bars +=
      '<div class="m-col' + (day.isToday ? " is-today" : "") + (day.isStudy ? "" : " is-rest") + '">' +
        '<div class="m-track"><div class="m-bar' + cls + '" style="height:' + Math.max(pct, day.mins > 0 ? 8 : 0) + '%"></div></div>' +
        '<span class="m-label">' + day.label + "</span>" +
      "</div>";
  }
  wrap.innerHTML =
    '<div class="today-row"><span class="today-label">Momentum \u00b7 7 days</span>' +
    '<span class="today-count"><strong>' + totalH + "h</strong> this week</span></div>" +
    '<div class="momentum-bars">' + bars + "</div>";
  return wrap;
}

function renderNow() {
  const view = $("#view-now");
  const p = STATE.plan;
  view.textContent = "";

  if (OFFLINE) {
    const n = document.createElement("p");
    n.className = "offline-note";
    n.textContent = "Preview mode — API unreachable, showing sample data.";
    view.append(n);
  }

  // recently done
  if (p.recentDone && p.recentDone.length) {
    const label = document.createElement("h2");
    label.className = "section-label";
    label.textContent = "Recently done";
    const ul = document.createElement("ul");
    ul.className = "step-list";
    p.recentDone.forEach(s => ul.append(stepRow(s)));
    view.append(label, ul);
  }

  // week header
  const wh = document.createElement("div");
  wh.className = "week-header";
  wh.innerHTML = '<p class="week-phase">' + esc(p.currentPhase) + "</p>" +
    '<h2 class="week-title">' + esc(p.currentWeekTitle) + "</h2>";
  view.append(wh);

  if (STATE.plan.doneSteps === 0) {
    const ob = document.createElement("div");
    ob.className = "guide-card";
    const repo = STATE.curriculumRepo || "#";
    ob.innerHTML = '<h2 class="section-label">Welcome \u2014 get set up</h2>' +
      '<p class="guide-why">The exercises live in a GitHub repo. <a href="' + repo + '/fork" target="_blank" rel="noopener">Fork it</a>, clone your fork, and run <code>bash setup.sh</code>. Then work through the steps below \u2014 full instructions are in Settings.</p>';
    view.append(ob);
  }

  if (STATE.guide && (STATE.guide.why || (STATE.guide.remember || []).length)) {
    view.append(guideCard(STATE.guide));
  }

  // today's session meter (local, device-only)
  view.append(todayCard());
  view.append(momentumCard());
  const nb = nextBadgeCard();
  if (nb) view.append(nb);

  // up next
  const label = document.createElement("h2");
  label.className = "section-label";
  label.textContent = "Up next · " + fmtMin(p.queueMinutes).replace("~", "") + " queued";
  view.append(label);

  if (p.queue && p.queue.length) {
    const ul = document.createElement("ul");
    ul.className = "step-list";
    p.queue.forEach((s, i) => ul.append(stepRow(s, { focus: i === 0 && !s.done })));
    view.append(ul);
  } else {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nothing queued — you're done for now.";
    view.append(empty);
  }

  // note editor
  const note = STATE.note || { weekId: p.currentWeekId, body: "" };
  if (noteDraftWeek !== note.weekId) { noteDraft = null; noteDraftWeek = note.weekId; }

  const card = document.createElement("div");
  card.className = "note-card";
  card.innerHTML = '<h2 class="section-label">Week note</h2>';

  const ta = document.createElement("textarea");
  ta.className = "note-textarea";
  ta.id = "note-body";
  ta.placeholder = "# Notes for this week…";
  ta.value = noteDraft != null ? noteDraft : (note.body || "");
  ta.addEventListener("input", () => { noteDraft = ta.value; });

  const actions = document.createElement("div");
  actions.className = "note-actions";

  const pushBtn = document.createElement("button");
  pushBtn.className = "btn btn-primary";
  pushBtn.textContent = "Save & push to GitHub";
  pushBtn.disabled = !STATE.githubReady;
  if (!STATE.githubReady) pushBtn.title = "GitHub is not configured";
  pushBtn.addEventListener("click", () => saveNote(note.weekId, ta, true, pushBtn));

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn";
  saveBtn.textContent = "Save only";
  saveBtn.addEventListener("click", () => saveNote(note.weekId, ta, false, saveBtn));

  actions.append(pushBtn, saveBtn);
  card.append(ta, actions);
  view.append(card);
}

function renderPlan() {
  const view = $("#view-plan");
  view.textContent = "";
  const weeks = (STATE.plan.weeks || []);

  // phase badges
  const phases = phaseStats(weeks);
  if (phases.length) {
    const strip = document.createElement("div");
    strip.className = "phase-strip";
    strip.innerHTML = phases.map(ph => {
      const pct = ph.totalSteps ? Math.round((ph.doneSteps / ph.totalSteps) * 100) : 0;
      return '<span class="phase-badge' + (ph.complete ? " earned" : "") + '">' + ICONS.award +
        esc(ph.phase) + (ph.complete ? "" : ' <span class="num">' + pct + "%</span>") + "</span>";
    }).join("");
    view.append(strip);
  }

  weeks.forEach(w => {
    const det = document.createElement("details");
    det.className = "week";
    if (w.weekId === STATE.plan.currentWeekId) det.open = true;

    const allDone = w.doneSteps >= w.totalSteps && w.totalSteps > 0;
    const hours = Math.round((w.totalMinutes / 60) * 10) / 10;

    const sum = document.createElement("summary");
    sum.innerHTML =
      ICONS.chevron +
      '<div class="week-sum-body">' +
        '<div class="week-sum-title">' + esc(w.title) + "</div>" +
        '<div class="week-sum-sub">' + esc(w.phase) + " · " + esc(w.startDate) + " · " + hours + "h</div>" +
      "</div>" +
      (w.weekId === STATE.plan.currentWeekId ? '<span class="week-current-tag">Now</span>' : "") +
      '<span class="week-sum-count' + (allDone ? " all-done" : "") + '">' +
        w.doneSteps + "/" + w.totalSteps + "</span>";

    const ul = document.createElement("ul");
    ul.className = "step-list";
    (w.steps || []).forEach(s => ul.append(stepRow(s)));

    det.append(sum, ul);
    view.append(det);
  });
}

function renderSettings() {
  const view = $("#view-settings");
  view.textContent = "";
  const s = STATE.settings;

  const card = document.createElement("div");
  card.className = "settings-card";

  // start date
  const fDate = document.createElement("div");
  fDate.className = "field";
  fDate.innerHTML = '<label class="field-label" for="set-start">Start date</label>';
  const inDate = document.createElement("input");
  inDate.type = "date"; inDate.className = "input"; inDate.id = "set-start";
  inDate.value = s.start_date || "";
  fDate.append(inDate);

  // session minutes
  const fMin = document.createElement("div");
  fMin.className = "field";
  fMin.innerHTML = '<label class="field-label" for="set-minutes">Minutes per session</label>';
  const inMin = document.createElement("input");
  inMin.type = "number"; inMin.min = "15"; inMin.step = "15";
  inMin.className = "input"; inMin.id = "set-minutes";
  inMin.value = s.session_minutes || "120";
  fMin.append(inMin);

  // study days
  const fDays = document.createElement("div");
  fDays.className = "field";
  fDays.innerHTML = '<span class="field-label">Study days</span>';
  const row = document.createElement("div");
  row.className = "day-row";
  const names = ["S", "M", "T", "W", "T", "F", "S"];
  const full = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const active = new Set((s.study_days || "").split(",").map(x => x.trim()).filter(x => x !== ""));
  names.forEach((n, i) => {
    const b = document.createElement("button");
    b.className = "day-toggle";
    b.textContent = n;
    b.setAttribute("aria-label", full[i]);
    b.setAttribute("aria-pressed", active.has(String(i)) ? "true" : "false");
    b.addEventListener("click", () => {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    });
    row.append(b);
  });
  fDays.append(row);

  // reminder
  const fRem = document.createElement("div");
  fRem.className = "switch-row";
  fRem.innerHTML = '<span class="field-label">Morning reminder</span>';
  const sw = document.createElement("button");
  sw.className = "switch";
  sw.setAttribute("role", "switch");
  sw.setAttribute("aria-checked", s.reminder_enabled === "1" ? "true" : "false");
  sw.setAttribute("aria-label", "Morning reminder");
  sw.addEventListener("click", () => {
    sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true");
  });
  fRem.append(sw);

  // ntfy topic (per-user phone push)
  const fNtfy = document.createElement("div");
  fNtfy.className = "field";
  fNtfy.innerHTML = '<label class="field-label" for="set-ntfy">Phone push topic (ntfy)</label>' +
    '<p class="field-hint">Your personal channel for the daily reminder. Pick something unguessable.</p>';
  const inNtfy = document.createElement("input");
  inNtfy.type = "text"; inNtfy.className = "input"; inNtfy.id = "set-ntfy";
  inNtfy.placeholder = "e.g. ai-study-" + Math.random().toString(36).slice(2, 8);
  inNtfy.style.maxWidth = "100%";
  inNtfy.value = s.ntfy_topic || "";
  fNtfy.append(inNtfy);
  const inNtfyServer = document.createElement("input");
  inNtfyServer.type = "text"; inNtfyServer.className = "input"; inNtfyServer.id = "set-ntfy-server";
  inNtfyServer.placeholder = "Server (default: ntfy.sh)";
  inNtfyServer.style.maxWidth = "100%"; inNtfyServer.style.marginTop = "6px";
  inNtfyServer.value = s.ntfy_server || "";
  fNtfy.append(inNtfyServer);
  const how = document.createElement("details");
  how.className = "howto";
  how.innerHTML = "<summary>How to get reminders on your phone (2 minutes)</summary>" +
    "<ol>" +
    '<li>Install the free <strong>ntfy</strong> app: <a href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noopener">Android</a> \u00b7 <a href="https://apps.apple.com/us/app/ntfy/id1625396347" target="_blank" rel="noopener">iPhone</a> \u00b7 <a href="https://f-droid.org/packages/io.heckel.ntfy/" target="_blank" rel="noopener">F-Droid</a>. No account needed.</li>' +
    "<li>Make up a topic name nobody would guess (use the placeholder suggestion above \u2014 anyone who knows the name can read your reminders).</li>" +
    "<li>In the app: <strong>+ Subscribe to topic</strong> \u2192 keep the default server <code>ntfy.sh</code> (or use <code>ntfy.envs.net</code> if pushes are flaky \u2014 enter the same server below) \u2192 enter your topic name.</li>" +
    "<li>Paste the same topic here, save settings, then hit <strong>Send test push</strong>. It should buzz your phone.</li>" +
    "</ol>" +
    "<p>You\u2019ll then get one push each study-day morning with your exact next steps and time budget.</p>";
  fNtfy.append(how);

  // actions
  const actions = document.createElement("div");
  actions.className = "settings-actions";
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-primary";
  saveBtn.textContent = "Save settings";
  saveBtn.addEventListener("click", async () => {
    const days = [...row.querySelectorAll(".day-toggle")]
      .map((b, i) => (b.getAttribute("aria-pressed") === "true" ? i : null))
      .filter(x => x !== null).join(",");
    const payload = {
      start_date: inDate.value,
      session_minutes: String(inMin.value),
      study_days: days,
      reminder_enabled: sw.getAttribute("aria-checked") === "true" ? "1" : "0",
      ntfy_topic: inNtfy.value.trim(),
      ntfy_server: inNtfyServer.value.trim()
    };
    saveBtn.disabled = true;
    try {
      STATE = await apiSaveSettings(payload);
      render();
      toast("Settings saved");
    } catch (e) {
      toast("Couldn't save settings");
    } finally {
      saveBtn.disabled = false;
    }
  });

  const testBtn = document.createElement("button");
  testBtn.className = "btn";
  testBtn.textContent = "Send test push";
  testBtn.addEventListener("click", async () => {
    testBtn.disabled = true;
    try {
      const r = await apiTestReminder();
      toast(r && r.sent ? "Test push sent" : (r && r.error) || "Push failed — ntfy may be briefly unreachable; try again");
    }
    catch (e) { toast("Couldn't send test push"); }
    finally { testBtn.disabled = false; }
  });

  actions.append(saveBtn, testBtn);
  card.append(fDate, fMin, fDays, fRem, fNtfy, actions);
  view.append(card);
  view.append(repoCard());
  view.append(githubCard());
  if (STATE.user && STATE.user.isAdmin) {
    const admin = document.createElement("div");
    admin.className = "settings-card";
    admin.style.marginTop = "12px";
    admin.innerHTML = '<div class="field"><span class="field-label">Admin — members</span><p class="field-hint">Approve pending signups, revoke inactive accounts.</p></div>';
    const holder = document.createElement("div");
    holder.id = "admin-users";
    holder.innerHTML = '<p class="field-hint">Loading…</p>';
    admin.append(holder);
    view.append(admin);
    loadAdminUsers(holder);
  }
  view.append(accountCard());
  view.append(badgesCard());
}

function githubCard() {
  const card = document.createElement("div");
  card.className = "settings-card";
  card.style.marginTop = "12px";
  const cur = STATE.user && STATE.user.githubRepo;
  card.innerHTML = '<div class="field"><span class="field-label">GitHub note sync</span>' +
    '<p class="field-hint">' + (STATE.githubReady
      ? "Connected — notes commit to <strong>" + esc(cur || "") + "</strong>."
      : "Paste a fine-grained personal access token (Contents: read &amp; write, single repo). Notes will commit to your repo.") +
    "</p></div>";
  const mk = (ph, type) => { const i = document.createElement("input"); i.className = "input"; i.placeholder = ph; if (type) i.type = type; i.style.maxWidth = "100%"; return i; };
  const inOwner = mk("GitHub username (owner)");
  const inRepo = mk("Repository name");
  const inBranch = mk("Branch (default: master)");
  const inToken = mk(STATE.githubReady ? "New token (leave blank to keep current)" : "github_pat_…", "password");
  if (cur) { const p = cur.split("/"); inOwner.value = p[0] || ""; inRepo.value = p[1] || ""; }
  const save = document.createElement("button");
  save.className = "btn";
  save.textContent = "Save GitHub config";
  save.addEventListener("click", async () => {
    save.disabled = true;
    try {
      const body = { owner: inOwner.value, repo: inRepo.value, branch: inBranch.value || "master" };
      if (inToken.value.trim()) body.token = inToken.value.trim();
      const r = await fetch("/api/github", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "failed");
      STATE = d; inToken.value = ""; render(); toast("GitHub connected");
    } catch (e) { toast(e.message || "Couldn't save GitHub config"); }
    finally { save.disabled = false; }
  });
  const wrap = document.createElement("div");
  wrap.className = "field";
  wrap.append(inOwner, inRepo, inBranch, inToken, save);
  card.append(wrap);

  const how = document.createElement("details");
  how.className = "howto";
  how.innerHTML = "<summary>How to set this up (2 minutes)</summary>" +
    "<ol>" +
    "<li>Fork the curriculum repo (link in the card below) to your GitHub account \u2014 this gives you your own copy to push notes and exercise solutions to.</li>" +
    '<li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com/settings/personal-access-tokens/new</a>.</li>' +
    "<li>Repository access \u2192 <strong>Only select repositories</strong> \u2192 pick your fork.</li>" +
    "<li>Permissions \u2192 Repository permissions \u2192 <strong>Contents: Read and write</strong>. Nothing else.</li>" +
    "<li>Generate, copy the <code>github_pat_\u2026</code> token, paste it above with your username and repo name, and save.</li>" +
    "</ol>" +
    "<p>The token is stored encrypted on the server and never shown again. If it ever leaks, the blast radius is that one repo.</p>";
  card.append(how);
  return card;
}

function repoCard() {
  const card = document.createElement("div");
  card.className = "settings-card";
  card.style.marginTop = "12px";
  const repo = STATE.curriculumRepo || "https://github.com/mosesmrima/ai-from-first-principles";
  card.innerHTML = '<div class="field"><span class="field-label">Curriculum repo (exercises &amp; assignments)</span>' +
    '<p class="field-hint">All build steps reference files in this repo \u2014 fork it, then clone your fork to work locally:</p>' +
    '<pre class="clone-box">git clone git@github.com:&lt;your-username&gt;/ai-from-first-principles.git</pre>' +
    '<p class="field-hint"><a href="' + repo + '" target="_blank" rel="noopener">Open the repo \u2197</a> \u00b7 ' +
    '<a href="' + repo + '/fork" target="_blank" rel="noopener">Fork it \u2197</a> \u00b7 then run <code>bash setup.sh</code> inside it.</p></div>';
  return card;
}

function accountCard() {
  const card = document.createElement("div");
  card.className = "settings-card";
  card.style.marginTop = "12px";
  const row = document.createElement("div");
  row.className = "switch-row";
  row.innerHTML = '<span class="field-label">Signed in as <strong>' + esc(STATE.user ? STATE.user.name : "") + "</strong></span>";
  const out = document.createElement("button");
  out.className = "btn";
  out.textContent = "Sign out";
  out.addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST" });
    location.reload();
  });
  row.append(out);
  card.append(row);
  return card;
}

/* ================= actions ================= */

async function toggleStep(step, checkEl) {
  const next = !step.done;
  const mins = Number(step.minutes) || 0;

  // remember pre-toggle context for celebration logic
  const prevWeek = (STATE.plan.weeks || []).find(w => w.weekId === step.weekId);
  const wasWeekDone = prevWeek ? prevWeek.doneSteps >= prevWeek.totalSteps : false;
  const prevPhases = phaseStats(STATE.plan.weeks);
  const prevPercent = STATE.plan.percent || 0;
  const prevToday = todayMinutes();
  const prevStreak = computeStreak();

  // optimistic flip
  step.done = next;
  checkEl.setAttribute("aria-checked", next ? "true" : "false");
  const row = checkEl.closest(".step");
  if (row) row.classList.toggle("is-done", next);

  if (next) {
    addTodayMinutes(mins);
    logStepDone(step);
    burst(checkEl);
    if (row) row.classList.add("flash");
    if (navigator.vibrate) navigator.vibrate(8);
  } else {
    addTodayMinutes(-mins);
    unlogStep(step.id);
  }

  try {
    const newState = await apiToggleStep(step.id, next);
    const finish = () => {
      STATE = newState;
      render();
      if (next) afterComplete(step, prevPercent, wasWeekDone, prevToday, prevPhases, prevStreak);
    };
    // let the check animation land before the list reshuffles
    if (next && !prefersReducedMotion()) setTimeout(finish, 520);
    else finish();
  } catch (e) {
    step.done = !next;
    addTodayMinutes(next ? -mins : mins);
    if (next) unlogStep(step.id); else logStepDone(step);
    checkEl.setAttribute("aria-checked", !next ? "true" : "false");
    if (row) { row.classList.toggle("is-done", !next); row.classList.remove("flash"); }
    toast("Couldn't save — check your connection");
  }
}

function burst(checkEl) {
  if (prefersReducedMotion()) return;
  const host = checkEl.querySelector(".box") || checkEl;
  const b = document.createElement("span");
  b.className = "burst";
  for (let i = 0; i < 7; i++) {
    const p = document.createElement("i");
    const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
    const d = 15 + Math.random() * 11;
    p.style.setProperty("--dx", Math.cos(a) * d + "px");
    p.style.setProperty("--dy", Math.sin(a) * d + "px");
    p.style.animationDelay = Math.round(Math.random() * 40) + "ms";
    b.append(p);
  }
  host.append(b);
  setTimeout(() => b.remove(), 700);
}

function afterComplete(step, prevPercent, wasWeekDone, prevToday, prevPhases, prevStreak) {
  const p = STATE.plan;
  const target = Number(p.sessionMinutes) || 120;

  // progress bar glow
  const fill = $("#progress-fill");
  fill.classList.remove("pulse");
  void fill.offsetWidth;
  fill.classList.add("pulse");

  // floating +Xm over the session meter
  const card = $("#today-card");
  if (card && card.classList.contains("today-card")) {
    const f = document.createElement("span");
    f.className = "float-plus";
    f.textContent = "+" + (Number(step.minutes) || 0) + "m";
    card.append(f);
    setTimeout(() => f.remove(), 1000);
  }

  // session just completed → stronger haptic; the banner animates in on render
  const crossedTarget = prevToday < target && todayMinutes() >= target;
  if (crossedTarget && navigator.vibrate) {
    navigator.vibrate([10, 60, 14]);
  }

  // one message max, biggest win first
  const newStreak = computeStreak();
  if (Math.floor(newStreak / 100) > Math.floor((prevStreak || 0) / 100)) {
    showStreakCelebration(newStreak);
    return;
  }
  const phase = phaseStats(p.weeks).find(x => x.phase === step.phase);
  const wasPhaseDone = (prevPhases || []).some(x => x.phase === step.phase && x.complete);
  if (phase && phase.complete && !wasPhaseDone) {
    showPhaseCelebration(phase);
    return;
  }
  if (crossedTarget) {
    const pw = perfectWeekInfo(target);
    if (pw) { showPerfectWeek(pw); return; }
  }
  const week = (p.weeks || []).find(w => w.weekId === step.weekId);
  const weekNowDone = week && week.totalSteps > 0 && week.doneSteps >= week.totalSteps;
  if (weekNowDone && !wasWeekDone) {
    toastBig(kindIcon("checkpoint"), "Week complete", esc(week.title));
  } else if (Math.floor((p.percent || 0) / 5) > Math.floor(prevPercent / 5)) {
    toastBig(ICONS.flame, p.percent + "% of the curriculum", "Keep the streak going");
  }
}

function showPhaseCelebration(phase) {
  earnBadge("phase:" + phase.phase);
  const ov = document.createElement("div");
  ov.className = "phase-overlay";
  ov.innerHTML =
    '<div class="phase-card" role="dialog" aria-label="Phase complete">' +
      '<span class="phase-medal">' + ICONS.awardBig + "</span>" +
      '<p class="phase-kicker">Badge earned</p>' +
      "<h3>" + esc(phase.phase) + "</h3>" +
      '<p class="phase-sub">' + phase.totalSteps + " steps \u00b7 every week complete</p>" +
      '<button class="btn btn-primary">Onward</button>' +
    "</div>";
  ov.addEventListener("click", e => {
    if (e.target === ov || e.target.closest("button")) ov.remove();
  });
  document.body.append(ov);
  ov.querySelector("button").focus();
  if (navigator.vibrate) navigator.vibrate([12, 60, 12, 60, 20]);
}

function showStreakCelebration(streak) {
  earnBadge("streak:" + (Math.floor(streak / 100) * 100));
  const milestone = Math.floor(streak / 100) * 100;
  const ov = document.createElement("div");
  ov.className = "phase-overlay";
  ov.innerHTML =
    '<div class="phase-card streak-card" role="dialog" aria-label="Streak milestone">' +
      '<span class="phase-medal">' + ICONS.flameBig + "</span>" +
      '<p class="phase-kicker">' + milestone + "-day streak</p>" +
      "<h3>" + (milestone === 100 ? "One hundred days of showing up" : milestone + " days of showing up") + "</h3>" +
      '<p class="phase-sub">Consistency is the whole game. Current streak: ' + streak + " days</p>" +
      '<button class="btn btn-primary">Keep going</button>' +
    "</div>";
  ov.addEventListener("click", e => {
    if (e.target === ov || e.target.closest("button")) ov.remove();
  });
  document.body.append(ov);
  ov.querySelector("button").focus();
  if (navigator.vibrate) navigator.vibrate([12, 60, 12, 60, 20]);
}

function showPerfectWeek(pw) {
  earnBadge("pw:" + todayKey());
  const names = ["S", "M", "T", "W", "T", "F", "S"];
  const dots = pw.days.map((d, i) =>
    '<span class="pw-day' + (d.met ? " met" : "") + (d.isStudy ? "" : " rest") + '">' +
    (d.met ? ICONS.check : names[i]) + "</span>"
  ).join("");

  const ov = document.createElement("div");
  ov.className = "phase-overlay";
  ov.innerHTML =
    '<div class="phase-card perfect" role="dialog" aria-label="Perfect week">' +
      '<span class="phase-medal">' + ICONS.star + "</span>" +
      '<p class="phase-kicker">Perfect week</p>' +
      "<h3>Every session, full length</h3>" +
      '<p class="phase-sub">' + pw.count + " study days \u00b7 " + pw.hours + "h this week</p>" +
      '<div class="pw-days">' + dots + "</div>" +
      '<button class="btn btn-primary">Rest well</button>' +
    "</div>";
  ov.addEventListener("click", e => {
    if (e.target === ov || e.target.closest("button")) ov.remove();
  });
  document.body.append(ov);
  ov.querySelector("button").focus();
  if (navigator.vibrate) navigator.vibrate([12, 60, 12, 60, 20]);
}

async function saveNote(weekId, ta, push, btn) {
  btn.disabled = true;
  try {
    const res = await apiSaveNote(weekId, ta.value, push);
    if (res.error) { toast("Error: " + res.error); return; }
    noteDraft = null;
    if (STATE.note) STATE.note.body = ta.value;
    if (res.pushed && res.commitUrl && res.commitUrl !== "#") {
      toast('Saved & pushed — <a href="' + esc(res.commitUrl) + '" target="_blank" rel="noopener">view commit</a>', true);
    } else if (res.pushed) {
      toast("Saved & pushed");
    } else {
      toast("Note saved");
    }
  } catch (e) {
    toast("Couldn't save note");
  } finally {
    btn.disabled = false;
  }
}

function badgesCard() {
  const badges = getBadges();
  const phases = phaseStats(STATE.plan.weeks);
  const streak = computeStreak();
  const tiles = [];

  // phase badges (live from plan data)
  phases.forEach(ph => {
    const pct = ph.totalSteps ? Math.round((ph.doneSteps / ph.totalSteps) * 100) : 0;
    tiles.push({
      icon: ICONS.awardMid, cls: "amber", earned: ph.complete,
      name: ph.phase,
      sub: ph.complete ? "Earned" : pct + "% complete"
    });
  });

  // perfect weeks
  const pwCount = Object.keys(badges).filter(k => k.indexOf("pw:") === 0).length;
  tiles.push({
    icon: ICONS.starMid, cls: "green", earned: pwCount > 0,
    name: "Perfect week" + (pwCount > 1 ? " \u00d7" + pwCount : ""),
    sub: pwCount > 0 ? "Every session, full length" : "Hit every session in a week"
  });

  // streak milestones: each earned hundred, plus the next one in progress
  const earnedHundreds = Object.keys(badges)
    .filter(k => k.indexOf("streak:") === 0)
    .map(k => Number(k.slice(7)))
    .sort((a, b) => a - b);
  earnedHundreds.forEach(m => {
    tiles.push({ icon: ICONS.flameMid, cls: "amber", earned: true, name: m + "-day streak", sub: "Earned" });
  });
  const nextMilestone = (earnedHundreds[earnedHundreds.length - 1] || 0) + 100;
  tiles.push({
    icon: ICONS.flameMid, cls: "amber", earned: false,
    name: nextMilestone + "-day streak",
    sub: Math.min(streak, nextMilestone) + " / " + nextMilestone + " days"
  });

  const card = document.createElement("div");
  card.className = "badges-card";
  card.innerHTML = '<h2 class="section-label">Badges</h2>' +
    '<div class="badge-grid">' +
    tiles.map(t =>
      '<div class="badge-tile' + (t.earned ? " earned " + t.cls : "") + '">' +
        '<span class="badge-medal">' + t.icon + "</span>" +
        '<span class="badge-name">' + esc(t.name) + "</span>" +
        '<span class="badge-sub num">' + esc(t.sub) + "</span>" +
      "</div>"
    ).join("") + "</div>";
  return card;
}

/* ================= guidance ================= */

function guideCard(g) {
  const card = document.createElement("div");
  card.className = "guide-card";
  let html = '<h2 class="section-label">Why this week matters</h2>';
  if (g.why) html += '<p class="guide-why">' + esc(g.why) + "</p>";
  if (g.remember && g.remember.length) {
    html += '<p class="guide-sub">Worth remembering</p><ul class="guide-list">' +
      g.remember.map(r => "<li>" + esc(r) + "</li>").join("") + "</ul>";
  }
  card.innerHTML = html;
  return card;
}

/* ================= leaderboard ================= */

async function renderBoard() {
  const view = $("#view-board");
  view.innerHTML = '<p class="offline-note">Loading leaderboard…</p>';
  let board = [];
  try {
    const r = await fetch("/api/leaderboard");
    if (!r.ok) throw new Error(r.status);
    board = (await r.json()).board || [];
  } catch (e) {
    view.innerHTML = '<div class="empty">Leaderboard unavailable.</div>';
    return;
  }
  view.textContent = "";
  const label = document.createElement("h2");
  label.className = "section-label";
  label.textContent = "Leaderboard";
  view.append(label);
  if (!board.length) {
    view.innerHTML += '<div class="empty">Nobody here yet.</div>';
    return;
  }
  const me = STATE && STATE.user ? STATE.user.name : null;
  const ul = document.createElement("ul");
  ul.className = "board-list";
  board.forEach((u, i) => {
    const li = document.createElement("li");
    li.className = "board-row" + (u.name === me ? " is-me" : "");
    li.innerHTML =
      '<span class="board-rank num">' + (i + 1) + "</span>" +
      '<span class="board-body"><span class="board-name">' + esc(u.name) + (u.name === me ? ' <span class="board-you">you</span>' : "") + "</span>" +
      '<span class="board-week">' + esc(u.currentWeek || "") + "</span>" +
      '<span class="board-track"><span class="board-fill" style="width:' + (u.percent || 0) + '%"></span></span></span>' +
      '<span class="board-stats"><span class="board-pct num">' + u.percent + "%</span>" +
      '<span class="board-meta num">' + u.weekSteps + " this wk" + (u.streak > 0 ? " · " + ICONS.flame + u.streak : "") + "</span></span>";
    ul.append(li);
  });
  view.append(ul);
}

/* ================= admin ================= */

async function loadAdminUsers(holder) {
  let data;
  try {
    const r = await fetch("/api/admin/users");
    if (!r.ok) throw new Error(r.status);
    data = await r.json();
  } catch (e) {
    holder.innerHTML = '<p class="field-hint">Couldn\u2019t load users.</p>';
    return;
  }
  holder.textContent = "";
  const meta = document.createElement("p");
  meta.className = "field-hint";
  meta.innerHTML = data.users.filter(u => u.status !== "revoked").length + "/" + data.maxUsers +
    " seats used" + (data.invite ? ' \u00b7 invite code: <code>' + esc(data.invite) + "</code>" : "");
  holder.append(meta);
  data.users.forEach(u => {
    const row = document.createElement("div");
    row.className = "admin-row";
    const last = u.last_active ? u.last_active.slice(0, 10) : "never";
    row.innerHTML =
      '<span class="admin-body"><span class="admin-name">' + esc(u.name) +
      ' <span class="admin-status st-' + u.status + '">' + u.status + "</span></span>" +
      '<span class="admin-meta">' + esc(u.email || "no email") + " \u00b7 " + u.done_steps + " steps \u00b7 last active " + last + "</span></span>";
    const actions = document.createElement("span");
    actions.className = "admin-actions";
    if (u.id !== 1) {
      if (u.status !== "active") actions.append(adminBtn("Approve", u.id, "active", holder));
      if (u.status !== "revoked") actions.append(adminBtn("Revoke", u.id, "revoked", holder));
    }
    row.append(actions);
    holder.append(row);
  });
}

function adminBtn(label, id, status, holder) {
  const b = document.createElement("button");
  b.className = "btn";
  b.style.padding = "5px 10px";
  b.style.fontSize = "12px";
  b.textContent = label;
  b.addEventListener("click", async () => {
    b.disabled = true;
    try {
      const r = await fetch("/api/admin/users/" + id + "/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status })
      });
      if (!r.ok) throw new Error();
      toast(label + "d");
      loadAdminUsers(holder);
    } catch (e) { toast("Failed"); b.disabled = false; }
  });
  return b;
}

/* ================= tabs & toast ================= */

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    ["now", "plan", "board", "settings"].forEach(name => {
      $("#view-" + name).hidden = name !== tab.dataset.tab;
    });
    window.scrollTo(0, 0);
    if (tab.dataset.tab === "board") renderBoard();
  });
});

let toastTimer = null;
function toast(msg, isHtml) {
  const t = $("#toast");
  t.classList.remove("toast-big");
  if (isHtml) t.innerHTML = msg; else t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, isHtml ? 6000 : 2600);
}

function toastBig(iconHtml, title, sub) {
  const t = $("#toast");
  t.classList.add("toast-big");
  t.innerHTML = iconHtml + "<span>" + title +
    (sub ? '<span class="toast-sub">' + sub + "</span>" : "") + "</span>";
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; t.classList.remove("toast-big"); }, 3800);
}

/* ================= embedded sample data (offline preview only) ================= */

let MOCK = null;

function mockState() {
  if (!MOCK) MOCK = buildMock();
  return recomputeMock();
}

function buildMock() {
  let id = 0;
  const S = (title, kind, minutes, done, url) =>
    ({ id: "s" + (++id), title, kind, minutes, url: url || undefined, done: !!done });

  const weeks = [
    {
      weekId: "week01", phase: "Phase 1 — Math", title: "Vectors, matrices & dot products",
      startDate: "2026-07-06",
      steps: [
        S("Set up Python env + NumPy notebook", "setup", 20, true),
        S("3Blue1Brown — Essence of linear algebra, ch. 1–3", "watch", 45, true, "https://example.com"),
        S("Read: MML book §2.1–2.3", "read", 40, true),
        S("Exercises: dot products & norms (set A)", "exercise", 45, true),
        S("Build: vector ops from scratch in NumPy", "build", 60, true),
        S("Week 1 note — what clicked, what didn't", "note", 20, true),
        S("Checkpoint: quiz yourself on §2.1–2.3", "checkpoint", 30, true)
      ]
    },
    {
      weekId: "week02", phase: "Phase 1 — Math", title: "Linear transformations & basis",
      startDate: "2026-07-13",
      steps: [
        S("3Blue1Brown — ch. 4–6 (transformations)", "watch", 40, true, "https://example.com"),
        S("Read: MML book §2.4 — linear maps", "read", 35, true),
        S("Exercises: change of basis (set B)", "exercise", 45, false, "https://example.com"),
        S("Build: visualize 2D transforms with matplotlib", "build", 50, false),
        S("Paper skim: 'Attention Is All You Need' §1–2", "paper", 25, false, "https://example.com"),
        S("Week 2 note", "note", 15, false),
        S("Checkpoint: transformation drills", "checkpoint", 30, false)
      ]
    },
    {
      weekId: "week03", phase: "Phase 1 — Math", title: "Eigenvalues & eigenvectors",
      startDate: "2026-07-20",
      steps: [
        S("3Blue1Brown — ch. 13–14 (eigen)", "watch", 35, false, "https://example.com"),
        S("Read: MML book §4.1–4.2", "read", 45, false),
        S("Exercises: eigen decomposition (set C)", "exercise", 50, false),
        S("Build: PCA on a toy dataset", "build", 60, false),
        S("Week 3 note", "note", 15, false),
        S("Checkpoint: eigen intuition check", "checkpoint", 30, false)
      ]
    }
  ];

  weeks.forEach(w => w.steps.forEach(s => {
    s.weekId = w.weekId; s.weekTitle = w.title; s.phase = w.phase;
  }));

  return {
    settings: { start_date: "2026-07-08", session_minutes: "120", study_days: "1,2,3,4,5,6", reminder_enabled: "1" },
    githubReady: true,
    note: { weekId: "week02", body: "# Week 2\n\n- basis change finally clicked after the 3b1b visual\n- redo exercise B4 tomorrow" },
    weeks: weeks
  };
}

function recomputeMock() {
  const weeks = MOCK.weeks.map(w => {
    const doneSteps = w.steps.filter(s => s.done).length;
    return Object.assign({}, w, {
      totalMinutes: w.steps.reduce((a, s) => a + s.minutes, 0),
      doneSteps: doneSteps,
      totalSteps: w.steps.length
    });
  });

  const all = MOCK.weeks.flatMap(w => w.steps);
  const done = all.filter(s => s.done);
  const sessionMinutes = Number(MOCK.settings.session_minutes) || 120;

  const queue = [];
  let qm = 0;
  for (const s of all) {
    if (s.done) continue;
    queue.push(s);
    qm += s.minutes;
    if (qm >= sessionMinutes) break;
  }

  const cur = weeks.find(w => w.doneSteps < w.totalSteps) || weeks[weeks.length - 1];

  return {
    settings: MOCK.settings,
    githubReady: true,
    note: MOCK.note,
    plan: {
      percent: Math.round((done.length / 400) * 100),
      doneSteps: done.length,
      totalSteps: 400,
      behindWeeks: -1,
      sessionMinutes: sessionMinutes,
      finishEstimate: "2028-02-22",
      currentWeekId: cur.weekId,
      currentWeekTitle: cur.title,
      currentPhase: cur.phase,
      queueMinutes: qm,
      queue: queue,
      recentDone: done.slice(-3).reverse(),
      weeks: weeks
    }
  };
}

function mockToggle(id, done) {
  for (const w of MOCK.weeks) {
    const s = w.steps.find(x => x.id === id);
    if (s) { s.done = done; break; }
  }
  return recomputeMock();
}

/* ================= boot ================= */

(async function init() {
  STATE = await apiGetState();
  render();
})();
