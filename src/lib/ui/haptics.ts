/** How long the confirmation buzz lasts. Short enough to feel like a tap. */
const TAP_VIBRATION_MS = 15;

/** A short vibration to confirm an action, on devices that support it; does nothing elsewhere (iPhone). */
export function confirmWithVibration(): void {
	if ('vibrate' in navigator) navigator.vibrate(TAP_VIBRATION_MS);
}
