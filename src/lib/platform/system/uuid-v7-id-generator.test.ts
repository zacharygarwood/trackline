import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { isId } from '../../shared/id.ts';
import { UuidV7IdGenerator } from './uuid-v7-id-generator.ts';

const zeroBytes = (length: number): Uint8Array => new Uint8Array(length);

describe('UuidV7IdGenerator', () => {
	it('creates valid UUIDv7 ids', () => {
		const generator = new UuidV7IdGenerator(new FixedClock(Date.UTC(2026, 9, 27)));

		expect(isId(generator.next())).toBe(true);
	});

	it('encodes the clock instant in the first 48 bits', () => {
		const generator = new UuidV7IdGenerator(new FixedClock(0x0192f3a17c4e), zeroBytes);

		expect(generator.next()).toBe('0192f3a1-7c4e-7000-8000-000000000000');
	});

	it('sorts ids from later instants after earlier ones', () => {
		const clock = new FixedClock(Date.UTC(2026, 9, 27));
		const generator = new UuidV7IdGenerator(clock);
		const earlier = generator.next();
		clock.advance(1);
		const later = generator.next();

		expect(earlier < later).toBe(true);
	});

	it('creates different ids within the same millisecond', () => {
		const generator = new UuidV7IdGenerator(new FixedClock(Date.UTC(2026, 9, 27)));

		expect(generator.next()).not.toBe(generator.next());
	});
});
