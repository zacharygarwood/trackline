import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import {
	periodStart,
	progressOf,
	type Calendar,
	type Goal,
	type Progress
} from '../domain/goal.ts';
import { seriesOf } from '../domain/series.ts';
import type { ActiveSession, Session } from '../domain/session.ts';
import type { Tracker } from '../domain/tracker.ts';
import type { EntryReader, SessionReader, TrackerReader } from '../domain/tracking-repositories.ts';
import { GoalType, KIND_RULES, SessionState } from '../domain/tracking.constants.ts';

/** The day weeks begin on, which places this week's goals. */
export interface WeekStartCommand {
	readonly weekStart: WeekStart;
}

/** One tracker on Home: how far it is toward its goal, and a session under way. */
export interface HomeRow {
	readonly tracker: Tracker;
	readonly progress: Progress;
	readonly active: ActiveSession | undefined;
}

/** What reading progress needs. */
export interface ProgressPorts {
	readonly trackers: TrackerReader;
	readonly entries: EntryReader;
	readonly sessions: SessionReader;
	readonly clock: Clock;
}

function needsWholeHistory(goal: Goal): boolean {
	return goal.type === GoalType.target;
}

function earliestStart(trackers: readonly Tracker[], calendar: Calendar): LocalDate {
	return trackers.reduce((earliest, { goal }) => {
		if (goal.type !== GoalType.period) return earliest;
		const start = periodStart(goal.period, calendar);
		return start.isBefore(earliest) ? start : earliest;
	}, calendar.today);
}

async function sessionsOf(sessions: SessionReader, tracker: Tracker): Promise<readonly Session[]> {
	return KIND_RULES[tracker.kind].sessions ? sessions.findFor(tracker.id) : [];
}

/** Lists every tracker for Home, in order, with its progress this day, week, or month. */
export class ListHome {
	constructor(private readonly ports: ProgressPorts) {}

	/** @param command - The week start. */
	async execute(command: WeekStartCommand): Promise<readonly HomeRow[]> {
		const { trackers, entries, sessions, clock } = this.ports;
		const calendar = { today: clock.today(), weekStart: command.weekStart };
		const all = await trackers.findAll();
		const recent = await entries.findSince(earliestStart(all, calendar));
		return Promise.all(
			all.map(async (tracker) => {
				const logged = needsWholeHistory(tracker.goal)
					? await entries.findFor(tracker.id)
					: recent.filter((entry) => entry.trackerId === tracker.id);
				const history = { entries: logged, sessions: await sessionsOf(sessions, tracker) };
				return {
					tracker,
					progress: progressOf(tracker.goal, history, calendar),
					active: history.sessions.find(
						(session): session is ActiveSession => session.state === SessionState.active
					)
				};
			})
		);
	}
}

/** One tracker's chart on Stats: its goal and its recent totals, averages, counts, or values. */
export interface TrackerSeries {
	readonly tracker: Tracker;
	readonly goal: Goal;
	/** Oldest first. */
	readonly values: readonly number[];
}

/** Lists a chart for every tracker, in Home order. */
export class ListStats {
	constructor(private readonly ports: ProgressPorts) {}

	/** @param command - The week start. */
	async execute(command: WeekStartCommand): Promise<readonly TrackerSeries[]> {
		const { trackers, entries, sessions, clock } = this.ports;
		const calendar = { today: clock.today(), weekStart: command.weekStart };
		return Promise.all(
			(await trackers.findAll()).map(async (tracker) => {
				const { goal } = tracker;
				const history = {
					entries: await entries.findFor(tracker.id),
					sessions: await sessionsOf(sessions, tracker)
				};
				return { tracker, goal, values: seriesOf(goal, history, calendar) };
			})
		);
	}
}
