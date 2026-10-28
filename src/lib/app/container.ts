import { ClearWeightGoal } from '../body/application/clear-weight-goal.ts';
import { DeleteWeighIn } from '../body/application/delete-weigh-in.ts';
import { GetWeightGoal } from '../body/application/get-weight-goal.ts';
import { ListWeighIns } from '../body/application/list-weigh-ins.ts';
import { RecordWeighIn } from '../body/application/record-weigh-in.ts';
import { SetWeightGoal } from '../body/application/set-weight-goal.ts';
import { SqliteWeighInRepository } from '../body/infrastructure/sqlite-weigh-in-repository.ts';
import { SqliteWeightGoalRepository } from '../body/infrastructure/sqlite-weight-goal-repository.ts';
import { ChangeLogAmount } from '../nutrition/application/change-log-amount.ts';
import { CreateFood } from '../nutrition/application/create-food.ts';
import { DeleteLogEntry } from '../nutrition/application/delete-log-entry.ts';
import { DeleteSavedMeal } from '../nutrition/application/delete-saved-meal.ts';
import { GetDailyGoals } from '../nutrition/application/get-daily-goals.ts';
import { GetDayNutrition } from '../nutrition/application/get-day-nutrition.ts';
import { GetLastAmount } from '../nutrition/application/get-last-amount.ts';
import { ListFoods } from '../nutrition/application/list-foods.ts';
import { ListSavedMeals } from '../nutrition/application/list-saved-meals.ts';
import { LogFood } from '../nutrition/application/log-food.ts';
import { LogSavedMeal } from '../nutrition/application/log-saved-meal.ts';
import { SaveMealFromSlot } from '../nutrition/application/save-meal-from-slot.ts';
import { SetDailyGoals } from '../nutrition/application/set-daily-goals.ts';
import {
	SqliteDailyGoalsRepository,
	SqliteFoodLogRepository,
	SqliteFoodRepository,
	SqliteSavedMealRepository
} from '../nutrition/infrastructure/sqlite-nutrition-repositories.ts';
import { downloadFile, type DownloadableFile } from '../platform/backup/download-file.ts';
import { bundledMigrations } from '../platform/db/bundled-migrations.ts';
import { migrate } from '../platform/db/migrate.ts';
import { openDatabase } from '../platform/db/open-database.ts';
import type { SqlDriver } from '../platform/db/sql-driver.ts';
import { requestPersistentStorage } from '../platform/pwa/persistent-storage.ts';
import { SystemClock } from '../platform/system/system-clock.ts';
import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import type { DatabaseFile } from '../settings/application/backup-ports.ts';
import { CompleteSetup } from '../settings/application/complete-setup.ts';
import { CountRecords } from '../settings/application/count-records.ts';
import { DeleteAllData } from '../settings/application/delete-all-data.ts';
import { ExportBackup } from '../settings/application/export-backup.ts';
import { GetBackupStatus } from '../settings/application/get-backup-status.ts';
import { GetMassUnit } from '../settings/application/get-mass-unit.ts';
import { GetSetupStatus } from '../settings/application/get-setup-status.ts';
import { PreviewRestore } from '../settings/application/preview-restore.ts';
import { RestoreBackup } from '../settings/application/restore-backup.ts';
import { SetMassUnit } from '../settings/application/set-mass-unit.ts';
import { SqliteAppState } from '../settings/infrastructure/sqlite-app-state.ts';
import { SqliteDataInventory } from '../settings/infrastructure/sqlite-data-inventory.ts';
import { SqliteMassUnitPreference } from '../settings/infrastructure/sqlite-mass-unit-preference.ts';
import { ZipBackupCodec } from '../settings/infrastructure/zip-backup-codec.ts';
import { AddExerciseToWorkout } from '../training/application/add-exercise-to-workout.ts';
import { AddSet } from '../training/application/add-set.ts';
import { DeleteTemplate } from '../training/application/delete-template.ts';
import { DiscardWorkout } from '../training/application/discard-workout.ts';
import { FinishWorkout } from '../training/application/finish-workout.ts';
import { GetActiveWorkout } from '../training/application/get-active-workout.ts';
import { GetLastPerformance } from '../training/application/get-last-performance.ts';
import { GetTrainingDays } from '../training/application/get-training-days.ts';
import { ListExercises } from '../training/application/list-exercises.ts';
import { ListRecentWorkouts } from '../training/application/list-recent-workouts.ts';
import { ListTemplates } from '../training/application/list-templates.ts';
import { MarkRestDay } from '../training/application/mark-rest-day.ts';
import { MoveTemplate } from '../training/application/move-template.ts';
import { RemoveExerciseFromWorkout } from '../training/application/remove-exercise-from-workout.ts';
import { RemoveRestDay } from '../training/application/remove-rest-day.ts';
import { RemoveSet } from '../training/application/remove-set.ts';
import { RenameTemplate } from '../training/application/rename-template.ts';
import { SaveWorkoutAsTemplate } from '../training/application/save-workout-as-template.ts';
import { SetWorkoutNote } from '../training/application/set-workout-note.ts';
import { StartWorkout } from '../training/application/start-workout.ts';
import { UpdateSet } from '../training/application/update-set.ts';
import { SqliteExerciseRepository } from '../training/infrastructure/sqlite-exercise-repository.ts';
import { SqliteRestDayRepository } from '../training/infrastructure/sqlite-rest-day-repository.ts';
import { SqliteWorkoutRepository } from '../training/infrastructure/sqlite-workout-repository.ts';
import { SqliteWorkoutTemplateRepository } from '../training/infrastructure/sqlite-workout-template-repository.ts';
import { last } from '../shared/collections.ts';
import type { Clock } from '../shared/clock.ts';

