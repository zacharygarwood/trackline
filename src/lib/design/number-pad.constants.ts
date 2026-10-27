/** Number pad keys that are not digits. */
export const NumberPadAction = {
	decimal: 'decimal',
	backspace: 'backspace'
} as const;

/** The digit keys, in keypad order (1–9, then 0). */
export const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;

/** The character that separates whole and fractional digits. */
export const DECIMAL_SEPARATOR = '.';
