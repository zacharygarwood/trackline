-- App-wide settings such as the weight unit and first day of the week, one row per key.
CREATE TABLE app_setting (
	key TEXT PRIMARY KEY NOT NULL,
	value TEXT NOT NULL
) STRICT;
