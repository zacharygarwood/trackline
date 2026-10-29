/** SVG path data for each icon, drawn on a 24 × 24 grid with a 2 px round stroke. */
export const ICON_PATHS = {
	today:
		'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4',
	train: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
	eat: 'M4 11h16a8 8 0 0 1-16 0zM9 7c0-1.5 1-2 1-3M14 7c0-1.5 1-2 1-3',
	body: 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8.5 10a4 4 0 0 1 7 0M12 10l1.5-2',
	stats: 'M5 20v-7M12 20V5M19 20v-11',
	settings:
		'M19.21 10.34L21.51 10.66L21.51 13.34L19.21 13.66L18.28 15.92L19.67 17.78L17.78 19.67L15.92 18.28L13.66 19.21L13.34 21.51L10.66 21.51L10.34 19.21L8.08 18.28L6.22 19.67L4.33 17.78L5.72 15.92L4.79 13.66L2.49 13.34L2.49 10.66L4.79 10.34L5.72 8.08L4.33 6.22L6.22 4.33L8.08 5.72L10.34 4.79L10.66 2.49L13.34 2.49L13.66 4.79L15.92 5.72L17.78 4.33L19.67 6.22L18.28 8.08zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
	close: 'M6 6l12 12M18 6L6 18',
	backspace: 'M9 6h11v12H9l-5-6zM12.5 10l4 4M16.5 10l-4 4',
	minus: 'M6 12h12',
	check: 'M5 12.5l4.5 4.5L19 7.5',
	more: 'M6 12h.01M12 12h.01M18 12h.01',
	plus: 'M12 6v12M6 12h12',
	moon: 'M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z',
	back: 'M15 6l-6 6 6 6',
	forward: 'M9 6l6 6-6 6'
} as const;

/** The name of an available icon. */
export type IconName = keyof typeof ICON_PATHS;
