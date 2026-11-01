import {
	BACKGROUND_TOKEN,
	DEVICE_LIGHT_MODE,
	MEDIA_CHANGE_EVENT,
	THEME_COLOR_SELECTOR
} from './theme-color.constants.ts';

/** Sets every theme-color tag to the page's current background color. */
function matchThemeColor(): void {
	const background = getComputedStyle(document.documentElement).getPropertyValue(BACKGROUND_TOKEN);
	for (const tag of document.querySelectorAll<HTMLMetaElement>(THEME_COLOR_SELECTOR)) {
		tag.content = background;
	}
}

/**
 * Colors the phone's status and navigation bars with the current theme's background, now and
 * whenever the device switches between light and dark mode (which changes the System theme).
 * Call it again after changing the theme.
 *
 * @returns A function that stops following the device's mode.
 */
export function followThemeColor(): () => void {
	matchThemeColor();
	const deviceMode = matchMedia(DEVICE_LIGHT_MODE);
	deviceMode.addEventListener(MEDIA_CHANGE_EVENT, matchThemeColor);
	return () => {
		deviceMode.removeEventListener(MEDIA_CHANGE_EVENT, matchThemeColor);
	};
}
