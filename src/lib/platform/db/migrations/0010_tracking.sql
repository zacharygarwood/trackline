-- ADR 0025: one tracking model replaces the training, nutrition, body, and trackers tables,
-- which never held real data. Settings stay, apart from the ones the old screens used,
-- and setup starts again so onboarding offers the templates.
DROP TABLE IF EXISTS tracker_setup;
DROP TABLE IF EXISTS tracker_entry;
DROP TABLE IF EXISTS tracker;
DROP TABLE IF EXISTS saved_meal_item;
DROP TABLE IF EXISTS saved_meal;
DROP TABLE IF EXISTS food_log_entry;
DROP TABLE IF EXISTS food;
DROP TABLE IF EXISTS daily_goals;
DROP TABLE IF EXISTS workout_set;
DROP TABLE IF EXISTS workout_exercise;
DROP TABLE IF EXISTS workout;
DROP TABLE IF EXISTS template_exercise;
DROP TABLE IF EXISTS workout_template;
DROP TABLE IF EXISTS rest_day;
DROP TABLE IF EXISTS exercise;
DROP TABLE IF EXISTS progress_photo;
DROP TABLE IF EXISTS weigh_in;
DROP TABLE IF EXISTS weight_goal;
DELETE FROM app_setting WHERE key IN ('track_carbs_and_fat', 'new_food_unit',
	'weekly_workout_goal', 'home_trackers', 'setup_complete');

-- Something the user tracks. fields is a JSON array of the tracker's fields, goal a JSON goal.
CREATE TABLE tracker (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
	icon TEXT NOT NULL,
	kind TEXT NOT NULL CHECK (kind IN ('log', 'photos', 'collection', 'workout', 'food')),
	position INTEGER NOT NULL CHECK (position >= 0),
	fields TEXT NOT NULL CHECK (json_valid(fields)),
	goal TEXT CHECK (goal IS NULL OR json_valid(goal))
) STRICT;

-- The things in a tracker's library: exercises, foods, plants. Deleting one only archives it.
CREATE TABLE subject (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
	field_keys TEXT NOT NULL CHECK (json_valid(field_keys)),
	defaults TEXT NOT NULL CHECK (json_valid(defaults)),
	archived INTEGER NOT NULL CHECK (archived IN (0, 1))
) STRICT;

-- findFor lists one tracker's library by name.
CREATE INDEX subject_by_tracker ON subject (tracker_id, name);

-- Groups of entries done together, such as workouts. finished_at is NULL while under way.
CREATE TABLE session (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	started_at INTEGER NOT NULL,
	finished_at INTEGER CHECK (finished_at IS NULL OR finished_at >= started_at)
) STRICT;

-- findFor lists one tracker's sessions, newest first.
CREATE INDEX session_by_tracker ON session (tracker_id, started_at);

-- What the user logs. field_values is a JSON object of each filled field's value.
CREATE TABLE entry (
	id TEXT PRIMARY KEY NOT NULL,
	tracker_id TEXT NOT NULL REFERENCES tracker (id) ON DELETE CASCADE,
	date TEXT NOT NULL,
	logged_at INTEGER NOT NULL,
	subject_id TEXT REFERENCES subject (id) ON DELETE CASCADE,
	session_id TEXT REFERENCES session (id) ON DELETE CASCADE,
	field_values TEXT NOT NULL CHECK (json_valid(field_values))
) STRICT;

-- findSince reads Home's current periods; findFor one tracker's history; the session index
-- serves deleting a session's entries.
CREATE INDEX entry_by_date ON entry (date, logged_at);
CREATE INDEX entry_by_tracker ON entry (tracker_id, date, logged_at);
CREATE INDEX entry_by_session ON entry (session_id);
