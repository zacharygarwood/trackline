/** The parts of the day food is logged under. */
export const MealSlot = {
	breakfast: 'breakfast',
	lunch: 'lunch',
	dinner: 'dinner',
	snacks: 'snacks'
} as const;

/** One of the {@link MealSlot} values. */
export type MealSlot = (typeof MealSlot)[keyof typeof MealSlot];

/** Every meal slot, in the order of the day. */
export const MEAL_SLOTS: readonly MealSlot[] = [
	MealSlot.breakfast,
	MealSlot.lunch,
	MealSlot.dinner,
	MealSlot.snacks
];
