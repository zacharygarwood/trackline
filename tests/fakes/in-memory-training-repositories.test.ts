import { describeTrainingRepositories } from '../contracts/training-repositories.contract.ts';
import {
	InMemoryExerciseRepository,
	InMemoryRestDayRepository,
	InMemoryWorkoutRepository,
	InMemoryWorkoutTemplateRepository
} from './in-memory-training-repositories.ts';

describeTrainingRepositories(() => {
	const workouts = new InMemoryWorkoutRepository();
	return Promise.resolve({
		exercises: new InMemoryExerciseRepository(workouts),
		workouts,
		templates: new InMemoryWorkoutTemplateRepository(),
		restDays: new InMemoryRestDayRepository()
	});
});
