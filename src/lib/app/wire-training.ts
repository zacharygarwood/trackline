import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import { AddExerciseToWorkout } from '../training/application/add-exercise-to-workout.ts';
import { CreateExercise } from '../training/application/create-exercise.ts';
import { CreateTemplate } from '../training/application/create-template.ts';
import { DeleteTemplate } from '../training/application/delete-template.ts';
import { DiscardWorkout } from '../training/application/discard-workout.ts';
import { FinishWorkout } from '../training/application/finish-workout.ts';
import { GetActiveWorkout } from '../training/application/get-active-workout.ts';
import { GetLastPerformance } from '../training/application/get-last-performance.ts';
import { GetTrainingDays } from '../training/application/get-training-days.ts';
import { ListExercises } from '../training/application/list-exercises.ts';
import { ListRecentExercises } from '../training/application/list-recent-exercises.ts';
import { ListRecentWorkouts } from '../training/application/list-recent-workouts.ts';
import { LogSet } from '../training/application/log-set.ts';
import { ListTemplates } from '../training/application/list-templates.ts';
import { MarkRestDay } from '../training/application/mark-rest-day.ts';
import { MoveTemplate } from '../training/application/move-template.ts';
import { RemoveExerciseFromWorkout } from '../training/application/remove-exercise-from-workout.ts';
import { RemoveRestDay } from '../training/application/remove-rest-day.ts';
import { RemoveSet } from '../training/application/remove-set.ts';
import { RenameTemplate } from '../training/application/rename-template.ts';
import { RestoreWorkout } from '../training/application/restore-workout.ts';
import { SaveWorkoutAsTemplate } from '../training/application/save-workout-as-template.ts';
import { SetWorkoutNote } from '../training/application/set-workout-note.ts';
import { StartWorkout } from '../training/application/start-workout.ts';
import { SqliteExerciseRepository } from '../training/infrastructure/sqlite-exercise-repository.ts';
import { SqliteRestDayRepository } from '../training/infrastructure/sqlite-rest-day-repository.ts';
import { SqliteWorkoutRepository } from '../training/infrastructure/sqlite-workout-repository.ts';
import { SqliteWorkoutTemplateRepository } from '../training/infrastructure/sqlite-workout-template-repository.ts';
import type { Infrastructure } from './infrastructure.ts';

function wireTemplates(templates: SqliteWorkoutTemplateRepository, ids: UuidV7IdGenerator) {
	return {
		createTemplate: new CreateTemplate({ templates, ids }),
		listTemplates: new ListTemplates(templates),
		renameTemplate: new RenameTemplate(templates),
		deleteTemplate: new DeleteTemplate(templates),
		moveTemplate: new MoveTemplate(templates)
	};
}

/**
 * Wires the Training context: exercises, workouts, templates, and rest days.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireTraining(infrastructure: Infrastructure) {
	const { database, clock } = infrastructure;
	const ids = new UuidV7IdGenerator(clock);
	const exercises = new SqliteExerciseRepository(database);
	const workouts = new SqliteWorkoutRepository(database);
	const templates = new SqliteWorkoutTemplateRepository(database);
	const restDays = new SqliteRestDayRepository(database);
	return {
		listExercises: new ListExercises(exercises),
		listRecentExercises: new ListRecentExercises(exercises),
		createExercise: new CreateExercise({ exercises, ids }),
		startWorkout: new StartWorkout({ workouts, templates, clock, ids }),
		getActiveWorkout: new GetActiveWorkout(workouts),
		addExerciseToWorkout: new AddExerciseToWorkout({ workouts, exercises, ids }),
		logSet: new LogSet(workouts),
		restoreWorkout: new RestoreWorkout(workouts),
		removeSet: new RemoveSet(workouts),
		removeExerciseFromWorkout: new RemoveExerciseFromWorkout(workouts),
		setWorkoutNote: new SetWorkoutNote(workouts),
		finishWorkout: new FinishWorkout({ workouts, restDays, clock }),
		discardWorkout: new DiscardWorkout(workouts),
		listRecentWorkouts: new ListRecentWorkouts(workouts),
		getLastPerformance: new GetLastPerformance(workouts),
		saveWorkoutAsTemplate: new SaveWorkoutAsTemplate({ workouts, templates, ids }),
		...wireTemplates(templates, ids),
		markRestDay: new MarkRestDay({ restDays, workouts, ids }),
		removeRestDay: new RemoveRestDay(restDays),
		getTrainingDays: new GetTrainingDays({ workouts, restDays, clock })
	};
}
