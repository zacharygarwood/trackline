/** Dark or light colors. */
export const Theme = {
	dark: 'dark',
	light: 'light'
} as const;

/** One of the {@link Theme} values. */
export type Theme = (typeof Theme)[keyof typeof Theme];

/** The color used for actions, progress, and the current tab. */
export const Accent = {
	sky: 'sky',
	jade: 'jade',
	clay: 'clay',
	violet: 'violet',
	rose: 'rose'
} as const;

/** One of the {@link Accent} values. */
export type Accent = (typeof Accent)[keyof typeof Accent];
