import { messages } from '../../i18n/messages.en.ts';
import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { massEntry, parseMassEntry } from '../../ui/format.ts';
import type { DeleteWeighIn } from '../application/delete-weigh-in.ts';
import type { GetWeightGoal } from '../application/get-weight-goal.ts';
import type { ListWeighIns } from '../application/list-weigh-ins.ts';
import type { RecordWeighIn } from '../application/record-weigh-in.ts';
import type { WeightGoal } from '../domain/weight-goal.ts';
import type { WeighIn } from '../domain/weigh-in.ts';
import { weightOutOfRangeMessage } from './weight-messages.ts';

/** Reads the unit the user shows weights in; supplied by the settings context. */
export interface MassUnitSource {
	execute(): Promise<MassUnit>;
}

/** The use cases the Body screen calls. */
export interface BodyScreenUseCases {
	readonly listWeighIns: ListWeighIns;
	readonly recordWeighIn: RecordWeighIn;
	readonly deleteWeighIn: DeleteWeighIn;
	readonly getWeightGoal: GetWeightGoal;
	readonly getMassUnit: MassUnitSource;
}

/** State and actions of the Body tab: weigh-ins, the goal, and the unit to show them in. */
export class BodyScreen {
	weighIns: readonly WeighIn[] = $state([]);
	goal: WeightGoal | undefined = $state();
	unit: MassUnit = $state(MassUnit.kg);

	constructor(
		private readonly useCases: BodyScreenUseCases,
		private readonly clock: Clock
	) {}

	/** Today's date, for labels and new weigh-ins. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** Loads weigh-ins, the goal, and the unit. */
	async load(): Promise<void> {
		[this.weighIns, this.goal, this.unit] = await Promise.all([
			this.useCases.listWeighIns.execute(),
			this.useCases.getWeightGoal.execute(),
			this.useCases.getMassUnit.execute()
		]);
	}

	/**
	 * The number pad's starting value for a day: that day's weigh-in, or the
	 * most recent one before it, so a repeat weigh-in is two taps.
	 *
	 * @param date - The day being weighed in.
	 */
	suggestionFor(date: LocalDate): string {
		const previous = this.weighIns.find((weighIn) => !date.isBefore(weighIn.date));
		return previous === undefined ? '' : massEntry(previous.weight, this.unit);
	}

	/**
	 * Records a weigh-in typed on the number pad.
	 *
	 * @param date - The day weighed in.
	 * @param entry - The number pad text, in the user's unit.
	 * @returns A message to show if the entry was rejected.
	 */
	async record(date: LocalDate, entry: string): Promise<string | undefined> {
		const weight = parseMassEntry(entry, this.unit);
		if (!weight.ok) return messages.body.enterWeight;
		const result = await this.useCases.recordWeighIn.execute({ date, weight: weight.value });
		if (!result.ok) return weightOutOfRangeMessage(this.unit);
		await this.load();
		return undefined;
	}

	/** Removes a weigh-in. */
	async remove(weighIn: WeighIn): Promise<void> {
		await this.useCases.deleteWeighIn.execute({ id: weighIn.id });
		await this.load();
	}
}
