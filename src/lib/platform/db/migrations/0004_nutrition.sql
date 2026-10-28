CREATE TABLE food (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
	reference_amount REAL NOT NULL CHECK (reference_amount > 0),
	reference_unit TEXT NOT NULL CHECK (length(reference_unit) BETWEEN 1 AND 20),
	calories REAL NOT NULL CHECK (calories >= 0),
	protein_g REAL NOT NULL CHECK (protein_g >= 0),
	carbs_g REAL NOT NULL CHECK (carbs_g >= 0),
	fat_g REAL NOT NULL CHECK (fat_g >= 0)
) STRICT;

CREATE TABLE saved_meal (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60)
) STRICT;

CREATE TABLE saved_meal_item (
	meal_id TEXT NOT NULL REFERENCES saved_meal (id) ON DELETE CASCADE,
	position INTEGER NOT NULL CHECK (position >= 0),
	food_id TEXT NOT NULL REFERENCES food (id),
	amount REAL NOT NULL CHECK (amount > 0),
	PRIMARY KEY (meal_id, position)
) STRICT;

-- Name, unit, and macros are snapshots taken when the entry is logged.
CREATE TABLE food_log_entry (
	id TEXT PRIMARY KEY NOT NULL,
	date TEXT NOT NULL,
	slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'dinner', 'snacks')),
	food_id TEXT NOT NULL REFERENCES food (id),
	food_name TEXT NOT NULL,
	unit TEXT NOT NULL,
	amount REAL NOT NULL CHECK (amount > 0),
	calories REAL NOT NULL CHECK (calories >= 0),
	protein_g REAL NOT NULL CHECK (protein_g >= 0),
	carbs_g REAL NOT NULL CHECK (carbs_g >= 0),
	fat_g REAL NOT NULL CHECK (fat_g >= 0),
	logged_at INTEGER NOT NULL
) STRICT;

-- findByDate reads one day of the log in logging order.
CREATE INDEX food_log_entry_by_date ON food_log_entry (date, logged_at);

-- findLastFor and the recently-logged order of the food list.
CREATE INDEX food_log_entry_by_food ON food_log_entry (food_id, logged_at);

-- One goals version per start date; findAll reads them all.
CREATE TABLE daily_goals (
	effective_from TEXT PRIMARY KEY NOT NULL,
	calories REAL NOT NULL CHECK (calories >= 0),
	protein_g REAL NOT NULL CHECK (protein_g >= 0),
	carbs_g REAL NOT NULL CHECK (carbs_g >= 0),
	fat_g REAL NOT NULL CHECK (fat_g >= 0)
) STRICT;
