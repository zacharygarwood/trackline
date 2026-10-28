/** How two photos are compared: next to each other, or overlaid with a slider. */
export const CompareMode = {
	sideBySide: 'side-by-side',
	slider: 'slider'
} as const;

/** One of the {@link CompareMode} values. */
export type CompareMode = (typeof CompareMode)[keyof typeof CompareMode];
