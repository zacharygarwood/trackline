import { beforeEach, describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { InMemoryMassUnitPreference } from '../../../../tests/fakes/in-memory-mass-unit-preference.ts';
import { InMemoryWeighInRepository } from '../../../../tests/fakes/in-memory-weigh-in-repository.ts';
import { InMemoryWeightGoalRepository } from '../../../../tests/fakes/in-memory-weight-goal-repository.ts';
import { SequentialIdGenerator } from '../../../../tests/fakes/sequential-id-generator.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { GetMassUnit } from '../../settings/application/get-mass-unit.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { DeleteWeighIn } from '../application/delete-weigh-in.ts';
import { GetWeightGoal } from '../application/get-weight-goal.ts';
import { ListWeighIns } from '../application/list-weigh-ins.ts';
import { RecordWeighIn } from '../application/record-weigh-in.ts';
import { BodyScreen } from './body-screen.svelte.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));

describe('BodyScreen', () => {
	let units: InMemoryMassUnitPreference;
	let screen: BodyScreen;

	beforeEach(async () => {
		const weighIns = new InMemoryWeighInRepository();
		const goals = new InMemoryWeightGoalRepository();
		units = new InMemoryMassUnitPreference();
		screen = new BodyScreen(
			{
				listWeighIns: new ListWeighIns(weighIns),
				recordWeighIn: new RecordWeighIn(weighIns, new SequentialIdGenerator()),
				deleteWeighIn: new DeleteWeighIn(weighIns),
				getWeightGoal: new GetWeightGoal(goals),
				getMassUnit: new GetMassUnit(units)
			},
			new FixedClock(0, '2026-10-27')
		);
		await screen.load();
	});

	it('records a typed weigh-in and shows it', async () => {
		expect(await screen.record(screen.today, '80.4')).toBeUndefined();

		expect(screen.weighIns.map((weighIn) => weighIn.weight.kilograms)).toEqual([80.4]);
	});

	it('suggests the most recent earlier weigh-in', async () => {
		await screen.record(date('2026-10-25'), '81');
		await screen.record(date('2026-10-26'), '80.5');

		expect(screen.suggestionFor(screen.today)).toBe('80.5');
		expect(screen.suggestionFor(date('2026-10-25'))).toBe('81');
		expect(screen.suggestionFor(date('2026-10-01'))).toBe('');
	});

	it('explains an empty entry', async () => {
		expect(await screen.record(screen.today, '')).toBe('Enter your weight.');
	});

	it('explains an implausible weight in the user unit', async () => {
		await units.write(MassUnit.lb);
		await screen.load();

		expect(await screen.record(screen.today, '9')).toBe(
			'Enter a weight between 44.1 lb and 881.8 lb.'
		);
	});

	it('removes a weigh-in', async () => {
		await screen.record(screen.today, '80');
		const [weighIn] = screen.weighIns;
		if (weighIn === undefined) throw new Error('expected a weigh-in');

		await screen.remove(weighIn);

		expect(screen.weighIns).toEqual([]);
	});
});
