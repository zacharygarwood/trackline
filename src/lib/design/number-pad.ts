import { DECIMAL_SEPARATOR, NumberPadAction } from './number-pad.constants.ts';

/** What a number pad accepts. */
export interface NumberPadLimits {
	readonly allowDecimal: boolean;
	readonly maxIntegerDigits: number;
	readonly maxFractionDigits: number;
}

/**
 * The text a number pad shows after a key press.
 *
 * @param value - The text before the press.
 * @param key - A digit (`'0'`–`'9'`) or a {@link NumberPadAction}.
 * @param limits - Which entries are allowed.
 * @returns The new text; unchanged when the press would break a limit.
 */
export function pressKey(value: string, key: string, limits: NumberPadLimits): string {
	switch (key) {
		case NumberPadAction.backspace:
			return value.slice(0, value.length - 1);
		case NumberPadAction.decimal:
			return addSeparator(value, limits);
		default:
			return addDigit(value, key, limits);
	}
}

function addSeparator(value: string, limits: NumberPadLimits): string {
	if (!limits.allowDecimal || value.includes(DECIMAL_SEPARATOR)) return value;
	return (value === '' ? '0' : value) + DECIMAL_SEPARATOR;
}

function addDigit(value: string, digit: string, limits: NumberPadLimits): string {
	const [integer = '', fraction] = value.split(DECIMAL_SEPARATOR);
	if (fraction !== undefined) {
		return fraction.length < limits.maxFractionDigits ? value + digit : value;
	}
	if (integer === '0') return digit;
	return integer.length < limits.maxIntegerDigits ? value + digit : value;
}
