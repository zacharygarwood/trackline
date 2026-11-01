import { AddExerciseToWorkout } from '../../src/lib/training/application/add-exercise-to-workout.ts';
import { CreateExercise } from '../../src/lib/training/application/create-exercise.ts';
import { CreateTemplate } from '../../src/lib/training/application/create-template.ts';
import { DeleteExercise } from '../../src/lib/training/application/delete-exercise.ts';
import { DeleteTemplate } from '../../src/lib/training/application/delete-template.ts';
import { DiscardWorkout } from '../../src/lib/training/application/discard-workout.ts';
import { EditTemplate } from '../../src/lib/training/application/edit-template.ts';
import { FinishWorkout } from '../../src/lib/training/application/finish-workout.ts';
import { GetActiveWorkout } from '../../src/lib/training/application/get-active-workout.ts';
import { GetLastPerformance } from '../../src/lib/training/application/get-last-performance.ts';
import { GetTrainingDays } from '../../src/lib/training/application/get-training-days.ts';
import { ListExercises } from '../../src/lib/training/application/list-exercises.ts';
import { ListRecentExercises } from '../../src/lib/training/application/list-recent-exercises.ts';
import { ListRecentWorkouts } from '../../src/lib/training/application/list-recent-workouts.ts';
import { LogSet } from '../../src/lib/training/application/log-set.ts';
import { ListTemplates } from '../../src/lib/training/application/list-templates.ts';
import { MarkRestDay } from '../../src/lib/training/application/mark-rest-day.ts';
import { MoveTemplate } from '../../src/lib/training/application/move-template.ts';
import { RemoveExerciseFromWorkout } from '../../src/lib/training/application/remove-exercise-from-workout.ts';
import { RemoveRestDay } from '../../src/lib/training/application/remove-rest-day.ts';
import { RemoveSet } from '../../src/lib/training/application/remove-set.ts';
import { RenameExercise } from '../../src/lib/training/application/rename-exercise.ts';
import { RenameTemplate } from '../../src/lib/training/application/rename-template.ts';
import { RestoreWorkout } from '../../src/lib/training/application/restore-workout.ts';
import { SaveWorkoutAsTemplate } from '../../src/lib/training/application/save-workout-as-template.ts';
import { SetWorkoutNote } from '../../src/lib/training/application/set-workout-note.ts';
import { StartWorkout } from '../../src/lib/training/application/start-workout.ts';
import { FixedClock } from '../fakes/fixed-clock.ts';
import {
	InMemoryExerciseRepository,
	InMemoryRestDayRepository,
	InMemoryWorkoutRepository,
	InMemoryWorkoutTemplateRepository
} from '../fakes/in-memory-training-repositories.ts';
import { SequentialIdGenerator } from '../fakes/sequential-id-generator.ts';

/** Every training use case wired to in-memory fakes and a fixed clock, for application and view model tests. */
export function trainingApp(clock = new FixedClock(Date.UTC(2026, 9, 27, 9), '2026-10-27')) {
	const ids = new SequentialIdGenerator();
	const workouts = new InMemoryWorkoutRepository();
	const exercises = new InMemoryExerciseRepository(workouts);
	const templates = new InMemoryWorkoutTemplateRepository();
	const restDays = new InMemoryRestDayRepository();
	return {
		clock,
		repositories: { exercises, workouts, templates, restDays },
		listExercises: new ListExercises(exercises),
		listRecentExercises: new ListRecentExercises(exercises),
		createExercise: new CreateExercise({ exercises, ids }),
		renameExercise: new RenameExercise(exercises),
		deleteExercise: new DeleteExercise({ exercises, templates }),
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
		createTemplate: new CreateTemplate({ templates, ids }),
		listTemplates: new ListTemplates(templates),
		renameTemplate: new RenameTemplate(templates),
		editTemplate: new EditTemplate(templates),
		deleteTemplate: new DeleteTemplate(templates),
		moveTemplate: new MoveTemplate(templates),
		markRestDay: new MarkRestDay({ restDays, workouts, ids }),
		removeRestDay: new RemoveRestDay(restDays),
		getTrainingDays: new GetTrainingDays({ workouts, restDays, clock })
	};
}
