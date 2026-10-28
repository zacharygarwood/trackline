-- The exercise library. NOCASE makes names unique ignoring case and serves findByName.
CREATE TABLE exercise (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (length(name) BETWEEN 1 AND 60)
) STRICT;

CREATE TABLE workout_template (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
	position INTEGER NOT NULL CHECK (position >= 0)
) STRICT;

CREATE TABLE template_exercise (
	template_id TEXT NOT NULL REFERENCES workout_template (id) ON DELETE CASCADE,
	position INTEGER NOT NULL CHECK (position >= 0),
	exercise_id TEXT NOT NULL REFERENCES exercise (id),
	target_sets INTEGER NOT NULL CHECK (target_sets BETWEEN 1 AND 20),
	PRIMARY KEY (template_id, position)
) STRICT;

-- finished_at is NULL while the workout is in progress.
CREATE TABLE workout (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL,
	started_at INTEGER NOT NULL,
	finished_at INTEGER,
	note TEXT NOT NULL,
	source_template_id TEXT REFERENCES workout_template (id) ON DELETE SET NULL
) STRICT;

-- At most one workout in progress: every active row has the same indexed value.
CREATE UNIQUE INDEX workout_one_active ON workout ((finished_at IS NULL)) WHERE finished_at IS NULL;

-- findRecent, findLastWith, and findTrainedDates read finished workouts newest first.
CREATE INDEX workout_by_date ON workout (date, started_at);

CREATE TABLE workout_exercise (
	workout_id TEXT NOT NULL REFERENCES workout (id) ON DELETE CASCADE,
	position INTEGER NOT NULL CHECK (position >= 0),
	exercise_id TEXT NOT NULL REFERENCES exercise (id),
	PRIMARY KEY (workout_id, position)
) STRICT;

-- findLastWith looks up workouts by exercise.
CREATE INDEX workout_exercise_by_exercise ON workout_exercise (exercise_id);

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

-- One rest day per date; the unique index serves findByDate.
CREATE TABLE rest_day (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL UNIQUE
) STRICT;
