-- ADR 0026: foods from the built-in food database keep their full name and serving,
-- such as "Cereals, oats, regular and quick, not fortified, dry, 1 cup", so a thing in a
-- library may have a name of up to 240 characters. Tracker names stay at 40.
-- SQLite cannot change a CHECK in place, so subject is rebuilt. Dropping it while entries
-- still pointed at it would cascade-delete them, so entry is rebuilt first to point at the
-- new table, the old tables are dropped child first, and the renames keep the references.
CREATE TABLE subject_new (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 240),
	field_keys TEXT NOT NULL CHECK (json_valid(field_keys)),
	defaults TEXT NOT NULL CHECK (json_valid(defaults)),
	archived INTEGER NOT NULL CHECK (archived IN (0, 1)),
	recipe TEXT CHECK (recipe IS NULL OR json_valid(recipe))
) STRICT;

INSERT INTO subject_new (id, tracker_id, name, field_keys, defaults, archived, recipe)
SELECT id, tracker_id, name, field_keys, defaults, archived, recipe FROM subject;

CREATE TABLE entry_new (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	logged_at INTEGER NOT NULL,
	subject_id TEXT REFERENCES subject_new (id) ON DELETE CASCADE,
	session_id TEXT REFERENCES session (id) ON DELETE CASCADE,
	field_values TEXT NOT NULL CHECK (json_valid(field_values))
) STRICT;

INSERT INTO entry_new (id, tracker_id, date, logged_at, subject_id, session_id, field_values)
SELECT id, tracker_id, date, logged_at, subject_id, session_id, field_values FROM entry;

DROP TABLE entry;
DROP TABLE subject;
ALTER TABLE subject_new RENAME TO subject;
ALTER TABLE entry_new RENAME TO entry;

-- Home and Stats: entries since a day, in order.
CREATE INDEX entry_by_date ON entry (date, logged_at);
-- A workout's sets.
CREATE INDEX entry_by_session ON entry (session_id);
-- A tracker's entries by day.
CREATE INDEX entry_by_tracker ON entry (tracker_id, date, logged_at);
-- A tracker's library by name.
CREATE INDEX subject_by_tracker ON subject (tracker_id, name);
