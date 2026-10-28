import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { MassUnitWriter } from '../domain/mass-unit-preference.ts';

/** The unit the user picked. */
export interface SetMassUnitCommand {
	readonly unit: MassUnit;
}

/** Changes the unit for showing and entering weights. Stored weights are unaffected. */
export class SetMassUnit {
	constructor(private readonly preference: MassUnitWriter) {}

	/** @param command - The unit to use from now on. */
	async execute(command: SetMassUnitCommand): Promise<void> {
		await this.preference.write(command.unit);
	}
}
