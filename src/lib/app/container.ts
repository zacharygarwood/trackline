import { ClearWeightGoal } from '../body/application/clear-weight-goal.ts';
import { DeleteWeighIn } from '../body/application/delete-weigh-in.ts';
import { GetWeightGoal } from '../body/application/get-weight-goal.ts';
import { ListWeighIns } from '../body/application/list-weigh-ins.ts';
import { RecordWeighIn } from '../body/application/record-weigh-in.ts';
import { SetWeightGoal } from '../body/application/set-weight-goal.ts';
import { SqliteWeighInRepository } from '../body/infrastructure/sqlite-weigh-in-repository.ts';
import { SqliteWeightGoalRepository } from '../body/infrastructure/sqlite-weight-goal-repository.ts';
import { bundledMigrations } from '../platform/db/bundled-migrations.ts';
import { migrate } from '../platform/db/migrate.ts';
import { openDatabase } from '../platform/db/open-database.ts';
import type { SqlDriver } from '../platform/db/sql-driver.ts';
import { requestPersistentStorage } from '../platform/pwa/persistent-storage.ts';
import { SystemClock } from '../platform/system/system-clock.ts';
import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import { GetMassUnit } from '../settings/application/get-mass-unit.ts';
import { SetMassUnit } from '../settings/application/set-mass-unit.ts';
import { SqliteMassUnitPreference } from '../settings/infrastructure/sqlite-mass-unit-preference.ts';
import type { Clock } from '../shared/clock.ts';

/** Every use case the UI can call, grouped by bounded context. */
export interface App {
	readonly clock: Clock;
	readonly body: {
		readonly recordWeighIn: RecordWeighIn;
		readonly deleteWeighIn: DeleteWeighIn;
		readonly listWeighIns: ListWeighIns;
		readonly getWeightGoal: GetWeightGoal;
		readonly setWeightGoal: SetWeightGoal;
		readonly clearWeightGoal: ClearWeightGoal;
	};
	readonly settings: {
		readonly getMassUnit: GetMassUnit;
		readonly setMassUnit: SetMassUnit;
	};
}

/**
 * Wires infrastructure to use cases. This is the composition root, the only
 * module that knows which implementation backs each port.
 *
 * @param database - The database every repository uses.
 * @param clock - The source of the current time.
 */
export function wireApp(database: SqlDriver, clock: Clock): App {
	const ids = new UuidV7IdGenerator(clock);
	const weighIns = new SqliteWeighInRepository(database);
	const weightGoal = new SqliteWeightGoalRepository(database);
	const massUnit = new SqliteMassUnitPreference(database);
	return {
		clock,
		body: {
			recordWeighIn: new RecordWeighIn(weighIns, ids),
			deleteWeighIn: new DeleteWeighIn(weighIns),
			listWeighIns: new ListWeighIns(weighIns),
			getWeightGoal: new GetWeightGoal(weightGoal),
			setWeightGoal: new SetWeightGoal(weightGoal),
			clearWeightGoal: new ClearWeightGoal(weightGoal)
		},
		settings: {
			getMassUnit: new GetMassUnit(massUnit),
			setMassUnit: new SetMassUnit(massUnit)
		}
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
	return wireApp(database, new SystemClock());
}
