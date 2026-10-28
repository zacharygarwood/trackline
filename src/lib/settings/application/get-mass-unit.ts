import { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { MassUnitReader } from '../domain/mass-unit-preference.ts';

/** Reads the unit for showing and entering weights. */
export class GetMassUnit {
	constructor(private readonly preference: MassUnitReader) {}

	/** @returns The chosen unit, or kilograms until the user picks one. */
	async execute(): Promise<MassUnit> {
		return (await this.preference.read()) ?? MassUnit.kg;
	}
}
