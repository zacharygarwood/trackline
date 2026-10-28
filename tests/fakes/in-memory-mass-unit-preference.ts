import type {
	MassUnitReader,
	MassUnitWriter
} from '../../src/lib/settings/domain/mass-unit-preference.ts';
import type { MassUnit } from '../../src/lib/shared/mass-unit.constants.ts';

/** The unit preference kept in a field. */
export class InMemoryMassUnitPreference implements MassUnitReader, MassUnitWriter {
	private unit: MassUnit | undefined;

	read(): Promise<MassUnit | undefined> {
		return Promise.resolve(this.unit);
	}

	write(unit: MassUnit): Promise<void> {
		this.unit = unit;
		return Promise.resolve();
	}
}
