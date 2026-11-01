# 0011. Progress photo storage, re-encoding, and backup

- Status: accepted
- Date: 2026-10-28

## Context

Phase 7 adds progress photos: files stored on the device next to the database, included in backups, and compared side by side or with a slider. The plan leaves open how files are written, what format Safari gets, how files are named, and how backups carry them.

## Decision

- **Model:** `ProgressPhoto` (Body context) holds id, date, pose, and pixel size. The plan's `fileKey` is dropped: files are named by the photo id, so a separate key would always equal it.
- **Re-encoding:** every image is decoded with `createImageBitmap` (which applies EXIF orientation) and redrawn on an `OffscreenCanvas` as a 480 px thumbnail, scaled with `imageSmoothingQuality` set to high. The thumbnail is WebP where the browser can encode it. Safari can't, so it gets JPEG at the same quality. _Amended 2026-11-01:_ the full image is the file the user chose, kept byte for byte. Earlier versions redrew it at most 2048 px wide to drop its metadata, which made photos visibly worse. The original keeps its EXIF data, location included, but it never leaves the device except in backups the user saves. The app no longer claims to remove metadata. Photos are stored in the browser's own storage, never in the device's photo library, so they don't show up in the gallery.
- **Storage:** files live in the OPFS folder `photos/` as `<id>` and `<id>.thumb`, without extensions, because the format depends on the browser and `<img>` detects it. Writes go through a small dedicated worker using synchronous access handles, the one OPFS write API every browser that runs the database supports (`createWritable` is missing on older iOS). Reads, deletes, and listing use the asynchronous OPFS API on the main thread.
- **Layers:** `platform/photos` holds the generic folder, worker, and canvas code. Body's `FolderPhotoStore` and Settings' `FolderPhotoArchive` adapt it to their own ports, so neither context sees OPFS. The browser-only modules are excluded from Node coverage and covered by journeys 4 and 6 instead.
- **Order of writes:** adding stores the files before the row. Deleting removes the row before the files, so an interrupted delete leaves at worst an unused file.
- **Backup:** the zip gains `photos/<name>` entries. Restore replaces the photo files, then the database, and delete-all wipes both. Decoding refuses any photo name that isn't a plain file name, so a crafted backup can't write outside the folder. A backup without photo entries still restores. The format version stays 1 because no backup with a different layout has ever been released.
- **Gallery:** `/app/body/photos`, reached from the Body tab, which stays marked as current. Compare offers only photos of the same pose. The slider is drawn in SVG with a clip path, because the content security policy blocks the inline styles a CSS slider would need.

## Consequences

Older iPhones get larger JPEG thumbnails than WebP would give. Full images take as much space as the camera's files, so storage and backups grow faster than they did with the 2048 px copies. Photos stored before the amendment keep their re-encoded files.
