import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { migrate, type Migration } from '../../src/lib/platform/db/migrate.ts';
import type { SqlStatement } from '../../src/lib/platform/db/sql.ts';
import { BACKUP_FORMAT_VERSION } from '../../src/lib/settings/domain/backup.ts';
import { ZipBackupCodec } from '../../src/lib/settings/infrastructure/zip-backup-codec.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { last } from '../../src/lib/shared/collections.ts';
import { NodeSqliteExecutor } from '../support/node-sqlite-executor.ts';
import { expectOk } from '../support/result.ts';
import { TestDatabase } from '../support/test-database.ts';
import { activitySets } from './demo-activities.ts';

const MIGRATIONS_FOLDER = path.join(import.meta.dirname, '../../src/lib/platform/db/migrations');

/** The app's migrations read from disk; `bundledMigrations` needs Vite, which Playwright lacks. */
const migrations: readonly Migration[] = readdirSync(MIGRATIONS_FOLDER)
	.filter((file) => file.endsWith('.sql'))
	.toSorted((a, b) => a.localeCompare(b))
	.map((file) => ({
		version: Number(file.slice(0, 4)),
		sql: readFileSync(path.join(MIGRATIONS_FOLDER, file), 'utf8')
	}));

/** The day the screenshots are taken on. */
export const DEMO_TODAY = '2026-10-28';

const today = expectOk(LocalDate.parse(DEMO_TODAY));
const day = (back: number) => today.addDays(-back).toString();
const at = (back: number, hour: number) =>
	Date.UTC(today.year, today.month - 1, today.day - back, hour);

let sequence = 0;
/** A valid, deterministic UUIDv7. */
const id = () => {
	sequence += 1;
	return `01930000-0000-7000-8000-${sequence.toString(16).padStart(12, '0')}`;
};

const statement = (sql: string, params: SqlStatement['params'] = []): SqlStatement => ({
	name: 'demo data',
	sql,
	params
});

function weighIns(): SqlStatement[] {
	return Array.from({ length: 70 }, (_, back) => back)
		.filter((back) => back % 9 !== 4)
		.map((back) =>
			statement('INSERT INTO weigh_in (id, date, weight_kg) VALUES (?, ?, ?)', [
				id(),
				day(back),
				Math.round((80.2 + back * 0.05 + Math.sin(back * 1.7) * 0.45) * 10) / 10
			])
		);
}

const FOODS = [
	['Oats', 40, 'g', 150, 5, 27, 3, 'breakfast'],
	['Greek yogurt', 170, 'g', 100, 17, 6, 0.7, 'breakfast'],
	['Chicken breast', 150, 'g', 248, 46, 0, 5.4, 'lunch'],
	['Rice', 150, 'g', 195, 4, 42, 0.4, 'lunch'],
	['Salmon', 140, 'g', 290, 30, 0, 18, 'dinner'],
	['Potatoes', 250, 'g', 193, 5, 43, 0.3, 'dinner'],
	['Banana', 1, 'banana', 105, 1.3, 27, 0.4, 'snacks'],
	['Protein shake', 1, 'scoop', 120, 24, 3, 1.5, 'snacks']
] as const;

function food(): SqlStatement[] {
	const foodIds = FOODS.map(() => id());
	const definitions = FOODS.map(([name, amount, unit, calories, protein, carbs, fat], index) =>
		statement(
			'INSERT INTO food (id, name, reference_amount, reference_unit, calories, protein_g, carbs_g, fat_g) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			[foodIds[index] ?? '', name, amount, unit, calories, protein, carbs, fat]
		)
	);
	const goals = statement(
		"INSERT INTO daily_goals (effective_from, calories, protein_g, carbs_g, fat_g) VALUES ('2025-10-01', 2200, 150, 230, 70)"
	);
	const entries = Array.from({ length: 300 }, (_, back) => back)
		.filter((back) => back % 11 !== 3 && back % 17 !== 5)
		.flatMap((back) =>
			FOODS.flatMap(([name, amount, unit, calories, protein, carbs, fat, slot], index) => {
				const today = back === 0;
				if (today && slot !== 'breakfast' && slot !== 'lunch') return [];
				if ((back + index) % 7 === 0 && !today) return [];
				const portion = 1 + ((back * 3 + index) % 4) * 0.1;
				return [
					statement(
						`INSERT INTO food_log_entry (id, date, slot, food_id, food_name, unit, amount, calories, protein_g, carbs_g, fat_g, logged_at)
							VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
						[
							id(),
							day(back),
							slot,
							foodIds[index] ?? '',
							name,
							unit,
							amount * portion,
							calories * portion,
							protein * portion,
							carbs * portion,
							fat * portion,
							at(back, 8 + index)
						]
					)
				];
			})
		);
	return [...definitions, goals, ...entries];
}

const LIFTS = [
	['Squat', 80, 5],
	['Bench press', 60, 6],
	['Deadlift', 100, 4],
	['Overhead press', 40, 6]
] as const;

/** Exercises beyond the lifts: a run, bouldering, and yoga, with what each tracks. */
const ACTIVITIES = [
	['Run', 'distance,time', null],
	['Bouldering', 'grade', 'v'],
	['Yoga', 'time', null]
] as const;

const ACTIVITY_NAMES = ACTIVITIES.map(([name]) => name);

function templates(liftIds: readonly string[], activityIds: readonly string[]): SqlStatement[] {
	const plans = [
		['Push day', [liftIds.at(1), liftIds.at(3)]],
		['Legs', [liftIds.at(0), liftIds.at(2)]],
		['Easy run', [activityIds.at(0)]],
		['Climbing', [activityIds.at(1)]]
	] as const;
	return plans.flatMap(([name, exercises], position) => {
		const templateId = id();
		return [
			statement('INSERT INTO workout_template (id, name, position) VALUES (?, ?, ?)', [
				templateId,
				name,
				position
			]),
			...exercises.map((exerciseId, index) =>
				statement(
					'INSERT INTO template_exercise (template_id, position, exercise_id, target_sets) VALUES (?, ?, ?, 3)',
					[templateId, index, exerciseId ?? '']
				)
			)
		];
	});
}

function workoutWith(
	back: number,
	minutes: number,
	exercises: readonly (readonly [string, (readonly (number | null)[])[]])[]
) {
	const workoutId = id();
	const statements = [
		statement(
			'INSERT INTO workout (id, date, started_at, finished_at, note, source_template_id) VALUES (?, ?, ?, ?, ?, NULL)',
			[workoutId, day(back), at(back, 17), at(back, 17) + minutes * 60_000, '']
		)
	];
	exercises.forEach(([exerciseId, sets], position) => {
		statements.push(
			statement(
				'INSERT INTO workout_exercise (workout_id, position, exercise_id) VALUES (?, ?, ?)',
				[workoutId, position, exerciseId]
			)
		);
		sets.forEach((set, setPosition) => {
			statements.push(
				statement(
					`INSERT INTO workout_set (workout_id, exercise_position, position, reps, weight_kg, seconds,
						distance_m, grade, count, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
					[workoutId, position, setPosition, ...set]
				)
			);
		});
	});
	return statements;
}

