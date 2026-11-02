import type { ImageProcessor } from '../tracking/application/photo-ports.ts';
import type { FoodDatabase } from '../tracking/domain/food-database.ts';
import type { SqlDriver } from '../platform/db/sql-driver.ts';
import type { PhotoFolder } from '../platform/photos/photo-folder.ts';
import type { DatabaseFile } from '../settings/application/backup-ports.ts';
import type { Clock } from '../shared/clock.ts';

/** The infrastructure the use cases run on. */
export interface Infrastructure {
	readonly database: SqlDriver;
	readonly databaseFile: DatabaseFile;
	/** The folder of photo files next to the database. */
	readonly photoFolder: PhotoFolder;
	readonly images: ImageProcessor;
	/** The built-in food database (ADR 0026). */
	readonly foods: FoodDatabase;
	readonly clock: Clock;
}
