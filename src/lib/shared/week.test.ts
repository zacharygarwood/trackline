import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../tests/support/result.ts';
import { LocalDate } from './local-date.ts';
import { startOfWeek } from './week.ts';
import { WeekStart } from './week-start.constants.ts';

const wednesday = expectOk(LocalDate.parse('2026-10-28'));
const sunday = expectOk(LocalDate.parse('2026-11-01'));

describe('startOfWeek', () => {
	it('goes back to the Monday of the week', () => {
		expect(startOfWeek(wednesday, WeekStart.monday).toString()).toBe('2026-10-26');
		expect(startOfWeek(sunday, WeekStart.monday).toString()).toBe('2026-10-26');
	});

	it('goes back to the Sunday of the week when weeks start on Sunday', () => {
		expect(startOfWeek(wednesday, WeekStart.sunday).toString()).toBe('2026-10-25');
		expect(startOfWeek(sunday, WeekStart.sunday).toString()).toBe('2026-11-01');
	});
});
