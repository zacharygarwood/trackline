import type { WeekStart } from '../../shared/week-start.constants.ts';
import type { HomeRow, ListHome } from '../application/progress.ts';

/** State of Home: every tracker with its progress, in order. */
export class HomeScreen {
	rows: readonly HomeRow[] | undefined = $state();

	constructor(private readonly listHome: ListHome) {}

	/**
	 * Reads every tracker's progress.
	 *
	 * @param weekStart - The day weeks begin on.
	 */
	async load(weekStart: WeekStart): Promise<void> {
		this.rows = await this.listHome.execute({ weekStart });
	}

	/** The first workout under way, for the resume bar. */
	get active(): HomeRow | undefined {
		return this.rows?.find((row) => row.active !== undefined);
	}
}
