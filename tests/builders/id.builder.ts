import { parseId, type Id } from '../../src/lib/shared/id.ts';
import { expectOk } from '../support/result.ts';

let sequence = 0;

/** A fresh, valid id for tests, of any entity. */
export function anId<Brand extends string>(): Id<Brand> {
	sequence += 1;
	return expectOk(
		parseId<Brand>(`01910000-0000-7000-8000-${sequence.toString(16).padStart(12, '0')}`)
	);
}
