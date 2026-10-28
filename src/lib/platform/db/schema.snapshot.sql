CREATE TABLE app_setting (
	key TEXT PRIMARY KEY NOT NULL,
	value TEXT NOT NULL
) STRICT;

CREATE TABLE weigh_in (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL UNIQUE,
	weight_kg REAL NOT NULL CHECK (weight_kg > 0)
) STRICT;

CREATE TABLE weight_goal (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	target_kg REAL NOT NULL CHECK (target_kg > 0),
	direction TEXT NOT NULL CHECK (direction IN ('lose', 'gain', 'maintain'))
) STRICT;
