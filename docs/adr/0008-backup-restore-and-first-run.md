# 0008. Backup as a zip of the SQLite file; first run as a redirect

- Status: accepted
- Date: 2026-10-27

## Context

Phase 3 adds export, import, delete-all, the last-export reminder, and the first-run screen. The plan describes the backup's contents (the SQLite database plus photos and a `manifest.json`, zipped with fflate) but leaves open where the logic lives and how the database file is swapped.

## Decision

- **Where it lives:** backup is data management, so it belongs to the `settings` context. The domain holds the manifest, the compatibility check, and the 30-day reminder rule. Ports for the database file and the codec are in `settings/application`. The fflate codec is in `settings/infrastructure`. The only browser glue, the download, is in `platform/backup`.
- **File operations go through the worker:** three file requests (export, replace, wipe) sit beside the SQL requests, using the OPFS pool's `exportFile`, `importDb`, and `wipeFiles`. The worker runs requests strictly in order because replacing the file is asynchronous. Export returns the bytes as one row with a `file` BLOB column, so every response still carries rows. `WorkerSqlDriver` satisfies the `DatabaseFile` port structurally.
- **Restore:** the user picks a file, the app checks the manifest and describes what will be replaced (record counts and the backup's date), and nothing changes until they confirm. Backups from a newer schema or file format are refused. After a restore or delete-all, the page reloads so migrations run against the new file.
- **Saving the export:** the file is handed to the browser's download flow, which on phones offers the system save or share options. The Web Share API isn't used. Each export records the time, and Settings shows the last date with a gentle reminder after 30 days or when there has never been one.
- **Delete all:** the user must type "delete". The sheet states how many records will be lost and suggests exporting first.
- **First run:** until setup is marked complete (`app_setting.setup_complete`), the shell redirects to `/app/welcome`, which hides the tabs. The screen explains, once, that data lives only on this device, then offers the unit and an optional goal weight. Macro goals join it in Phase 5, when nutrition exists.
- **fflate** is the runtime dependency the plan names. It is small, has no dependencies, and makes no network requests.

## Consequences

Phase 7 adds photos to the zip and to the restore preview. Every new table adds to the record counts in `COUNT_RECORDS`, so the delete and restore summaries stay complete.
