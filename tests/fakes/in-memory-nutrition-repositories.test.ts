import { describeNutritionRepositories } from '../contracts/nutrition-repositories.contract.ts';
import {
	InMemoryDailyGoals,
	InMemoryFoodLog,
	InMemoryFoods,
	InMemorySavedMeals
} from './in-memory-nutrition-repositories.ts';

describeNutritionRepositories(() => {
	const log = new InMemoryFoodLog();
	return Promise.resolve({
		foods: new InMemoryFoods(log),
		meals: new InMemorySavedMeals(),
		log,
		goals: new InMemoryDailyGoals()
	});
});
