/** Visual emphasis of a button: filled with the accent, outlined, or accent text only. */
export const ButtonVariant = {
	primary: 'primary',
	secondary: 'secondary',
	quiet: 'quiet'
} as const;

/** One of the {@link ButtonVariant} values. */
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];

/** How tall a button is: 48, 52, 56, or 64 pixels. */
export const ButtonSize = {
	compact: 'compact',
	medium: 'medium',
	regular: 'regular',
	tall: 'tall'
} as const;

/** One of the {@link ButtonSize} values. */
export type ButtonSize = (typeof ButtonSize)[keyof typeof ButtonSize];

/** How a choice button is drawn: 44 px tall with 15 px text, or 48 px with 16 px text. */
export const ChoiceSize = {
	regular: 'regular',
	large: 'large'
} as const;

/** One of the {@link ChoiceSize} values. */
export type ChoiceSize = (typeof ChoiceSize)[keyof typeof ChoiceSize];

/** Which edges of a search field have a divider. */
export const FieldEdges = {
	top: 'top',
	bottom: 'bottom',
	both: 'both'
} as const;

/** One of the {@link FieldEdges} values. */
export type FieldEdges = (typeof FieldEdges)[keyof typeof FieldEdges];
