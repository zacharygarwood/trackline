# 0012. License: GPL-3.0

- Status: accepted
- Date: 2026-10-28

## Context

The plan asks for an open source license chosen by ADR: GPL-3.0, which keeps forks open, or MIT, which maximizes reuse. The app's main promise is privacy that anyone can verify by reading the source.

## Decision

Trackline is licensed under the GNU General Public License v3, only (`GPL-3.0-only`). The full text is in `LICENSE`, and `package.json` declares it. Settings' About section, the landing page, and the README say so and link to the source at https://github.com/zacharygarwood/trackline.

Copyleft fits the privacy promise: anyone who distributes a modified version has to publish its source, so a fork can't quietly add tracking while keeping the name of an inspectable app. "Only" rather than "or later" keeps the terms fixed to the version chosen here.

## Consequences

Code from this project can't be folded into closed-source products. Contributions are accepted under the same license. Moving to "or later" or to another license later would need the agreement of every copyright holder.
