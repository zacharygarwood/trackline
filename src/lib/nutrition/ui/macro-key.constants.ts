/** The four macros, in display order. */
export const MACRO_KEYS = ['calories', 'protein', 'carbs', 'fat'] as const;

/** The macros shown under calories when carbs and fat are tracked. */
export const TRACKED_MACRO_KEYS = ['protein', 'carbs', 'fat'] as const;

/** What the new-food form asks for when carbs and fat are not tracked. */
export const CALORIES_AND_PROTEIN = ['calories', 'protein'] as const;
