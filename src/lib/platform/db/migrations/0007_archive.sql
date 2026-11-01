-- Deleting an exercise or food hides it from the library; workouts and the food log keep pointing at it.
ALTER TABLE exercise ADD COLUMN archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1));

ALTER TABLE food ADD COLUMN archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1));
