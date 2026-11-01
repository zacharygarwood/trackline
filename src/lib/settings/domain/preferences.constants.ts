/** A named color theme; `system` follows the device's light or dark mode. */
export const Theme = {
	system: 'system',
	dark: 'dark',
	light: 'light',
	forest: 'forest',
	ocean: 'ocean',
	dusk: 'dusk',
	ember: 'ember',
	slate: 'slate',
	mocha: 'mocha',
	sand: 'sand',
	mint: 'mint',
	blossom: 'blossom',
	glacier: 'glacier'
} as const;

/** One of the {@link Theme} values. */
export type Theme = (typeof Theme)[keyof typeof Theme];
