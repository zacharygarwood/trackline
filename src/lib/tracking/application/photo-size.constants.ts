/** Which stored image of a photo to read: the full photo or its small preview. */
export const PhotoSize = {
	full: 'full',
	thumbnail: 'thumbnail'
} as const;

/** One of the {@link PhotoSize} values. */
export type PhotoSize = (typeof PhotoSize)[keyof typeof PhotoSize];
