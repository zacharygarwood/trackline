import type { GetMassUnit } from '../application/get-mass-unit.ts';
import type { SetMassUnit } from '../application/set-mass-unit.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';

/** The use cases the units setting calls. */
export interface UnitsSettingUseCases {
	readonly getMassUnit: GetMassUnit;
	readonly setMassUnit: SetMassUnit;
}

/** State and actions of the kg/lb setting. */
export class UnitsSetting {
	unit: MassUnit = $state(MassUnit.kg);

	constructor(private readonly useCases: UnitsSettingUseCases) {}

	/** Loads the stored unit. */
	async load(): Promise<void> {
		this.unit = await this.useCases.getMassUnit.execute();
	}

	/** Switches to a unit and remembers it. */
	async choose(unit: MassUnit): Promise<void> {
		this.unit = unit;
		await this.useCases.setMassUnit.execute({ unit });
	}
}
