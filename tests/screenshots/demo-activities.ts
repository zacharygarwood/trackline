/**
 * The sets of one demo activity session, as workout_set columns from reps to count:
 * a run that gets longer, climbs that get harder, or a yoga session.
 *
 * @param name - The activity.
 * @param back - How many days before the demo's today.
 */
export function activitySets(name: string, back: number): (readonly (number | null)[])[] {
	if (name === 'Run')
		return [[null, null, 1500 + (back % 5) * 60, 4000 + (300 - back) * 5, null, null]];
	if (name === 'Bouldering') {
		const top = 3 + Math.floor((300 - back) / 90);
		return [top - 2, top - 1, top - 1, top].map((grade) => [null, null, null, null, grade, null]);
	}
	return [[null, null, 2400 + (back % 3) * 300, null, null, null]];
}
