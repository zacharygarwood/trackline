import { elementAt } from '../shared/collections.ts';

/** The allowed values of a stepper: from `min` to `max` in increments of `step`. */
export interface StepRange {
	readonly min: number;
	readonly max: number;
	readonly step: number;
}

/**
 * The value one step higher, capped at the maximum.
 *
 * @param value - The current value.
 * @param range - The allowed range and step size.
 */
export function stepUp(value: number, range: StepRange): number {
	return clamp(roundToStep(value + range.step, range.step), range);
}

/**
 * The value one step lower, floored at the minimum.
 *
 * @param value - The current value.
 * @param range - The allowed range and step size.
 */
export function stepDown(value: number, range: StepRange): number {
	return clamp(roundToStep(value - range.step, range.step), range);
}

function roundToStep(value: number, step: number): number {
	const fractionDigits = elementAt(String(step).split('.'), 1)?.length ?? 0;
	return Number(value.toFixed(fractionDigits));
}

function clamp(value: number, range: StepRange): number {
	return Math.min(range.max, Math.max(range.min, value));
}

/**
 * Reads a value typed into a stepper, accepting a comma as the decimal separator.
 *
 * @param text - What the user typed.
 * @param range - The allowed range.
 * @returns The value, kept within the range, or undefined if the text is not a number.
 */
export function parseStepperInput(text: string, range: StepRange): number | undefined {
	const trimmed = text.trim().replace(',', '.');
	const value = Number(trimmed);
	return trimmed === '' || !Number.isFinite(value) ? undefined : clamp(value, range);
}
