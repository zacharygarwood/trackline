# Trackline

A small, private tracker for anything: workouts, food, sleep, water, weight, photos, plants, and more, from ready-made templates.

Trackline is a Progressive Web App with no backend. Install it to your home screen and it works like an app, fully offline.

## The privacy promise

- **Your data never leaves your device.** Everything you track, photos included, is stored in your browser's private storage for this site, and nowhere else.
- **No accounts, analytics, ads, or trackers.** No cookies, no crash reporting, no third-party scripts, fonts, or images.
- **No network requests** except downloading updates of the app itself from its own origin. You don't have to take this on trust: an end-to-end test fails if any request leaves the app's origin, and a strict Content Security Policy blocks other origins in the browser.
- **Photos lose their metadata.** Every photo is redrawn when you add it, so location and camera details are never stored.
- **Backups are yours.** Export a backup file from Settings; the app never uploads it. Restore it to move to a new phone.

## Using it

Open the app in a browser, then install it:

- **iPhone:** open it in Safari, tap Share, then Add to Home Screen.
- **Android:** open it in Chrome, open the menu, then tap Install app.

Because your data lives only on your device, export a backup from Settings now and then.

## Self-hosting

Trackline builds to static files, so any static host that serves HTTPS works (the service worker and on-device storage need a secure origin; `localhost` counts).

```sh
pnpm install
pnpm build                       # writes the site to build/
BASE_PATH=/trackline pnpm build   # when served from a subfolder, e.g. https://example.com/trackline/
```

Serve the `build/` folder as is. Unknown paths should fall back to `build/404.html`. No headers or server configuration are needed: the security policy is a `<meta>` tag, and the database needs no cross-origin isolation.

This repository deploys to GitHub Pages with `.github/workflows/deploy.yml` on every push to `main` that passes CI.

## Development

Requires Node 24+ and pnpm.

```sh
pnpm install
pnpm dev            # dev server
pnpm check          # lint, architecture rules, unit tests, build (same as CI)
pnpm test:e2e       # Playwright (run `pnpm exec playwright install chromium webkit` first)
pnpm screenshots    # regenerate the landing page screenshots in static/screenshots/
```

See `CLAUDE.md` for the architecture and `docs/adr/` for the decisions behind it.

## License

Trackline is free software under the [GNU General Public License v3](LICENSE) (GPL-3.0-only). You may use, study, change, and share it; if you distribute a modified version, you must share its source under the same license.

## Support

Trackline is free, with no ads and no paid tier. If it helps you, you can [support it on Ko-fi](https://ko-fi.com/algificsoftware).
