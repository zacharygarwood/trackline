/** A `food` table row. */
export type FoodRow = {
	readonly id: string;
	readonly name: string;
	readonly reference_amount: number;
	readonly reference_unit: string;
	readonly calories: number;
	readonly protein_g: number;
	readonly carbs_g: number;
	readonly fat_g: number;
};

/** A `saved_meal` table row. */
export type SavedMealRow = {
	readonly id: string;
	readonly name: string;
};

/** A `saved_meal_item` table row. */
export type SavedMealItemRow = {
	readonly meal_id: string;
	readonly position: number;
	readonly food_id: string;
	readonly amount: number;
};

/** A `food_log_entry` table row. */
export type FoodLogEntryRow = {
	readonly id: string;
	readonly date: string;
	readonly slot: string;
	readonly food_id: string;
	readonly food_name: string;
	readonly unit: string;
	readonly amount: number;
	readonly calories: number;
	readonly protein_g: number;
	readonly carbs_g: number;
	readonly fat_g: number;
	readonly logged_at: number;
};

/** A `daily_goals` table row. */
export type DailyGoalsRow = {
	readonly effective_from: string;
	readonly calories: number;
	readonly protein_g: number;
	readonly carbs_g: number;
	readonly fat_g: number;
};
