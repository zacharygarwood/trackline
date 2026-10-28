/** The nutrients the Stats screen charts against their goals. */
export const Nutrient = {
	calories: 'calories',
	protein: 'protein'
} as const;

/** One of the charted nutrients. */
export type Nutrient = (typeof Nutrient)[keyof typeof Nutrient];
