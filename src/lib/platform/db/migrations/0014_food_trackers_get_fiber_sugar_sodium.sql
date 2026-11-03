-- ADR 0025: the Food template now tracks fiber, sugar, and sodium. Food trackers made before
-- that have only servings, calories, protein, carbs, and fat, and their fields cannot be added
-- to from the app, so they get the three new optional fields here, after their own.
UPDATE tracker
SET fields = json_insert(
	fields,
	'$[#]', json_object('key', 'fiber', 'label', 'Fiber', 'required', json('false'), 'type', 'number', 'dimension', 'plain', 'unit', 'g'),
	'$[#]', json_object('key', 'sugar', 'label', 'Sugar', 'required', json('false'), 'type', 'number', 'dimension', 'plain', 'unit', 'g'),
	'$[#]', json_object('key', 'sodium', 'label', 'Sodium', 'required', json('false'), 'type', 'number', 'dimension', 'plain', 'unit', 'mg')
)
WHERE kind = 'food'
	AND json_array_length(fields) <= 5
	AND NOT EXISTS (
		SELECT 1 FROM json_each(tracker.fields)
		WHERE json_extract(value, '$.key') IN ('fiber', 'sugar', 'sodium')
	);
