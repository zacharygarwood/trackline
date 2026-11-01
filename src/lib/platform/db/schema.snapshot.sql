CREATE INDEX entry_by_date ON entry (date, logged_at);

CREATE INDEX entry_by_session ON entry (session_id);

CREATE INDEX entry_by_tracker ON entry (tracker_id, date, logged_at);

CREATE INDEX session_by_tracker ON session (tracker_id, started_at);

CREATE INDEX subject_by_tracker ON subject (tracker_id, name);

CREATE TABLE app_setting (
	key TEXT PRIMARY KEY NOT NULL,
	value TEXT NOT NULL
) STRICT;

CREATE TABLE entry (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	logged_at INTEGER NOT NULL,
	subject_id TEXT REFERENCES subject (id) ON DELETE CASCADE,
	session_id TEXT REFERENCES session (id) ON DELETE CASCADE,
	field_values TEXT NOT NULL CHECK (json_valid(field_values))
) STRICT;

CREATE TABLE session (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	started_at INTEGER NOT NULL,
	finished_at INTEGER CHECK (finished_at IS NULL OR finished_at >= started_at)
) STRICT;

CREATE TABLE subject (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
	field_keys TEXT NOT NULL CHECK (json_valid(field_keys)),
	defaults TEXT NOT NULL CHECK (json_valid(defaults)),
	archived INTEGER NOT NULL CHECK (archived IN (0, 1))
) STRICT;

CREATE TABLE tracker (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
	icon TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('log', 'photos', 'collection', 'workout', 'food')),
	position INTEGER NOT NULL CHECK (position >= 0),
	fields TEXT NOT NULL CHECK (json_valid(fields)),
	goal TEXT CHECK (goal IS NULL OR json_valid(goal))
) STRICT;
