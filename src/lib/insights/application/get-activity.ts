import type { Clock } from '../../shared/clock.ts';
import type { ActivityDays, ActivityQuery, StreakSummary } from './insights-queries.ts';
import { startOfDays } from './stats-range.ts';

/** Enough days for 52 week columns, whichever weekday the current week started on. */
const ACTIVITY_DAYS = 364;

/** The last 52 weeks of activity and the training streak. */
export interface Activity {
	readonly days: ActivityDays;
	readonly streak: StreakSummary;
}

/** Reads the heatmap days and the current and longest training streaks. */
export class GetActivity {
	constructor(
		private readonly activity: ActivityQuery,
		private readonly clock: Clock
	) {}

	/** Reads activity up to today. */
	async execute(): Promise<Activity> {
		const today = this.clock.today();
		const [days, streak] = await Promise.all([
			this.activity.activityDays(startOfDays(today, ACTIVITY_DAYS)),
			this.activity.trainingStreak(today)
		]);
		return { days, streak };
	}
}
