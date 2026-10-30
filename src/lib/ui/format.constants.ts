/** How calendar dates appear in lists, for example "Tue, Oct 27". */
export const DATE_FORMAT = {
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	timeZone: 'UTC'
} as const;

/** How instants appear as a date, for example "Oct 27, 2026". */
export const INSTANT_DATE_FORMAT = { dateStyle: 'medium' } as const;

/** How weights appear: always one decimal, for example "80.0". */
export const WEIGHT_FORMAT = { minimumFractionDigits: 1, maximumFractionDigits: 1 } as const;

/** How a weekday appears under the week strip: one letter, for example "W". */
export const WEEKDAY_LETTER_FORMAT = { weekday: 'narrow', timeZone: 'UTC' } as const;

/** How photo captions show a date, for example "Oct 22". */
export const MONTH_DAY_FORMAT = { month: 'short', day: 'numeric', timeZone: 'UTC' } as const;

/** How the heatmap labels a month, for example "Oct". */
export const MONTH_FORMAT = { month: 'short', timeZone: 'UTC' } as const;
