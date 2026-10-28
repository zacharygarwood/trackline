import { describeTrainingRepositories } from '../contracts/training-repositories.contract.ts';
import {
	InMemoryExerciseRepository,
	InMemoryRestDayRepository,
	InMemoryWorkoutRepository,
	InMemoryWorkoutTemplateRepository
} from './in-memory-training-repositories.ts';

describeTrainingRepositories(() =>
	Promise.resolve({
		exercises: new InMemoryExerciseRepository(),
		workouts: new InMemoryWorkoutRepository(),
		templates: new InMemoryWorkoutTemplateRepository(),
		restDays: new InMemoryRestDayRepository()
	})
);
