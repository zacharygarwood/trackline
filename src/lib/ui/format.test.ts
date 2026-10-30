import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../tests/support/result.ts';
import { LocalDate } from '../shared/local-date.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { Mass } from '../shared/mass.ts';
import {
	formatDate,
	formatInstantDate,
	formatMass,
	formatMassNumber,
	formatMonth,
	formatMonthDay,
	formatClock,
	formatShortDate,
	formatWeekdayLetter,
	InvalidMassEntry,
	massEntry,
	parseMassEntry,
	parseDecimal
} from './format.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const kg = (amount: number) => expectOk(Mass.fromKg(amount));

describe('formatMass', () => {
	it('shows one decimal and the unit', () => {
		expect(formatMass(kg(80), MassUnit.kg)).toBe('80.0 kg');
		expect(formatMass(kg(45.359237), MassUnit.lb)).toBe('100.0 lb');
	});
});

describe('formatMassNumber', () => {
	it('shows one decimal without the unit', () => {
		expect(formatMassNumber(kg(45.359237), MassUnit.lb)).toBe('100.0');
	});
});

describe('formatClock', () => {
	it.each([
		[0, '0:00'],
		[65.4, '1:05'],
		[3729, '1:02:09'],
		[-3, '0:00']
	])('shows %d seconds as %s', (seconds, clock) => {
		expect(formatClock(seconds)).toBe(clock);
	});
});

describe('formatMonthDay and formatMonth', () => {
	it('shows the month and day, or the month alone', () => {
		expect(formatMonthDay(date('2026-10-22'))).toBe('Oct 22');
		expect(formatMonth(date('2026-10-22'))).toBe('Oct');
	});
});

describe('formatShortDate', () => {
	it('shows the weekday, month, and day', () => {
		expect(formatShortDate(date('2026-10-29'))).toBe('Thu, Oct 29');
	});
});

describe('formatWeekdayLetter', () => {
	it('shows the weekday as one letter', () => {
		expect(formatWeekdayLetter(date('2026-10-28'))).toBe('W');
	});
});

describe('massEntry', () => {
	it('drops a trailing zero decimal', () => {
		expect(massEntry(kg(80), MassUnit.kg)).toBe('80');
		expect(massEntry(kg(80.44), MassUnit.kg)).toBe('80.4');
	});
});

describe('parseMassEntry', () => {
	it('reads an entry in the chosen unit', () => {
		expect(expectOk(parseMassEntry('100', MassUnit.lb)).kilograms).toBeCloseTo(45.359237);
	});

	it.each(['', '.', 'abc'])('rejects %j', (entry) => {
		expect(expectErr(parseMassEntry(entry, MassUnit.kg))).toBeInstanceOf(InvalidMassEntry);
	});
});

describe('formatDate', () => {
	const today = date('2026-10-27');

	it('names today and yesterday', () => {
		expect(formatDate(today, today)).toBe('Today');
		expect(formatDate(date('2026-10-26'), today)).toBe('Yesterday');
	});

	it('shows older dates as a short date', () => {
		expect(formatDate(date('2026-10-20'), today)).toBe('Tue, Oct 20');
	});
});

describe('formatInstantDate', () => {
	it('shows an instant as a medium date', () => {
		expect(formatInstantDate(Date.UTC(2026, 9, 27, 12))).toBe('Oct 27, 2026');
	});
});

describe('parseDecimal', () => {
	it('reads numbers with a point or a comma', () => {
		expect(parseDecimal('12.5')).toBe(12.5);
		expect(parseDecimal(' 12,5 ')).toBe(12.5);
	});

	it.each(['', 'abc', '1..2'])('rejects %j', (text) => {
		expect(parseDecimal(text)).toBeUndefined();
	});
});
