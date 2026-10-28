import { createWeighIn, type WeighIn, type WeighInId } from '../../src/lib/body/domain/weigh-in.ts';
import { parseId } from '../../src/lib/shared/id.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { Mass } from '../../src/lib/shared/mass.ts';
import { expectOk } from '../support/result.ts';

let sequence = 0;

/** A fresh, valid UUIDv7 for test entities, unique within a test run. */
export function aWeighInId(): WeighInId {
	sequence += 1;
	const suffix = sequence.toString(16).padStart(12, '0');
	return expectOk(parseId<'WeighIn'>(`01900000-0000-7000-8000-${suffix}`));
}

/** Builds weigh-ins for tests: `aWeighIn().on('2026-10-27').weighing(80).build()`. */
export function aWeighIn() {
	let id = aWeighInId();
	let date = '2026-10-27';
	let kilograms = 80;
	const builder = {
		withId(value: WeighInId) {
			id = value;
			return builder;
		},
		on(value: string) {
			date = value;
			return builder;
		},
		weighing(value: number) {
			kilograms = value;
			return builder;
		},
		build(): WeighIn {
			return expectOk(
				createWeighIn({
					id,
					date: expectOk(LocalDate.parse(date)),
					weight: expectOk(Mass.fromKg(kilograms))
				})
			);
		}
	};
	return builder;
}
