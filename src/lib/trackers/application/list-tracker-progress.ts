import type { Clock } from '../../shared/clock.ts';
import { first, last } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { startOfWeek } from '../../shared/week.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import { Measure, type ExerciseMeasure, type MacroMeasure } from '../domain/tracker.constants.ts';
import {
	combineEntries,
	fillOf,
	periodStart,
	sourceOf,
	type Tracker,
	type TrackerEntry
} from '../domain/tracker.ts';
import { TrackerSource } from '../domain/tracker.constants.ts';
import type { TrackerEntries, Trackers, TrackerSources } from './tracker-ports.ts';

/** A tracker, its value this day or week, and how full its bar is. */
export interface TrackerProgress {
	readonly tracker: Tracker;
	/** Undefined for weight before the first weigh-in. */
	readonly value: number | undefined;
	/** From 0 to 1. */
	readonly fill: number;
}

/** The day weeks begin on, for weekly trackers. */
export interface ListTrackerProgressCommand {
	readonly weekStart: WeekStart;
}

/** What listing tracker progress needs. */
export interface ListTrackerProgressPorts {
	readonly trackers: Trackers;
	readonly entries: TrackerEntries;
	readonly sources: TrackerSources;
	readonly clock: Clock;
}

const isMacro = (measure: Measure): measure is MacroMeasure =>
	measure === Measure.calories ||
	measure === Measure.protein ||
	measure === Measure.carbs ||
	measure === Measure.fat;

/** Lists every tracker in Home order with its current value. */
export class ListTrackerProgress {
	constructor(private readonly ports: ListTrackerProgressPorts) {}

	/** @param command - The week start. */
	async execute(command: ListTrackerProgressCommand): Promise<readonly TrackerProgress[]> {
		const today = this.ports.clock.today();
		const [trackers, entries, weights] = await Promise.all([
			this.ports.trackers.findAll(),
			this.ports.entries.findSince(startOfWeek(today, command.weekStart)),
			this.ports.sources.weights()
		]);
		return Promise.all(
			trackers.map(async (tracker) => {
				if (tracker.measure === Measure.weight) {
					const latest = last(weights);
					const fill = latest === undefined ? 0 : fillOf(tracker, latest, first(weights));
					return { tracker, value: latest, fill };
				}
				const since = periodStart(tracker.period, today, command.weekStart);
				const value = await this.valueOf(tracker, entries, since);
				return { tracker, value, fill: fillOf(tracker, value) };
			})
		);
	}

	private valueOf(
		tracker: Tracker,
		entries: readonly TrackerEntry[],
		since: LocalDate
	): Promise<number> {
		const { measure, subjectId } = tracker;
		const { sources } = this.ports;
		if (sourceOf(measure) === TrackerSource.log) {
			return Promise.resolve(combineEntries(tracker, entries, since));
		}
		if (isMacro(measure)) return sources.macroTotal(measure, since);
		if (measure === Measure.workouts) return sources.workoutCount(since);
		if (measure === Measure.food) return sources.foodAmount(subjectId ?? '', since);
		return sources.exerciseTotal(subjectId ?? '', exerciseMeasure(measure), since);
	}
}

const EXERCISE_MEASURES: readonly ExerciseMeasure[] = [
	Measure.distance,
	Measure.time,
	Measure.reps,
	Measure.sets
];

function exerciseMeasure(measure: Measure): ExerciseMeasure {
	return EXERCISE_MEASURES.find((candidate) => candidate === measure) ?? Measure.sessions;
}
