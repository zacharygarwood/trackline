/** Numbers in lists and on Home: up to one decimal, grouped. */
export const NUMBER_FORMAT = {
	maximumFractionDigits: 1
} as const satisfies Intl.NumberFormatOptions;

/** Distances: up to two decimals, so 5.25 km reads exactly. */
export const DISTANCE_FORMAT = {
	maximumFractionDigits: 2
} as const satisfies Intl.NumberFormatOptions;
