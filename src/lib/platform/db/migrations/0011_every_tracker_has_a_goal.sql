-- ADR 0025: every tracker has a goal, so its bar on Home has something to fill.
-- Trackers saved without one get the goal that suits any tracker: logging on 7 days a week.
UPDATE tracker
SET goal = json_object(
	'type', 'period',
	'measure', 'days',
	'target', 7,
	'direction', 'at_least',
	'period', 'week'
)
WHERE goal IS NULL;
