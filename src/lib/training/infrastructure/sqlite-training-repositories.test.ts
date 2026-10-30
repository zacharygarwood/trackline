import { describe, expect, it } from 'vitest';
import { anId, aSet, aTemplateId, aWorkout } from '../../../../tests/builders/training.builder.ts';
import { describeTrainingRepositories } from '../../../../tests/contracts/training-repositories.contract.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { TestDatabase } from '../../../../tests/support/test-database.ts';
import { bundledMigrations } from '../../platform/db/bundled-migrations.ts';
import { migrate } from '../../platform/db/migrate.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import { GradeScale, TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { exerciseMapper } from './exercise.mapper.ts';
import { restDayMapper } from './simple.mapper.ts';
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
		const exercise = { id: anId<'Exercise'>(), name: 'Squat', tracking: WEIGHT_AND_REPS };
		const swim = {
			id: anId<'Exercise'>(),
			name: 'Swim',
			tracking: {
				fields: [TrackedField.distance, TrackedField.time, TrackedField.count],
				grades: undefined,
				countLabel: 'Laps'
			}
		};
		const wall = {
			id: anId<'Exercise'>(),
			name: 'Gym wall',
			tracking: {
				fields: [TrackedField.grade],
				grades: { scale: GradeScale.custom, grades: ['White', 'Blue'] },
				countLabel: undefined
			}
		};
		const restDay = restDayMapper.toDomain({ id: anId<'RestDay'>(), date: '2026-10-27' });

		expect(expectOk(templateMapper.toDomain(rows))).toEqual(template);
		for (const known of [exercise, swim, wall]) {
			expect(expectOk(exerciseMapper.toDomain(exerciseMapper.toRow(known)))).toEqual(known);
		}
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

describe('migration 0006', () => {
	it('keeps earlier exercises and sets, tracking weight and reps', async () => {
		const database = new TestDatabase();
		const beforeTracking = bundledMigrations.filter((migration) => migration.version < 6);
		await migrate(database, beforeTracking);
		await database.transaction(
			[
				"INSERT INTO exercise (id, name) VALUES ('01910000-0000-7000-8000-00000000aaaa', 'Squat')",
				"INSERT INTO workout (id, date, started_at, finished_at, note) VALUES ('01910000-0000-7000-8000-00000000bbbb', '2026-10-01', 0, 1, '')",
				"INSERT INTO workout_exercise VALUES ('01910000-0000-7000-8000-00000000bbbb', 0, '01910000-0000-7000-8000-00000000aaaa')",
				"INSERT INTO workout_set VALUES ('01910000-0000-7000-8000-00000000bbbb', 0, 0, 5, 100, 1)"
			].map((sql) => ({ name: 'old data', sql, params: [] }))
		);

		await migrate(database, bundledMigrations);

		const [squat] = await new SqliteExerciseRepository(database).findAll();
		const [workout] = await new SqliteWorkoutRepository(database).findRecent(1);
		expect(squat?.tracking).toEqual(WEIGHT_AND_REPS);
		expect(workout?.exercises.at(0)?.sets.at(0)).toMatchObject({ reps: 5, completed: true });
		expect(workout?.exercises.at(0)?.sets.at(0)?.weight?.kilograms).toBe(100);
	});
});
