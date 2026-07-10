// Turn the curriculum's steps into ONE linear plan. No rigid sessions: "Now" is a
// rolling queue of the next unfinished steps (~one sitting), with honest per-step
// times. Modules are assigned to weeks; you do what fits and the rest carries over.
import { WEEKS, type Kind } from "./curriculum";

const DAY = 86_400_000;

export interface Settings {
  start_date: string;
  session_minutes: string; // soft target for the "Now" queue length
  study_days: string;
  [k: string]: string;
}

export interface Step {
  id: string;
  title: string;
  kind: Kind;
  minutes: number;
  url?: string;
  done: boolean;
  weekId: string;
  weekTitle: string;
  phase: string;
  weekIndex: number;
}

export interface WeekSummary {
  weekId: string;
  phase: string;
  title: string;
  weekIndex: number;
  startDate: string | null;
  totalMinutes: number;
  doneSteps: number;
  totalSteps: number;
  steps: Step[];
}

function iso(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}
function parseUTC(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

export function buildSteps(done: Set<string>): Step[] {
  const steps: Step[] = [];
  let weekIndex = -1;
  for (const w of WEEKS) {
    const isWeek = w.id.startsWith("week");
    if (isWeek) weekIndex++;
    w.steps.forEach((s, i) => {
      const id = `${w.id}.${i}`;
      steps.push({
        id, title: s.title, kind: s.kind, minutes: s.minutes, url: s.url,
        done: done.has(id), weekId: w.id, weekTitle: w.title, phase: w.phase,
        weekIndex: isWeek ? weekIndex : -1,
      });
    });
  }
  return steps;
}

export interface Plan {
  weeks: WeekSummary[];
  queue: Step[]; // the next sitting's worth of unfinished steps (same week)
  queueMinutes: number;
  currentWeekId: string | null;
  currentWeekTitle: string;
  currentPhase: string;
  recentDone: Step[]; // last few completed steps (context)
  nextStepId: string | null;
  totalSteps: number;
  doneSteps: number;
  percent: number;
  startDate: string;
  finishEstimate: string;
  behindWeeks: number;
  sessionMinutes: number;
}

export function computePlan(done: Set<string>, settings: Settings, now: number): Plan {
  const sessionMinutes = Math.max(30, parseInt(settings.session_minutes || "120", 10) || 120);
  const startDate = settings.start_date || "2026-07-08";
  const base = parseUTC(startDate);
  const steps = buildSteps(done);

  // group into weeks (preserve order)
  const weeks: WeekSummary[] = [];
  for (const s of steps) {
    let w = weeks[weeks.length - 1];
    if (!w || w.weekId !== s.weekId) {
      w = {
        weekId: s.weekId, phase: s.phase, title: s.weekTitle, weekIndex: s.weekIndex,
        startDate: s.weekIndex >= 0 ? iso(base + s.weekIndex * 7 * DAY) : null,
        totalMinutes: 0, doneSteps: 0, totalSteps: 0, steps: [],
      };
      weeks.push(w);
    }
    w.steps.push(s);
    w.totalMinutes += s.minutes;
    w.totalSteps++;
    if (s.done) w.doneSteps++;
  }

  // rolling "Now" queue: next unfinished steps within the same week, ~one sitting.
  const firstIdx = steps.findIndex((s) => !s.done);
  const queue: Step[] = [];
  let queueMinutes = 0;
  if (firstIdx >= 0) {
    const weekId = steps[firstIdx].weekId;
    for (let i = firstIdx; i < steps.length; i++) {
      const s = steps[i];
      if (s.weekId !== weekId) break; // don't spill into the next week
      if (queue.length && queueMinutes >= sessionMinutes) break; // ~one sitting
      if (s.done) continue; // keep only unfinished in the queue
      queue.push(s);
      queueMinutes += s.minutes;
    }
  }

  const recentDone = steps.filter((s) => s.done).slice(-3);
  const next = firstIdx >= 0 ? steps[firstIdx] : null;
  const weekCount = Math.max(1, weeks.filter((w) => w.weekIndex >= 0).length);
  const expectedWeek = Math.min(Math.max(0, Math.floor((now - base) / (7 * DAY))), weekCount - 1);
  const currentWeek = next && next.weekIndex >= 0 ? next.weekIndex : weekCount - 1;

  return {
    weeks,
    queue,
    queueMinutes,
    currentWeekId: next?.weekId ?? null,
    currentWeekTitle: next?.weekTitle ?? "All done 🎓",
    currentPhase: next?.phase ?? "",
    recentDone,
    nextStepId: next?.id ?? null,
    totalSteps: steps.length,
    doneSteps: steps.filter((s) => s.done).length,
    percent: steps.length ? Math.round((100 * steps.filter((s) => s.done).length) / steps.length) : 0,
    startDate,
    finishEstimate: iso(base + weekCount * 7 * DAY),
    behindWeeks: expectedWeek - currentWeek,
    sessionMinutes,
  };
}
