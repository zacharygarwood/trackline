/** Finds the `<meta name="theme-color">` tags that color the phone's status and navigation bars. */
export const THEME_COLOR_SELECTOR = 'meta[name="theme-color"]';

/** The design token that holds the current theme's background color. */
export const BACKGROUND_TOKEN = '--color-background';

/** Matches when the device is in light mode, which changes the System theme's background. */
export const DEVICE_LIGHT_MODE = '(prefers-color-scheme: light)';

/** The event a media query list fires when the device switches between light and dark mode. */
export const MEDIA_CHANGE_EVENT = 'change';
