import { describe, expect, it } from 'vitest';
import { InMemoryWeightGoalRepository } from '../../../../tests/fakes/in-memory-weight-goal-repository.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { ClearWeightGoal } from '../application/clear-weight-goal.ts';
import { GetWeightGoal } from '../application/get-weight-goal.ts';
import { SetWeightGoal } from '../application/set-weight-goal.ts';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import { WeightGoalEditor } from './weight-goal-editor.svelte.ts';

function editor() {
	const goals = new InMemoryWeightGoalRepository();
	return new WeightGoalEditor({
		getWeightGoal: new GetWeightGoal(goals),
		setWeightGoal: new SetWeightGoal(goals),
		clearWeightGoal: new ClearWeightGoal(goals)
	});
}

describe('WeightGoalEditor', () => {
	it('skips a blank entry instead of rejecting it', async () => {
		const goalEditor = editor();

		expect(await goalEditor.saveIfFilled('  ', GoalDirection.lose, MassUnit.kg)).toBeUndefined();
		await goalEditor.load();
		expect(goalEditor.goal).toBeUndefined();
	});

	it('saves a filled-in entry', async () => {
		const goalEditor = editor();

		expect(await goalEditor.saveIfFilled('165', GoalDirection.gain, MassUnit.lb)).toBeUndefined();
		await goalEditor.load();
		expect(goalEditor.describe(MassUnit.lb)).toBe('165.0 lb, Gain');
	});

	it('says when no goal is set', async () => {
		const goalEditor = editor();
		await goalEditor.load();

		expect(goalEditor.describe(MassUnit.kg)).toBe('No goal set.');
	});

	it('sets a goal from a typed entry', async () => {
		const goalEditor = editor();

		expect(await goalEditor.save('75', GoalDirection.lose, MassUnit.kg)).toBeUndefined();

		expect(goalEditor.describe(MassUnit.kg)).toBe('75.0 kg, Lose');
		expect(goalEditor.suggestion(MassUnit.kg)).toBe('75');
	});

	it('rejects an implausible target', async () => {
		expect(await editor().save('5', GoalDirection.lose, MassUnit.kg)).toBe(
			'Enter a weight between 20.0 kg and 400.0 kg.'
		);
	});

	it('rejects an empty entry', async () => {
		expect(await editor().save('', GoalDirection.lose, MassUnit.kg)).toBe('Enter your weight.');
	});

	it('removes the goal', async () => {
		const goalEditor = editor();
		await goalEditor.save('75', GoalDirection.maintain, MassUnit.kg);

		await goalEditor.remove();

		expect(goalEditor.goal).toBeUndefined();
	});
});
