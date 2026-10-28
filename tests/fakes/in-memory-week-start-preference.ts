import type {
	WeekStartReader,
	WeekStartWriter
} from '../../src/lib/settings/domain/week-start-preference.ts';
import type { WeekStart } from '../../src/lib/shared/week-start.constants.ts';

/** The week start preference kept in a field. */
export class InMemoryWeekStartPreference implements WeekStartReader, WeekStartWriter {
	private weekStart: WeekStart | undefined;

	read(): Promise<WeekStart | undefined> {
		return Promise.resolve(this.weekStart);
	}

	write(weekStart: WeekStart): Promise<void> {
		this.weekStart = weekStart;
		return Promise.resolve();
	}
}
