import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../tests/support/result.ts';
import { LocalDate } from '../shared/local-date.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { Mass } from '../shared/mass.ts';
import {
	formatDate,
	formatInstantDate,
	formatMass,
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
