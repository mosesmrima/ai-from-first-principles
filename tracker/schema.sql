-- AI Curriculum Tracker — D1 schema
-- Safe to re-run: drops and recreates. Seed separately with seed/seed.sql.

DROP TABLE IF EXISTS milestones;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS settings;

CREATE TABLE milestones (
  id          TEXT PRIMARY KEY,          -- e.g. 'week01', 'portfolio02', 'advanced'
  phase       TEXT NOT NULL,             -- 'Phase 1 — Math', ...
  title       TEXT NOT NULL,
  kind        TEXT NOT NULL,             -- 'week' | 'portfolio' | 'research' | 'advanced'
  week_index  INTEGER,                   -- 0..76 for kind='week', else NULL
  sort        INTEGER NOT NULL,          -- global display order
  done        INTEGER NOT NULL DEFAULT 0,
  done_at     TEXT                       -- ISO timestamp when marked done
);
CREATE INDEX idx_milestones_sort ON milestones(sort);
CREATE INDEX idx_milestones_week ON milestones(week_index);

CREATE TABLE resources (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  scope    TEXT NOT NULL,                -- 'phase' | 'week'
  ref      TEXT NOT NULL,                -- phase label or milestone id
  title    TEXT NOT NULL,
  url      TEXT NOT NULL,
  kind     TEXT NOT NULL DEFAULT 'link', -- 'youtube' | 'course' | 'paper' | 'link'
  pinned   INTEGER NOT NULL DEFAULT 0,   -- user-added favourites float to top
  sort     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_resources_ref ON resources(ref);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
