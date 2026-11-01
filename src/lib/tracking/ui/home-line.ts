import type { HomeRow } from '../application/progress.ts';
import type { DisplayUnits } from './display-units.ts';
import { goalDetail, progressText } from './value-format.ts';

/** What one tracker's line on Home shows: its progress and the bar toward its goal. */
export interface HomeLine {
	readonly value: string;
	readonly detail: string;
	/** How full the bar is, from 0 to 1. */
	readonly fraction: number;
}

/**
 * A tracker's line on Home: its progress toward its goal.
 *
 * @param row - The tracker and its progress.
 * @param units - The user's units.
 */
export function homeLine(row: HomeRow, units: DisplayUnits): HomeLine {
	const { tracker, progress } = row;
	const value = progress.value === undefined ? '' : progressText(tracker, progress.value, units);
	return { value, detail: goalDetail(tracker, units), fraction: progress.fill };
}
