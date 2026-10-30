/** The units a user can choose for distances. */
export const DistanceUnit = {
	mi: 'mi',
	km: 'km'
} as const;

/** A unit for distances: miles or kilometres. */
export type DistanceUnit = (typeof DistanceUnit)[keyof typeof DistanceUnit];
