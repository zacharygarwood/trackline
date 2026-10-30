import { messages } from '../i18n/messages.en.ts';
import type { LocalDate } from '../shared/local-date.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { Mass } from '../shared/mass.ts';
import { err, ok, type Result } from '../shared/result.ts';
import {
	DATE_FORMAT,
	INSTANT_DATE_FORMAT,
	MONTH_DAY_FORMAT,
	MONTH_FORMAT,
	WEEKDAY_LETTER_FORMAT,
	WEIGHT_FORMAT
} from './format.constants.ts';

const weightNumber = new Intl.NumberFormat(undefined, WEIGHT_FORMAT);
const dateFormat = new Intl.DateTimeFormat(undefined, DATE_FORMAT);
const instantDateFormat = new Intl.DateTimeFormat(undefined, INSTANT_DATE_FORMAT);
const weekdayLetterFormat = new Intl.DateTimeFormat(undefined, WEEKDAY_LETTER_FORMAT);
const monthDayFormat = new Intl.DateTimeFormat(undefined, MONTH_DAY_FORMAT);
const monthFormat = new Intl.DateTimeFormat(undefined, MONTH_FORMAT);
const ENTRY_FRACTION_DIGITS = 1;
const ONE_DAY_BACK = -1;

/**
 * The short label for a unit.
 *
 * @param unit - Kilograms or pounds.
 */
export function unitLabel(unit: MassUnit): string {
	return unit === MassUnit.kg ? messages.units.kg : messages.units.lb;
}

/**
 * A weight for display, for example "80.4 kg".
 *
 * @param mass - The weight.
 * @param unit - The unit to show it in.
 */
export function formatMass(mass: Mass, unit: MassUnit): string {
	return `${formatMassNumber(mass, unit)} ${unitLabel(unit)}`;
}

/**
 * A weight's number without its unit, for a large number: "80.4".
 *
 * @param mass - The weight.
 * @param unit - The unit to show it in.
 */
export function formatMassNumber(mass: Mass, unit: MassUnit): string {
	return weightNumber.format(mass.toUnit(unit));
}

/**
 * A weight as number pad text, for example "80.4" or "80".
 *
 * @param mass - The weight.
 * @param unit - The unit to enter it in.
 */
export function massEntry(mass: Mass, unit: MassUnit): string {
	return String(Number(mass.toUnit(unit).toFixed(ENTRY_FRACTION_DIGITS)));
}

/** Raised when typed text is not a weight. */
export class InvalidMassEntry {
	/** @param entry - The rejected text. */
	constructor(readonly entry: string) {}
}

/**
 * Reads a weight typed on the number pad.
 *
 * @param entry - The typed text, for example "80.4".
 * @param unit - The unit the user typed in.
 */
export function parseMassEntry(entry: string, unit: MassUnit): Result<Mass, InvalidMassEntry> {
	const amount = Number(entry);
	if (entry.trim() === '' || !Number.isFinite(amount)) return err(new InvalidMassEntry(entry));
	const mass = Mass.of(amount, unit);
	return mass.ok ? ok(mass.value) : err(new InvalidMassEntry(entry));
}

/**
 * The hour of the day, 0–23, of an instant in the device's time zone.
 *
 * @param epochMilliseconds - The instant.
 */
export function hourOf(epochMilliseconds: number): number {
	return new Date(epochMilliseconds).getHours();
}

/**
 * Reads a decimal number typed by the user, accepting a comma as the decimal separator.
 *
 * @param text - What the user typed.
 * @returns The number, or undefined if the text is not one.
 */
export function parseDecimal(text: string): number | undefined {
	const trimmed = text.trim().replace(',', '.');
	const value = Number(trimmed);
	return trimmed === '' || !Number.isFinite(value) ? undefined : value;
}

/**
 * A date for lists: "Today", "Yesterday", or a short date like "Tue, Oct 27".
 *
 * @param date - The date to show.
 * @param today - Today's date, for the relative labels.
 */
export function formatDate(date: LocalDate, today: LocalDate): string {
	if (date.equals(today)) return messages.dates.today;
	if (date.equals(today.addDays(ONE_DAY_BACK))) return messages.dates.yesterday;
	return formatShortDate(date);
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const CLOCK_DIGITS = 2;
const PAD = '0';
const CLOCK_SEPARATOR = ':';

/**
 * A duration as a clock, for example "4:05" or "1:02:09".
 *
 * @param totalSeconds - The duration; rounded, and never below zero.
 */
export function formatClock(totalSeconds: number): string {
	const seconds = Math.max(0, Math.round(totalSeconds));
	const hours = Math.floor(seconds / SECONDS_PER_HOUR);
	const minutes = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
	const rest = String(seconds % SECONDS_PER_MINUTE).padStart(CLOCK_DIGITS, PAD);
	return hours > 0
		? [String(hours), String(minutes).padStart(CLOCK_DIGITS, PAD), rest].join(CLOCK_SEPARATOR)
		: [String(minutes), rest].join(CLOCK_SEPARATOR);
}

/**
 * A date as a short weekday and day, for example "Thu, Oct 29".
 *
 * @param date - The date.
 */
export function formatShortDate(date: LocalDate): string {
	return dateFormat.format(utcDate(date));
}

/**
 * A date as month and day, for example "Oct 22".
 *
 * @param date - The date.
 */
export function formatMonthDay(date: LocalDate): string {
	return monthDayFormat.format(utcDate(date));
}

/**
 * A date's month, short, for example "Oct".
 *
 * @param date - Any day of the month.
 */
export function formatMonth(date: LocalDate): string {
	return monthFormat.format(utcDate(date));
}

/**
 * The weekday of a date as one letter, for example "W".
 *
 * @param date - The date.
 */
export function formatWeekdayLetter(date: LocalDate): string {
	return weekdayLetterFormat.format(utcDate(date));
}

function utcDate(date: LocalDate): Date {
	return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

/**
 * The calendar date of an instant in the device's time zone, for example "Oct 27, 2026".
 *
 * @param epochMilliseconds - The instant.
 */
export function formatInstantDate(epochMilliseconds: number): string {
	return instantDateFormat.format(epochMilliseconds);
}
