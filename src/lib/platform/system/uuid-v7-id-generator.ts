import type { Clock } from '../../shared/clock.ts';
import { isId, type Id } from '../../shared/id.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';

const HEX = 16;
const BYTE_HEX_DIGITS = 2;
const TIMESTAMP_HEX_DIGITS = 12;
const RANDOM_A_HEX_DIGITS = 3;
const RANDOM_B_HEX_DIGITS = 15;
const RANDOM_BYTES = 10;
const VARIANT_BITS = 0b1000;
const VARIANT_RANDOM_MASK = 0b0011;
const VERSION = '7';
const TIME_HIGH_HEX_DIGITS = 8;
const TIME_LOW_HEX_DIGITS = 4;
const VERSION_GROUP_HEX_DIGITS = 4;
const VARIANT_GROUP_HEX_DIGITS = 4;
const NODE_GROUP_HEX_DIGITS = 12;
const GROUP_LENGTHS = [
	TIME_HIGH_HEX_DIGITS,
	TIME_LOW_HEX_DIGITS,
	VERSION_GROUP_HEX_DIGITS,
	VARIANT_GROUP_HEX_DIGITS,
	NODE_GROUP_HEX_DIGITS
] as const;

/** Produces random bytes; injected so tests can make ids deterministic. */
export type RandomBytes = (length: number) => Uint8Array;

const cryptoRandomBytes: RandomBytes = (length) => crypto.getRandomValues(new Uint8Array(length));

/**
 * Generates UUIDv7 ids (RFC 9562): a 48-bit millisecond timestamp followed by
 * random bits, so ids sort by creation time.
 */
export class UuidV7IdGenerator implements IdGenerator {
	/**
	 * @param clock - Supplies the timestamp part.
	 * @param randomBytes - Supplies the random part.
	 */
	constructor(
		private readonly clock: Clock,
		private readonly randomBytes: RandomBytes = cryptoRandomBytes
	) {}

	/**
	 * A new UUIDv7.
	 *
	 * @throws If the clock reports an instant that does not fit in 48 bits.
	 */
	next<Brand extends string>(): Id<Brand> {
		const time = this.clock.now().toString(HEX).padStart(TIMESTAMP_HEX_DIGITS, '0');
		const random = this.randomHex();
		const randomA = random.slice(1, 1 + RANDOM_A_HEX_DIGITS);
		const randomB = random.slice(1 + RANDOM_A_HEX_DIGITS).slice(0, RANDOM_B_HEX_DIGITS);
		const id = groupHex(time + VERSION + randomA + variantDigit(random) + randomB);
		if (!isId<Brand>(id)) throw new Error('Clock instant does not fit in a UUIDv7');
		return id;
	}

	private randomHex(): string {
		return Array.from(this.randomBytes(RANDOM_BYTES), (byte) =>
			byte.toString(HEX).padStart(BYTE_HEX_DIGITS, '0')
		).join('');
	}
}

/** The RFC 9562 variant digit (`8`–`b`), taking its low bits from the first random digit. */
function variantDigit(random: string): string {
	const randomBits = Number.parseInt(random.slice(0, 1), HEX) & VARIANT_RANDOM_MASK;
	return (VARIANT_BITS | randomBits).toString(HEX);
}

/** Splits 32 hex digits into the 8-4-4-4-12 UUID layout. */
function groupHex(hex: string): string {
	const groups: string[] = [];
	let offset = 0;
	for (const length of GROUP_LENGTHS) {
		groups.push(hex.slice(offset, offset + length));
		offset += length;
	}
	return groups.join('-');
}
