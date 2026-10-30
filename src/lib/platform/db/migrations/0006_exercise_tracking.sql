-- Exercises choose what they track, and sets record time, distance, grade, or count as well as reps and weight.
-- Existing exercises keep tracking weight and reps.
ALTER TABLE exercise ADD COLUMN tracked_fields TEXT NOT NULL DEFAULT 'weight,reps'
	CHECK (length(tracked_fields) BETWEEN 1 AND 60);

ALTER TABLE exercise ADD COLUMN grade_scale TEXT
	CHECK (grade_scale IN ('v', 'yds', 'font', 'one_to_ten', 'custom'));

-- The user's own grades, easiest first, as a JSON array of strings; only for the custom scale.
ALTER TABLE exercise ADD COLUMN custom_grades TEXT
	CHECK ((grade_scale = 'custom') = (custom_grades IS NOT NULL));

ALTER TABLE exercise ADD COLUMN count_label TEXT
	CHECK (count_label IS NULL OR length(count_label) BETWEEN 1 AND 30);

-- SQLite can't relax NOT NULL in place, so workout_set is rebuilt with every measure optional.
CREATE TABLE workout_set_new (
	workout_id TEXT NOT NULL,
	exercise_position INTEGER NOT NULL,
	position INTEGER NOT NULL CHECK (position >= 0),
	reps INTEGER CHECK (reps IS NULL OR reps BETWEEN 1 AND 999),
	weight_kg REAL CHECK (weight_kg IS NULL OR weight_kg >= 0),
	seconds REAL CHECK (seconds IS NULL OR seconds >= 0),
	distance_m REAL CHECK (distance_m IS NULL OR distance_m >= 0),
	grade INTEGER CHECK (grade IS NULL OR grade >= 0),
	count REAL CHECK (count IS NULL OR count >= 0),
	completed INTEGER NOT NULL CHECK (completed IN (0, 1)),
	CHECK (coalesce(reps, weight_kg, seconds, distance_m, grade, count) IS NOT NULL),
	PRIMARY KEY (workout_id, exercise_position, position),
	FOREIGN KEY (workout_id, exercise_position)
		REFERENCES workout_exercise (workout_id, position) ON DELETE CASCADE
) STRICT;

INSERT INTO workout_set_new (workout_id, exercise_position, position, reps, weight_kg, completed)
	SELECT workout_id, exercise_position, position, reps, weight_kg, completed FROM workout_set;

DROP TABLE workout_set;

ALTER TABLE workout_set_new RENAME TO workout_set;
