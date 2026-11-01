import { CanvasImageProcessor } from '../body/infrastructure/canvas-image-processor.ts';
import { downloadFile, type DownloadableFile } from '../platform/backup/download-file.ts';
import { bundledMigrations } from '../platform/db/bundled-migrations.ts';
import { migrate } from '../platform/db/migrate.ts';
import { openDatabase } from '../platform/db/open-database.ts';
import { openPhotoFolder } from '../platform/photos/open-photo-folder.ts';
import { requestPersistentStorage } from '../platform/pwa/persistent-storage.ts';
import { SystemClock } from '../platform/system/system-clock.ts';
import type { Clock } from '../shared/clock.ts';
import type { Infrastructure } from './infrastructure.ts';
import { wireBody } from './wire-body.ts';
import { wireTrackers } from './wire-trackers.ts';
import { wireInsights } from './wire-insights.ts';
import { wireNutrition } from './wire-nutrition.ts';
import { wireSettings } from './wire-settings.ts';
import { wireTraining } from './wire-training.ts';

/** Every use case the UI can call, grouped by bounded context. */
export interface App {
	readonly clock: Clock;
	readonly body: ReturnType<typeof wireBody>;
	readonly settings: ReturnType<typeof wireSettings>;
	readonly training: ReturnType<typeof wireTraining>;
	readonly nutrition: ReturnType<typeof wireNutrition>;
	readonly insights: ReturnType<typeof wireInsights>;
	readonly trackers: ReturnType<typeof wireTrackers>;
	/** Hands a file to the browser's download flow. */
	readonly saveFile: (file: DownloadableFile) => void;
}

/**
 * Wires infrastructure to use cases. This module and the `wire-*.ts` modules
 * beside it are the composition root, the only code that knows which
 * implementation backs each port.
 *
 * @param infrastructure - The database, its file, the photo folder, image processing, and the clock.
 */
export function wireApp(infrastructure: Infrastructure): App {
	return {
		clock: infrastructure.clock,
		body: wireBody(infrastructure),
		settings: wireSettings(infrastructure),
		training: wireTraining(infrastructure),
		nutrition: wireNutrition(infrastructure),
		insights: wireInsights(infrastructure),
		trackers: wireTrackers(infrastructure),
		saveFile: downloadFile
	};
}

/**
 * Opens the on-device database, brings its schema up to date, asks the
 * browser to keep the data, and returns the wired app.
 *
 * @throws If the database can't be opened or migrated.
 */
export async function startApp(): Promise<App> {
	const database = openDatabase();
	await migrate(database, bundledMigrations);
	void requestPersistentStorage(navigator.storage);
	return wireApp({
		database,
		databaseFile: database,
		photoFolder: openPhotoFolder(),
		images: new CanvasImageProcessor(),
		clock: new SystemClock()
	});
}
