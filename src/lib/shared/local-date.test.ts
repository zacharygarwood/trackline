import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../tests/support/result.ts';
import { InvalidLocalDate, LocalDate } from './local-date.ts';

const date = (text: string): LocalDate => expectOk(LocalDate.parse(text));

describe('LocalDate.parse', () => {
	it('accepts a calendar date in YYYY-MM-DD form', () => {
		expect(date('2026-10-27').toString()).toBe('2026-10-27');
	});

	it('accepts February 29 in a leap year', () => {
		expect(date('2028-02-29').toString()).toBe('2028-02-29');
	});

	it.each(['2026-02-29', '2026-13-01', '2026-00-10', '2026-04-31', '2026-1-5', '27/10/2026', ''])(
		'rejects %j',
		(text) => {
			expect(expectErr(LocalDate.parse(text))).toBeInstanceOf(InvalidLocalDate);
		}
	);
});

describe('LocalDate.of', () => {
	it('builds a date from its parts', () => {
		expect(expectOk(LocalDate.of({ year: 2026, month: 1, day: 5 })).toString()).toBe('2026-01-05');
	});

	it('rejects a day that does not exist', () => {
		expect(expectErr(LocalDate.of({ year: 2026, month: 6, day: 31 }))).toBeInstanceOf(
			InvalidLocalDate
		);
	});

	it('rejects years outside the supported range', () => {
		expect(expectErr(LocalDate.of({ year: 99, month: 1, day: 1 }))).toBeInstanceOf(
			InvalidLocalDate
		);
	});
});

describe('LocalDate arithmetic', () => {
	it('adds days across month and year boundaries', () => {
		expect(date('2026-12-31').addDays(1).toString()).toBe('2027-01-01');
		expect(date('2026-03-01').addDays(-1).toString()).toBe('2026-02-28');
	});

	it('orders dates chronologically', () => {
		const earlier = date('2026-10-26');
		const later = date('2026-10-27');

		expect(earlier.isBefore(later)).toBe(true);
		expect(later.isBefore(earlier)).toBe(false);
		expect(earlier.compareTo(later)).toBeLessThan(0);
		expect(later.compareTo(earlier)).toBeGreaterThan(0);
	});

	it('treats the same calendar day as equal', () => {
		expect(date('2026-10-27').equals(date('2026-10-27'))).toBe(true);
		expect(date('2026-10-27').compareTo(date('2026-10-27'))).toBe(0);
	});
});