/** Every use case the UI can call, grouped by bounded context. */
export interface App {
	readonly clock: Clock;
	readonly body: ReturnType<typeof wireBody>;
	readonly settings: ReturnType<typeof wireSettings>;
	readonly training: ReturnType<typeof wireTraining>;
	readonly nutrition: ReturnType<typeof wireNutrition>;
	/** Hands a file to the browser's download flow. */
	readonly saveFile: (file: DownloadableFile) => void;
}

/** The infrastructure the use cases run on. */
export interface Infrastructure {
	readonly database: SqlDriver;
	readonly databaseFile: DatabaseFile;
	readonly clock: Clock;
}

/** The newest schema version this build understands. */
const SCHEMA_VERSION = last(bundledMigrations)?.version ?? 0;

function wireBody({ database, clock }: Infrastructure) {
	const weighIns = new SqliteWeighInRepository(database);
	const weightGoal = new SqliteWeightGoalRepository(database);
	return {
		recordWeighIn: new RecordWeighIn(weighIns, new UuidV7IdGenerator(clock)),
		deleteWeighIn: new DeleteWeighIn(weighIns),
		listWeighIns: new ListWeighIns(weighIns),
		getWeightGoal: new GetWeightGoal(weightGoal),
		setWeightGoal: new SetWeightGoal(weightGoal),
		clearWeightGoal: new ClearWeightGoal(weightGoal)
	};
}

