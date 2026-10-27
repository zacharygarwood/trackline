/** Visual emphasis of a button. Each screen has at most one `primary` button. */
export const ButtonVariant = {
	primary: 'primary',
	secondary: 'secondary',
	quiet: 'quiet'
} as const;

/** One of the {@link ButtonVariant} values. */
export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];
