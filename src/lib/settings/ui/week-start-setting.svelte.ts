import { WeekStart } from '../../shared/week-start.constants.ts';
import type { GetWeekStart } from '../application/get-week-start.ts';
import type { SetWeekStart } from '../application/set-week-start.ts';

/** The use cases the first-day-of-week setting calls. */
export interface WeekStartSettingUseCases {
	readonly getWeekStart: GetWeekStart;
	readonly setWeekStart: SetWeekStart;
}

/** State and actions of the first-day-of-week setting. */
export class WeekStartSetting {
	weekStart: WeekStart = $state(WeekStart.monday);

	constructor(private readonly useCases: WeekStartSettingUseCases) {}

	/** Loads the stored choice. */
	async load(): Promise<void> {
		this.weekStart = await this.useCases.getWeekStart.execute();
	}

	/** Switches to a first day and remembers it. */
	async choose(weekStart: WeekStart): Promise<void> {
		this.weekStart = weekStart;
		await this.useCases.setWeekStart.execute({ weekStart });
	}
}
