import { messages } from '../i18n/messages.en.ts';
import type { LocalDate } from '../shared/local-date.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { Mass } from '../shared/mass.ts';
import { err, ok, type Result } from '../shared/result.ts';
import { DATE_FORMAT, WEIGHT_FORMAT } from './format.constants.ts';

const weightNumber = new Intl.NumberFormat(undefined, WEIGHT_FORMAT);
const dateFormat = new Intl.DateTimeFormat(undefined, DATE_FORMAT);
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
	return `${weightNumber.format(mass.toUnit(unit))} ${unitLabel(unit)}`;
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
 * A date for lists: "Today", "Yesterday", or a short date like "Tue, Oct 27".
 *
 * @param date - The date to show.
 * @param today - Today's date, for the relative labels.
 */
export function formatDate(date: LocalDate, today: LocalDate): string {
	if (date.equals(today)) return messages.dates.today;
	if (date.equals(today.addDays(ONE_DAY_BACK))) return messages.dates.yesterday;
	return dateFormat.format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
}
