/** How calendar dates appear in lists, for example "Tue, Oct 27". */
export const DATE_FORMAT = {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
} as const;

/** How weights appear: always one decimal, for example "80.0". */
export const WEIGHT_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;
