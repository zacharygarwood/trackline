/** Which way a tracker moves on Home. */
export const MoveDirection = {
	up: 'up',
	down: 'down'
} as const;

/** One of the {@link MoveDirection} values. */
export type MoveDirection = (typeof MoveDirection)[keyof typeof MoveDirection];
