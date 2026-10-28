import type { Id } from '../../shared/id.ts';

/** Identifies a food in the user's library. */
export type FoodId = Id<'Food'>;

/** Identifies a saved meal. */
export type SavedMealId = Id<'SavedMeal'>;

/** Identifies one entry in the food log. */
export type FoodLogEntryId = Id<'FoodLogEntry'>;
