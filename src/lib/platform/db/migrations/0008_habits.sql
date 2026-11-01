-- Custom trackers the user makes for anything they count, such as glasses of water a day.
CREATE TABLE habit (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
	unit TEXT NOT NULL CHECK (length(unit) <= 20),
	goal REAL NOT NULL CHECK (goal > 0),
	step REAL NOT NULL CHECK (step > 0),
	period TEXT NOT NULL CHECK (period IN ('day', 'week'))
) STRICT;

-- Each tap on a tracker; deleting the tracker deletes them.
CREATE TABLE habit_entry (
	id TEXT PRIMARY KEY NOT NULL,
	habit_id TEXT NOT NULL REFERENCES habit (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	amount REAL NOT NULL CHECK (amount > 0)
) STRICT;

-- findSince reads the current week of entries.
CREATE INDEX habit_entry_by_date ON habit_entry (date);
