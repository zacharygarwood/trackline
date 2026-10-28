import { AddExerciseToWorkout } from '../../src/lib/training/application/add-exercise-to-workout.ts';
import { AddSet } from '../../src/lib/training/application/add-set.ts';
import { DeleteTemplate } from '../../src/lib/training/application/delete-template.ts';
import { DiscardWorkout } from '../../src/lib/training/application/discard-workout.ts';
import { FinishWorkout } from '../../src/lib/training/application/finish-workout.ts';
import { GetActiveWorkout } from '../../src/lib/training/application/get-active-workout.ts';
import { GetLastPerformance } from '../../src/lib/training/application/get-last-performance.ts';
import { GetTrainingDays } from '../../src/lib/training/application/get-training-days.ts';
import { ListExercises } from '../../src/lib/training/application/list-exercises.ts';
import { ListRecentWorkouts } from '../../src/lib/training/application/list-recent-workouts.ts';
import { ListTemplates } from '../../src/lib/training/application/list-templates.ts';
import { MarkRestDay } from '../../src/lib/training/application/mark-rest-day.ts';
import { MoveTemplate } from '../../src/lib/training/application/move-template.ts';
import { RemoveExerciseFromWorkout } from '../../src/lib/training/application/remove-exercise-from-workout.ts';
import { RemoveRestDay } from '../../src/lib/training/application/remove-rest-day.ts';
import { RemoveSet } from '../../src/lib/training/application/remove-set.ts';
import { RenameTemplate } from '../../src/lib/training/application/rename-template.ts';
import { SaveWorkoutAsTemplate } from '../../src/lib/training/application/save-workout-as-template.ts';
import { SetWorkoutNote } from '../../src/lib/training/application/set-workout-note.ts';
import { StartWorkout } from '../../src/lib/training/application/start-workout.ts';
import { UpdateSet } from '../../src/lib/training/application/update-set.ts';
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
	const exercises = new InMemoryExerciseRepository();
	const workouts = new InMemoryWorkoutRepository();
	const templates = new InMemoryWorkoutTemplateRepository();
	const restDays = new InMemoryRestDayRepository();
	return {
		clock,
		repositories: { exercises, workouts, templates, restDays },
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
