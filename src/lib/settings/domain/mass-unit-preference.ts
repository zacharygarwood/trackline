import type { MassUnit } from '../../shared/mass-unit.constants.ts';

/** Reads the unit the user chose for weights. */
export interface MassUnitReader {
	/** The chosen unit, or undefined if the user hasn't chosen one yet. */
	read(): Promise<MassUnit | undefined>;
}

/** Stores the unit the user chose for weights. */
export interface MassUnitWriter {
	/** Remembers the unit. */
	write(unit: MassUnit): Promise<void>;
}
