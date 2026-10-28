/** Why a stored row could not become a domain model. Never includes the row's values. */
export const CorruptReason = {
	missingColumn: 'missing or mistyped column',
	invalidValue: 'invalid value',
	brokenInvariant: 'value breaks a domain rule'
} as const;
