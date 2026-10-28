CREATE INDEX workout_by_date ON workout (date, started_at);

CREATE INDEX workout_exercise_by_exercise ON workout_exercise (exercise_id);

CREATE UNIQUE INDEX workout_one_active ON workout ((finished_at IS NULL)) WHERE finished_at IS NULL;

CREATE TABLE app_setting (
	key TEXT PRIMARY KEY NOT NULL,
	value TEXT NOT NULL
) STRICT;

CREATE TABLE exercise (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(name) BETWEEN 1 AND 60)
) STRICT;

CREATE TABLE rest_day (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE template_exercise (
	template_id TEXT NOT NULL REFERENCES workout_template (id) ON DELETE CASCADE,
	position INTEGER NOT NULL CHECK (position >= 0),
	exercise_id TEXT NOT NULL REFERENCES exercise (id),
	target_sets INTEGER NOT NULL CHECK (target_sets BETWEEN 1 AND 20),
	PRIMARY KEY (template_id, position)
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

CREATE TABLE workout (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL,
	started_at INTEGER NOT NULL,
	finished_at INTEGER,
	note TEXT NOT NULL,
	source_template_id TEXT REFERENCES workout_template (id) ON DELETE SET NULL
) STRICT;

CREATE TABLE workout_exercise (
	workout_id TEXT NOT NULL REFERENCES workout (id) ON DELETE CASCADE,
	position INTEGER NOT NULL CHECK (position >= 0),
	exercise_id TEXT NOT NULL REFERENCES exercise (id),
	PRIMARY KEY (workout_id, position)
) STRICT;

CREATE TABLE workout_set (
	workout_id TEXT NOT NULL,
	exercise_position INTEGER NOT NULL,
	position INTEGER NOT NULL CHECK (position >= 0),
	reps INTEGER NOT NULL CHECK (reps BETWEEN 1 AND 999),
	weight_kg REAL NOT NULL CHECK (weight_kg >= 0),
	completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
	PRIMARY KEY (workout_id, exercise_position, position),
	FOREIGN KEY (workout_id, exercise_position)
		REFERENCES workout_exercise (workout_id, position) ON DELETE CASCADE
) STRICT;

CREATE TABLE workout_template (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
	position INTEGER NOT NULL CHECK (position >= 0)
) STRICT;
