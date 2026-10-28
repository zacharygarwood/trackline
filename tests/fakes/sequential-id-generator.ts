import { isId, type Id } from '../../src/lib/shared/id.ts';
import type { IdGenerator } from '../../src/lib/shared/id-generator.ts';

/** Generates predictable UUIDv7 ids: ...-000000000001, ...-000000000002, and so on. */
export class SequentialIdGenerator implements IdGenerator {
	private count = 0;

	next<Brand extends string>(): Id<Brand> {
		this.count += 1;
		const id = `01900000-0000-7000-9000-${this.count.toString(16).padStart(12, '0')}`;
		if (!isId<Brand>(id)) throw new Error(`Generated an invalid id: ${id}`);
		return id;
	}
}