function wireTraining({ database, clock }: Infrastructure) {
	const ids = new UuidV7IdGenerator(clock);
	const exercises = new SqliteExerciseRepository(database);
	const workouts = new SqliteWorkoutRepository(database);
	const templates = new SqliteWorkoutTemplateRepository(database);
	const restDays = new SqliteRestDayRepository(database);
	return {
		listExercises: new ListExercises(exercises),
		startWorkout: new StartWorkout({ workouts, templates, clock, ids }),
		getActiveWorkout: new GetActiveWorkout(workouts),
		addExerciseToWorkout: new AddExerciseToWorkout({ workouts, exercises, ids }),
		addSet: new AddSet(workouts),
		updateSet: new UpdateSet(workouts),
		removeSet: new RemoveSet(workouts),
		removeExerciseFromWorkout: new RemoveExerciseFromWorkout(workouts),
		setWorkoutNote: new SetWorkoutNote(workouts),
		finishWorkout: new FinishWorkout({ workouts, restDays, clock }),
		discardWorkout: new DiscardWorkout(workouts),
		listRecentWorkouts: new ListRecentWorkouts(workouts),
		getLastPerformance: new GetLastPerformance(workouts),
		saveWorkoutAsTemplate: new SaveWorkoutAsTemplate({ workouts, templates, ids }),
		listTemplates: new ListTemplates(templates),
		renameTemplate: new RenameTemplate(templates),
		deleteTemplate: new DeleteTemplate(templates),
		moveTemplate: new MoveTemplate(templates),
		markRestDay: new MarkRestDay({ restDays, workouts, ids }),
		removeRestDay: new RemoveRestDay(restDays),
		getTrainingDays: new GetTrainingDays({ workouts, restDays, clock })
	};
}

function wireNutrition({ database, clock }: Infrastructure) {
	const ids = new UuidV7IdGenerator(clock);
	const foods = new SqliteFoodRepository(database);
	const meals = new SqliteSavedMealRepository(database);
	const log = new SqliteFoodLogRepository(database);
	const goals = new SqliteDailyGoalsRepository(database);
	return {
		createFood: new CreateFood(foods, ids),
		listFoods: new ListFoods(foods),
		logFood: new LogFood({ foods, log, clock, ids }),
		changeLogAmount: new ChangeLogAmount(log),
		deleteLogEntry: new DeleteLogEntry(log),
		getDayNutrition: new GetDayNutrition(log, goals),
		getLastAmount: new GetLastAmount(log),
		saveMealFromSlot: new SaveMealFromSlot({ log, meals, ids }),
		listSavedMeals: new ListSavedMeals(meals),
		deleteSavedMeal: new DeleteSavedMeal(meals),
		logSavedMeal: new LogSavedMeal({ meals, foods, log, clock, ids }),
		setDailyGoals: new SetDailyGoals(goals, clock),
		getDailyGoals: new GetDailyGoals(goals)
	};
}

function wireSettings({ database, databaseFile, clock }: Infrastructure) {
	const massUnit = new SqliteMassUnitPreference(database);
	const state = new SqliteAppState(database);
	const inventory = new SqliteDataInventory(database);
	const codec = new ZipBackupCodec();
	const version = { appVersion: __APP_VERSION__, schemaVersion: SCHEMA_VERSION };
	return {
		getMassUnit: new GetMassUnit(massUnit),
		setMassUnit: new SetMassUnit(massUnit),
		getSetupStatus: new GetSetupStatus(state),
		completeSetup: new CompleteSetup(state),
		getBackupStatus: new GetBackupStatus(state, clock),
		countRecords: new CountRecords(inventory),
		exportBackup: new ExportBackup({
			database: databaseFile,
			codec,
			lastExport: state,
			clock,
			version
		}),
		previewRestore: new PreviewRestore(codec, inventory, SCHEMA_VERSION),
		restoreBackup: new RestoreBackup(codec, databaseFile, SCHEMA_VERSION),
		deleteAllData: new DeleteAllData(databaseFile)
	};
}

/**
 * Wires infrastructure to use cases. This is the composition root, the only
 * module that knows which implementation backs each port.
 *
 * @param infrastructure - The database, its file, and the clock.
 */
export function wireApp(infrastructure: Infrastructure): App {
	return {
		clock: infrastructure.clock,
		body: wireBody(infrastructure),
		settings: wireSettings(infrastructure),
		training: wireTraining(infrastructure),
		nutrition: wireNutrition(infrastructure),
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
	return wireApp({ database, databaseFile: database, clock: new SystemClock() });
}