function liftWorkout(back: number, weekday: number, exerciseIds: readonly string[]) {
	const lifts = LIFTS.filter((_, index) => (index + weekday / 2) % 2 === 0 || index === 0).map(
		([, start, reps]) => {
			const lift = LIFTS.findIndex(([, other]) => other === start);
			const kilograms = Math.round((start + (300 - back) * 0.1) / 2.5) * 2.5;
			const sets = [0, 1, 2].map(() => [reps, kilograms, null, null, null, null]);
			return [exerciseIds.at(lift) ?? '', sets] as const;
		}
	);
	return workoutWith(back, 45 + (back % 4) * 10, lifts);
}

function activityWorkout(back: number, weekday: number, activityIds: readonly string[]) {
	const second = back % 2 === 0 ? 1 : 2;
	const index = weekday === 1 ? 0 : second;
	const name = ACTIVITY_NAMES.at(index) ?? 'Run';
	return workoutWith(back, 30 + (back % 3) * 15, [
		[activityIds.at(index) ?? '', activitySets(name, back)]
	]);
}

function dayOfTraining(
	back: number,
	exerciseIds: readonly string[],
	activityIds: readonly string[]
) {
	const weekday = back % 7;
	if (back % 23 === 6) return [];
	if (weekday === 0 || weekday === 2 || weekday === 4)
		return liftWorkout(back, weekday, exerciseIds);
	if (weekday === 1 || weekday === 5) return activityWorkout(back, weekday, activityIds);
	return back < 40
		? [statement('INSERT INTO rest_day (id, date) VALUES (?, ?)', [id(), day(back)])]
		: [];
}

function training(): SqlStatement[] {
	const exerciseIds = LIFTS.map(() => id());
	const activityIds = ACTIVITIES.map(() => id());
	const statements: SqlStatement[] = [
		...LIFTS.map(([name], index) =>
			statement('INSERT INTO exercise (id, name) VALUES (?, ?)', [exerciseIds[index] ?? '', name])
		),
		...ACTIVITIES.map(([name, fields, scale], index) =>
			statement(
				'INSERT INTO exercise (id, name, tracked_fields, grade_scale) VALUES (?, ?, ?, ?)',
				[activityIds[index] ?? '', name, fields, scale]
			)
		),
		...templates(exerciseIds, activityIds)
	];
	for (let back = 300; back >= 0; back -= 1) {
		statements.push(...dayOfTraining(back, exerciseIds, activityIds));
	}
	return statements;
}

function settings(): SqlStatement[] {
	return [
		statement("INSERT INTO weight_goal (id, target_kg, direction) VALUES (1, 78, 'lose')"),
		statement("INSERT INTO app_setting (key, value) VALUES ('setup_complete', '1')"),
		statement("INSERT INTO app_setting (key, value) VALUES ('last_export_at', ?)", [
			String(at(2, 9))
		])
	];
}

/**
 * Builds a backup file full of plausible, made-up data for the screenshots:
 * about ten months of training and food, and ten weeks of weigh-ins.
 */
export async function demoBackup(): Promise<Uint8Array> {
	const executor = new NodeSqliteExecutor();
	const database = new TestDatabase(executor);
	await migrate(database, migrations);
	await database.transaction([...weighIns(), ...food(), ...training(), ...settings()]);
	return new ZipBackupCodec().encode({
		manifest: {
			formatVersion: BACKUP_FORMAT_VERSION,
			appVersion: '1.0.0',
			schemaVersion: last(migrations)?.version ?? 0,
			createdAt: at(0, 7)
		},
		database: executor.serialize(),
		photos: []
	});
}
