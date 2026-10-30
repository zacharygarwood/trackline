/** The units a food's reference amount can be in. */
export const FoodUnit = {
	serving: 'serving',
	piece: 'piece',
	g: 'g',
	oz: 'oz',
	cup: 'cup'
} as const;

/** One of the {@link FoodUnit} values. */
export type FoodUnit = (typeof FoodUnit)[keyof typeof FoodUnit];

/** Every food unit, in the order the new-food form offers them. */
export const FOOD_UNITS = [
	FoodUnit.serving,
	FoodUnit.piece,
	FoodUnit.g,
	FoodUnit.oz,
	FoodUnit.cup
] as const;
