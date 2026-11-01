import {
	Combine,
	Direction,
	Measure,
	Period
} from '../../src/lib/trackers/domain/tracker.constants.ts';
import type { Tracker } from '../../src/lib/trackers/domain/tracker.ts';
import { anId } from './training.builder.ts';

/**
 * A valid tracker of something the user logs, with any fields replaced.
 *
 * @param fields - Fields to replace.
 */
export function aTracker(fields: Partial<Tracker> = {}): Tracker {
	return {
		id: anId<'Tracker'>(),
		name: 'Water',
		position: 0,
		measure: Measure.number,
		subjectId: undefined,
		unit: 'glasses',
		goal: 8,
		direction: Direction.atLeast,
		period: Period.day,
		combine: Combine.total,
		...fields
	};
}

/**
 * What saving a new tracker takes: {@link aTracker} without its id and place.
 *
 * @param fields - Fields to replace.
 */
export function aTrackerCommand(fields: Partial<Tracker> = {}): Omit<Tracker, 'id' | 'position'> {
	const tracker = aTracker(fields);
	return {
		name: tracker.name,
		measure: tracker.measure,
		subjectId: tracker.subjectId,
		unit: tracker.unit,
		goal: tracker.goal,
		direction: tracker.direction,
		period: tracker.period,
		combine: tracker.combine
	};
}
