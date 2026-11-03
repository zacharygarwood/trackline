# 0025. Track anything with one model and purpose-built components

- Status: accepted; replaces the training, nutrition, body, trackers, and insights contexts (ADR 0009, 0010, 0011, 0020, 0022–0024)
- Date: 2026-10-31

## Context

Each thing the app tracks (workouts, food, weight, photos, custom trackers) has its own context, tables, and screens, and Trackers reads all of them through SQL ports. Adding a new kind of tracking means a new context. The owner wants a tracker app that can track anything (workouts, plant photos, body photos, runs, and more), from templates with good defaults, while staying simple to understand. The app is still in development with no real user data, so the schema can start clean.

## Decision

- **One Tracking context** holds a small, generic model:
  - **Tracker:** a name, an icon, a kind, a list of fields, and an optional goal.
  - **Field:** a typed slot that an entry fills. The types are number (a plain unit label, a mass, or a distance), duration, rating (1–5), check, choice, note, and photo. Fields can be required.
  - **Entry:** one record on a day, holding values for the tracker's fields. It may name a subject and belong to a session.
  - **Subject:** a thing in the tracker's library that entries are about, such as an exercise, a food, or a plant. It can limit which fields its entries use and give default values.
  - **Session:** a group of entries done together, such as a workout. It is active until finished.
  - **Goal:** every tracker has one, so its bar on Home always has something to fill. It is either a period goal (a total, an average, entries, days, or sessions per day, week, or month, at least or at most a target) or a target goal (the latest value of a field, moving from the first value toward a target, like weight).
- **Entries keep their own values.** Logging a food copies its macros, scaled to the amount, onto the entry, so goals and charts only read entry values, and editing a food later never rewrites the past.
- **Every tracker has a bar.** Templates and basics start with a sensible goal (a basic or a daily check-in like weight or mood is logged once a day, so one entry fills that day's bar; photos are one a week). The goal is built from simple choices: what counts (days, times, workouts, a total or average of a field, or reaching a weight or distance), of which field, every day, week, or month, at least or at most, and the target, so "2 hours a day" and "3 times a day" are each a few taps. These choices appear when creating a tracker from a basic and on the edit page; onboarding asks only for each goal's amount, to stay quick.
- **Kinds pick purpose-built components.** A tracker's kind (log, photos, collection, workout, food) sets whether it has subjects and sessions, and which hand-built page it opens: a quick log, a photo timeline with compare, a library of things with their own history, a workout with a set table and rest timer, or food search with portions and macro totals. Components are made for their job, not generated from the fields.
- **Basics first, then templates.** Add tracker leads with basic building blocks (Photos, Number, Check off, Time, Rating, Notes, Collection), each a plain tracker the user names, such as photos of their dog. Ready-made templates follow: the same building blocks with a name, an icon, and good defaults.
- **Templates are data.** Each template is a ready-made tracker (fields, kind, icon, and a default goal). Onboarding asks "What do you want to track?", lets the user pick templates from a few plain groups, asks units once, and lands on Home with a bar for each pick. Goals can be changed later on the tracker.
- **Navigation:** Home (one row per tracker, opening its page) and Stats, with Settings behind the gear. Fixed Food, Workouts, and Weight tabs go away.
- **Simplicity first:** templates and good defaults come first. Building a tracker from scratch comes after the templates work well, using the same components.
- **Units:** masses are stored in kilograms, distances in metres, and durations in seconds, and shown in the user's units.

## Consequences

Adding something new to track is usually a template, not a context. A new kind of value or page is a new field type or kind, decided by ADR. The old contexts, tables, and screens are gone; the contexts are now tracking, settings, and the shared kernel. Stats is a use case in tracking over entries (`seriesOf`), so the separate insights context and its SQL read models went too.

Storage: tracker fields, goals, entry values, and a library's defaults are JSON columns, checked by the mappers through the domain factories when read. Migration 0010 drops the old tables and creates the new ones; the old migrations stay, because shipped migrations are never edited and their numbers run without gaps. The database file name stays the same.

Food entries copy their numbers when logged (portionValues), and a food tracker's first number field holds the servings. Basics are templates in the basic group with no goal; onboarding offers only the ready-made templates, since basics need a name. Choosing your own fields is not built yet; when it is, it uses the same field types and kinds.

Stats charts what a tracker records, not always what its goal counts (`statOf`): a goal of a field or a target is charted as it is, but a log whose goal only counts days charts its value instead, a weight as its trend, a rating as its weekly average, and other numbers and times as totals. Workouts, photos, and collections keep their counts.

A food can be a recipe: its ingredients (foods from the same library, each with the servings that go in) and the servings it makes, stored as JSON in the subject's `recipe` column (migration 0012). Its numbers per serving are worked out when it is saved (`perServingOf`) and kept as its defaults, so a recipe logs like any other food and entries still copy their values. Editing an ingredient later does not change a saved recipe until the recipe is saved again.

The Food template tracks fiber, sugar, and sodium as well as calories and macros. Since a tracker's fields cannot be added to from the app, migration 0014 gives food trackers made before then the three new fields, after their own.
