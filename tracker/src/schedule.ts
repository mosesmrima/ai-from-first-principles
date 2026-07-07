// Pure scheduling logic: turn the ordered curriculum into a dated timetable and
// compute "where you should be" vs "where you are". No I/O here — takes rows + settings.

export interface Milestone {
  id: string;
  phase: string;
  title: string;
  kind: "week" | "portfolio" | "research" | "advanced";
  week_index: number | null;
  sort: number;
  done: number; // 0/1
  done_at: string | null;
}

export interface Settings {
  start_date: string; // 'YYYY-MM-DD'
  pace_weeks_per_slot: string; // e.g. '1'
  buffer_per_phase: string; // '0' | '1'
  [k: string]: string;
}

const DAY = 86_400_000;

function parseUTC(d: string): number {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}
function iso(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export type SlotType = "week" | "buffer";
export interface Slot {
  index: number;
  type: SlotType;
  phase: string;
  title: string;
  milestoneId: string | null; // null for buffer weeks
  start: string; // ISO date
  end: string; // ISO date (inclusive)
  status: "past" | "current" | "future";
}

export interface Timetable {
  slots: Slot[];
  status: {
    startDate: string;
    finishDate: string;
    todayIndex: number; // current slot index (clamped)
    currentPhase: string;
    currentTitle: string;
    completedContent: number;
    totalContent: number;
    expectedDone: number; // content weeks that should be finished by now
    behind: number; // >0 behind, <0 ahead, 0 on track
    nextWeekId: string | null;
    nextWeekTitle: string | null;
    percent: number; // over ALL milestones
  };
}

export function buildTimetable(all: Milestone[], settings: Settings, now: number): Timetable {
  const base = parseUTC(settings.start_date);
  const pace = Math.max(0.25, parseFloat(settings.pace_weeks_per_slot || "1") || 1);
  const withBuffers = (settings.buffer_per_phase ?? "1") !== "0";

  const weeks = all
    .filter((m) => m.kind === "week")
    .sort((a, b) => (a.week_index ?? 0) - (b.week_index ?? 0));

  // Assemble ordered slots, inserting a buffer after the last week of each phase (except Phase 0).
  type Raw = { type: SlotType; phase: string; title: string; milestoneId: string | null };
  const raw: Raw[] = [];
  weeks.forEach((w, i) => {
    raw.push({ type: "week", phase: w.phase, title: w.title, milestoneId: w.id });
    const next = weeks[i + 1];
    const isPhaseEnd = !next || next.phase !== w.phase;
    if (withBuffers && isPhaseEnd && w.phase !== "Phase 0 — Setup") {
      raw.push({ type: "buffer", phase: w.phase, title: "Review & buffer week", milestoneId: null });
    }
  });

  const slotDays = pace * 7;
  const slots: Slot[] = raw.map((r, index) => {
    const start = base + Math.round(index * slotDays) * DAY;
    const end = base + (Math.round((index + 1) * slotDays) - 1) * DAY;
    return { index, ...r, start: iso(start), end: iso(end), status: "future" };
  });

  const todayIndex = Math.min(
    Math.max(0, Math.floor((now - base) / (slotDays * DAY))),
    Math.max(0, slots.length - 1)
  );
  for (const s of slots) {
    s.status = s.index < todayIndex ? "past" : s.index === todayIndex ? "current" : "future";
  }

  // "Should be done" = content (week) slots whose end date is before now.
  const weekSlots = slots.filter((s) => s.type === "week");
  const expectedDone = weekSlots.filter((s) => parseUTC(s.end) < now).length;
  const completedContent = weeks.filter((w) => w.done).length;
  const nextWeek = weeks.find((w) => !w.done) ?? null;

  const totalAll = all.length;
  const doneAll = all.filter((m) => m.done).length;
  const cur = slots[todayIndex] ?? slots[slots.length - 1];

  return {
    slots,
    status: {
      startDate: settings.start_date,
      finishDate: slots.length ? slots[slots.length - 1].end : settings.start_date,
      todayIndex,
      currentPhase: cur?.phase ?? "—",
      currentTitle: cur?.title ?? "—",
      completedContent,
      totalContent: weeks.length,
      expectedDone,
      behind: expectedDone - completedContent,
      nextWeekId: nextWeek?.id ?? null,
      nextWeekTitle: nextWeek?.title ?? null,
      percent: totalAll ? Math.round((100 * doneAll) / totalAll) : 0,
    },
  };
}
