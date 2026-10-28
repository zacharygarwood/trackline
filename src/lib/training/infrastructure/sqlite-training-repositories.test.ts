import { describe, expect, it } from 'vitest';
import { anId, aSet, aTemplateId, aWorkout } from '../../../../tests/builders/training.builder.ts';
import { describeTrainingRepositories } from '../../../../tests/contracts/training-repositories.contract.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import { exerciseMapper, restDayMapper } from './simple.mapper.ts';
import { SqliteExerciseRepository } from './sqlite-exercise-repository.ts';
import { SqliteRestDayRepository } from './sqlite-rest-day-repository.ts';
import { SqliteWorkoutRepository } from './sqlite-workout-repository.ts';
import { SqliteWorkoutTemplateRepository } from './sqlite-workout-template-repository.ts';
import { templateMapper } from './template.mapper.ts';
import { workoutMapper } from './workout.mapper.ts';

describeTrainingRepositories(async () => {
	const database = await migratedDatabase();
	return {
		exercises: new SqliteExerciseRepository(database),
		workouts: new SqliteWorkoutRepository(database),
		templates: new SqliteWorkoutTemplateRepository(database),
		restDays: new SqliteRestDayRepository(database)
	};
});

describe('training mappers', () => {
	it('round-trip a finished workout', () => {
		const workout = aWorkout()
			.fromTemplate(aTemplateId())
			.with(anId(), aSet(5, 100, true), aSet(5, 102.5, true))
			.finished();
		const rows = workoutMapper.toRows(workout);

		expect(
			expectOk(
				workoutMapper.toDomain({
					workout: rows.workout,
					exercises: rows.exercises,
					sets: rows.sets
				})
			)
		).toEqual(workout);
	});

	it('round-trip a template, an exercise, and a rest day', () => {
		const template = {
			id: aTemplateId(),
			name: 'Legs',
			position: 0,
			exercises: [{ exerciseId: anId<'Exercise'>(), targetSets: 3 }]
		};
		const rows = templateMapper.toRows(template);
		const exercise = { id: anId<'Exercise'>(), name: 'Squat' };
		const restDay = restDayMapper.toDomain({ id: anId<'RestDay'>(), date: '2026-10-27' });

		expect(expectOk(templateMapper.toDomain(rows))).toEqual(template);
		expect(expectOk(exerciseMapper.toDomain(exerciseMapper.toRow(exercise)))).toEqual(exercise);
		expect(expectOk(restDayMapper.toDomain(restDayMapper.toRow(expectOk(restDay))))).toEqual(
			expectOk(restDay)
		);
	});

	it.each([
		{
			workout: {
				id: 'x',
				date: '2026-10-27',
				started_at: 0,
				finished_at: null,
				note: '',
				source_template_id: null
			},
			exercises: [],
			sets: []
		},
		{ workout: { id: 1 }, exercises: [], sets: [] }
	])('reject a corrupt workout %#', (stored) => {
		expect(expectErr(workoutMapper.toDomain(stored))).toBeInstanceOf(CorruptRow);
	});

	it('rejects a template with an impossible set count', () => {
		const rows = templateMapper.toRows({
			id: aTemplateId(),
			name: 'Legs',
			position: 0,
			exercises: [{ exerciseId: anId<'Exercise'>(), targetSets: 3 }]
		});

		const [exerciseRow] = rows.exercises;
		const tooManySets = { ...exerciseRow, target_sets: 40 };

		expect(
			expectErr(templateMapper.toDomain({ ...rows, exercises: [tooManySets] }))
		).toBeInstanceOf(CorruptRow);
	});
});
