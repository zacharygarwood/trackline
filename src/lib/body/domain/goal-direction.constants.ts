/** Which way the user wants their body weight to go. */
export const GoalDirection = {
	lose: 'lose',
	gain: 'gain',
	maintain: 'maintain'
} as const;

/** One of the {@link GoalDirection} values. */
export type GoalDirection = (typeof GoalDirection)[keyof typeof GoalDirection];
