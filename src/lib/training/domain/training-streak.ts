import type { LocalDate } from '../../shared/local-date.ts';

/** How many consecutive days the user has trained or rested on purpose. */
export interface TrainingStreak {
	/** The run ending today, or yesterday if today has nothing yet. */
	readonly current: number;
	/** The longest run ever. */
	readonly longest: number;
}

/** The days that count toward a streak. */
export interface TrainingDays {
	readonly trained: readonly LocalDate[];
	readonly rested: readonly LocalDate[];
	readonly today: LocalDate;
}

function longestRun(days: readonly number[]): number {
	let longest = 0;
	let run = 0;
	days.forEach((day, position) => {
		run = position > 0 && days.at(position - 1) === day - 1 ? run + 1 : 1;
		longest = Math.max(longest, run);
	});
	return longest;
}

function runEndingOn(active: ReadonlySet<number>, lastDay: number): number {
	let run = 0;
	while (active.has(lastDay - run)) run += 1;
	return run;
}

/**
 * Counts training streaks. A streak is consecutive days that each have a
 * workout or a rest day. Today never breaks a streak until it is over.
 *
 * @param days - Days with workouts, rest days, and today's date.
 */
export function trainingStreak(days: TrainingDays): TrainingStreak {
	const active = new Set([...days.trained, ...days.rested].map((date) => date.toEpochDay()));
	const today = days.today.toEpochDay();
	const current = runEndingOn(active, active.has(today) ? today : today - 1);
	return { current, longest: longestRun([...active].toSorted((a, b) => a - b)) };
}
