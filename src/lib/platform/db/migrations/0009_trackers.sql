-- Trackers replace the tap-to-add habits of 0008, which never shipped.
DROP TABLE habit_entry;
DROP TABLE habit;

-- What Home tracks: a measure from the food log, workouts, weigh-ins, or the user's own log, and a goal.
-- subject_id is the food or exercise a measure reads; deleting either only hides it, so there is no foreign key.
CREATE TABLE tracker (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
	position INTEGER NOT NULL CHECK (position >= 0),
	measure TEXT NOT NULL CHECK (measure IN ('calories', 'protein', 'carbs', 'fat', 'food', 'workouts',
		'sessions', 'distance', 'time', 'reps', 'sets', 'weight', 'number', 'duration', 'rating', 'done')),
	subject_id TEXT,
	unit TEXT NOT NULL CHECK (length(unit) <= 20),
	goal REAL NOT NULL CHECK (goal > 0),
	direction TEXT NOT NULL CHECK (direction IN ('at_least', 'at_most')),
	period TEXT NOT NULL CHECK (period IN ('day', 'week')),
	combine TEXT NOT NULL CHECK (combine IN ('total', 'average', 'days'))
) STRICT;

-- Values the user logs to their own trackers; deleting the tracker deletes them.
CREATE TABLE tracker_entry (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	value REAL NOT NULL CHECK (value > 0)
) STRICT;

-- findSince reads the current week; findLatest one tracker's newest.
CREATE INDEX tracker_entry_by_date ON tracker_entry (date);
CREATE INDEX tracker_entry_by_tracker ON tracker_entry (tracker_id, date);

-- A row once the starting trackers were made, so deleting them all doesn't bring them back.
CREATE TABLE tracker_setup (id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1)) STRICT;
