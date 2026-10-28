/** How calendar dates appear in lists, for example "Tue, Oct 27". */
export const DATE_FORMAT = {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
} as const;

/** How a day of the week appears under the week strip, for example "Tue". */
export const WEEKDAY_FORMAT = { weekday: 'short', timeZone: 'UTC' } as const;

/** How instants appear as a date, for example "Oct 27, 2026". */
export const INSTANT_DATE_FORMAT = { dateStyle: 'medium' } as const;

/** How weights appear: always one decimal, for example "80.0". */
export const WEIGHT_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;
