-- ADR 0025: a food in a library can be a recipe, made of other foods.
-- The JSON holds its ingredients (a food and the servings of it) and how many servings it makes;
-- NULL for a plain food. Its per-serving numbers stay in defaults, worked out when it is saved.
ALTER TABLE subject ADD COLUMN recipe TEXT CHECK (recipe IS NULL OR json_valid(recipe));
