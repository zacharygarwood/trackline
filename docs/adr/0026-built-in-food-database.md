# 0026. A built-in food database, served from the app itself

- Status: accepted
- Date: 2026-11-02

## Context

Logging food means typing each food's calories and macros once, which makes food tracking slow to start. The owner wants a food database to make it easier, with all data staying on the device. The app makes no network requests outside its own origin (privacy rules), so online food APIs such as Open Food Facts or the USDA API are out. Branded products and barcodes need datasets of hundreds of megabytes, too large to ship.

## Decision

- **Ship the USDA FoodData Central "SR Legacy" foods** (about 7,800 generic foods, public domain, CC0) as a static file, `static/foods/usda-sr-legacy.json`: each food's name, its calories, protein, carbs, fat, fiber, sugar, and sodium per 100 g, and up to four household portions with their weight in grams (such as "1 cup, 81 g").
- **The file is generated, not hand-edited.** `scripts/build-food-database.ts` builds it from the USDA CSV download; the generated file is committed so builds need no network.
- **It loads only when searched.** The app fetches it from its own origin the first time someone searches for a food, outside the JavaScript bundle and its 250 KiB budget. The service worker precaches it with the other static files, so search works offline. It is about 1 MB, 230 KB gzipped.
- **A database food becomes one of My foods when first logged.** Choosing one opens the usual portion page with a choice of serving (100 g or one of its portions). Logging it copies it into the library as a food named with its serving, with its numbers per serving taken from the nutrients that match the tracker's fields by key. From then on it works like any other food, and entries keep their own values as before (ADR 0025).
- **Library names may be longer.** USDA names run to about 130 characters, so a thing in a library may have a name of up to 240 (trackers stay at 40). Migration 0013 rebuilds the subject table for its new CHECK, rebuilding entry first so no entry is lost to the cascade.
- **No new runtime dependency and no new tables.** The database is read-only data behind a `FoodDatabase` port in the tracking domain, implemented in tracking infrastructure (`StaticFoodDatabase`), which reads the file through `fetchAppFile` in `platform/pwa`, the only place allowed to use the network.

## Consequences

Food search covers common foods without any typing of numbers. Branded products and barcode scanning are not covered. The app download per version grows by the file's size, since the service worker precaches it. Updating the data means re-running the script on a newer USDA download.
