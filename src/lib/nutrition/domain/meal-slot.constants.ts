/** The parts of the day food is logged under. */
export const MealSlot = {
	breakfast: 'breakfast',
	lunch: 'lunch',
	dinner: 'dinner',
	snacks: 'snacks'
} as const;

/** One of the {@link MealSlot} values. */
export type MealSlot = (typeof MealSlot)[keyof typeof MealSlot];
