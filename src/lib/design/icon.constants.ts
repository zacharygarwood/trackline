/** SVG path data for each icon, drawn on a 24 × 24 grid with a square-capped stroke. */
export const ICON_PATHS = {
	today: 'M4 6h16v14H4zM4 10.5h16M9 3v4M15 3v4',
	train: 'M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11',
	eat: 'M7 3v18M4.5 3v5.5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2.2 1.2-3.5 3.6-3.5 7 0 2 1.4 3 3.5 3',
	body: 'M4 4h16v16H4zM8 11.5a4 4 0 0 1 8 0M12 11.5l2-3',
	stats: 'M5 20v-7M10 20V5M15 20v-10M20 20V8',
	settings: 'M3 7h10M19 7h2M3 17h4M13 17h8M13 4.5h6v5h-6zM7 14.5h6v5H7z',
	close: 'M6 6l12 12M18 6L6 18',
	backspace: 'M9 6h11v12H9l-5-6zM12.5 10l4 4M16.5 10l-4 4',
	minus: 'M6 12h12',
	check: 'M5 12.5l4.5 4.5L19 7.5',
	more: 'M6 12h.01M12 12h.01M18 12h.01',
	plus: 'M12 4v16M4 12h16',
	moon: 'M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z',
	back: 'M15 5l-7 7 7 7',
	search: 'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4-4',
	chevronDown: 'M6 9l6 6 6-6',
	trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
	camera: 'M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z',
	forward: 'M9 6l6 6-6 6'
} as const;

/** The name of an available icon. */
export type IconName = keyof typeof ICON_PATHS;

/** How heavy an icon's stroke is. */
export const IconWeight = {
	regular: 'regular',
	medium: 'medium',
	bold: 'bold',
	heavy: 'heavy'
} as const;

/** One of the {@link IconWeight} values. */
export type IconWeight = (typeof IconWeight)[keyof typeof IconWeight];

/** The stroke width of each icon weight, in grid units. */
export const ICON_STROKE: Readonly<Record<IconWeight, number>> = {
	regular: 1.8,
	medium: 2,
	bold: 2.5,
	heavy: 3
};
