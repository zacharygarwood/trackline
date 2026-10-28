# 0010. Insights queries and the Stats screen

- Status: accepted
- Date: 2026-10-28

## Context

Phase 6 builds the Stats tab: weight, calorie, protein, and exercise charts, three 52-week heatmaps, and training streaks, with a time-range filter. Insights reads across training, nutrition, and body, which never import each other. The plan leaves open where the cross-context rules live, what the range filter applies to, and how a versioned goal is drawn.

## Decision

- **CQRS-lite:** insights has no domain layer. `insights/application` declares the read models and query ports; `SqliteInsightsQueries` answers them with SQL over the other contexts' tables. Read models carry only what a chart or heatmap draws, as `LocalDate` and `Mass` values.
- **Rules computed in SQL:** the 7-day moving average (a window over `julianday`), the training streak (gaps and islands, where today never breaks a run), and the estimated one-rep max (Epley, `weight × (1 + reps / 30)`, with a single rep counting as itself) are SQL. The moving average and streak repeat the body and training domain services by design. Their SQL tests cover the same edge cases as the domain tests. Only completed sets with weight from finished workouts count toward exercise progress.
- **Range filter** (4 weeks, 3 months, 1 year, all) applies to the line charts only, as 28, 91, and 365 days ending today. Heatmaps always show 52 weeks; streaks are all-time. The moving average uses weigh-ins before the range start, so the first point of a short range is still a 7-day average.
- **Protein goal met** means the day's protein reached a positive target from the goals in effect that day. Days with no goals or a zero target never count.
- **Goals on charts:** `LineChart` takes goal points and draws a dashed step line from the left edge, so a goal that changed mid-range shows the change. A constant goal is one point, which draws the same horizontal line as before.
- **Heatmap weeks** start on Monday until the first-day-of-week setting exists. The last column is the current week and stops at today.
- **Exercise progress** shows one exercise at a time, chosen from exercises with weighted history, most recently trained first.

## Consequences

Changing the streak or moving-average rule means changing both the domain service and its insights SQL. The first-day-of-week setting, when it is built, must also feed the heatmap.
