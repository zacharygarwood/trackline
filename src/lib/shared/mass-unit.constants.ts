/** The units a user can choose for displaying and entering weights. */
export const MassUnit = {
	kg: 'kg',
	lb: 'lb'
} as const;

/** A unit for weights: kilograms or pounds. */
export type MassUnit = (typeof MassUnit)[keyof typeof MassUnit];
