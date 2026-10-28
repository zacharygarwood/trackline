/** How the body is turned in a progress photo; only photos of the same pose are compared. */
export const Pose = {
	front: 'front',
	side: 'side',
	back: 'back'
} as const;

/** One of the {@link Pose} values. */
export type Pose = (typeof Pose)[keyof typeof Pose];
