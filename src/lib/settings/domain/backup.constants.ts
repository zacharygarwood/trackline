/** Why a file can't be read as a backup. */
export const UnreadableReason = {
	notABackup: 'notABackup',
	newerFormat: 'newerFormat'
} as const;

/** One of the {@link UnreadableReason} values. */
export type UnreadableReason = (typeof UnreadableReason)[keyof typeof UnreadableReason];
