import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { migrate, type Migration } from '../../src/lib/platform/db/migrate.ts';
import { BACKUP_FORMAT_VERSION } from '../../src/lib/settings/domain/backup.ts';
import { ZipBackupCodec } from '../../src/lib/settings/infrastructure/zip-backup-codec.ts';
import { last } from '../../src/lib/shared/collections.ts';
import { LogEntry } from '../../src/lib/tracking/application/entries.ts';
import { FinishSession, StartSession } from '../../src/lib/tracking/application/sessions.ts';
import { AddTrackers } from '../../src/lib/tracking/application/trackers.ts';
import { fieldKey, type FieldValue } from '../../src/lib/tracking/domain/field.ts';
import { templateOf } from '../../src/lib/tracking/domain/from-template.ts';
import type { Goal } from '../../src/lib/tracking/domain/goal.ts';
import { TemplateKey } from '../../src/lib/tracking/domain/template.constants.ts';
import type { Tracker } from '../../src/lib/tracking/domain/tracker.ts';
import { FieldType, GoalType } from '../../src/lib/tracking/domain/tracking.constants.ts';
import {
	SqliteEntryRepository,
	SqliteSessionRepository,
	SqliteSubjectRepository,
	SqliteTrackerRepository
} from '../../src/lib/tracking/infrastructure/sqlite-tracking-repositories.ts';
import { templatePick } from '../../src/lib/tracking/ui/template-text.ts';
import { FixedClock } from '../fakes/fixed-clock.ts';
import { SequentialIdGenerator } from '../fakes/sequential-id-generator.ts';
import { NodeSqliteExecutor } from '../support/node-sqlite-executor.ts';
import { expectOk } from '../support/result.ts';
import { TestDatabase } from '../support/test-database.ts';

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

const DAYS = 70;
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const todayAt = Date.UTC(2026, 9, 28, 12);
const number = (amount: number): FieldValue => ({ type: FieldType.number, amount });
const values = (...pairs: [string, FieldValue][]) =>
	new Map(pairs.map(([key, value]) => [fieldKey(key), value]));

function wire(database: TestDatabase, clock: FixedClock) {
	const ids = new SequentialIdGenerator();
	const trackers = new SqliteTrackerRepository(database);
	const subjects = new SqliteSubjectRepository(database);
	const sessions = new SqliteSessionRepository(database);
	const entries = new SqliteEntryRepository(database);
	return {
		subjects,
		addTrackers: new AddTrackers({ trackers, subjects, ids }),
		log: new LogEntry({ trackers, subjects, sessions, entries, clock, ids }),
		start: new StartSession({ trackers, sessions, clock, ids }),
		finish: new FinishSession({ sessions, entries, clock })
	};
}

type Demo = ReturnType<typeof wire>;

async function workout(
	demo: Demo,
	tracker: Tracker,
	clock: FixedClock,
	back: number
): Promise<void> {
	const exercises = await demo.subjects.findFor(tracker.id);
	const session = expectOk(await demo.start.execute({ trackerId: tracker.id }));
	for (const [index, exercise] of exercises.slice(back % 3, (back % 3) + 3).entries()) {
		for (let set = 0; set < 3; set += 1) {
			clock.advance(3 * 60_000);
			const weight = 40 + index * 20 + Math.floor((DAYS - back) / 7) * 2.5;
			await demo.log.execute({
				trackerId: tracker.id,
				subjectId: exercise.id,
				sessionId: session.id,
				values: values(['reps', number(8)], ['weight', number(weight)])
			});
		}
	}
	await demo.finish.execute({ id: session.id });
}

/** The demo's trackers. */
interface DemoTrackers {
	readonly workouts: Tracker;
	readonly water: Tracker;
	readonly sleep: Tracker;
	readonly weight: Tracker;
	readonly steps: Tracker;
}

function demoTrackers(added: readonly Tracker[]): DemoTrackers {
	const [workouts, water, sleep, weight, steps] = added;
	if (workouts === undefined || water === undefined || sleep === undefined)
		throw new Error('Demo trackers missing');
	if (weight === undefined || steps === undefined) throw new Error('Demo trackers missing');
	return { workouts, water, sleep, weight, steps };
}

function weightOn(back: number): number {
	return Math.round((80.2 + back * 0.05 + Math.sin(back * 1.7) * 0.45) * 10) / 10;
}

async function body(demo: Demo, trackers: DemoTrackers, back: number): Promise<void> {
	const sleep = { type: FieldType.duration, seconds: 23_400 + (back % 5) * 1200 } as const;
	await demo.log.execute({ trackerId: trackers.sleep.id, values: values(['time', sleep]) });
	if (back % 9 !== 4)
		await demo.log.execute({
			trackerId: trackers.weight.id,
			values: values(['weight', number(weightOn(back))])
		});
	const steps = number(6000 + ((back * 1373) % 6000));
	await demo.log.execute({ trackerId: trackers.steps.id, values: values(['steps', steps]) });
}

async function day(
	demo: Demo,
	trackers: DemoTrackers,
	clock: FixedClock,
	back: number
): Promise<void> {
	await body(demo, trackers, back);
	const glasses = back === 0 ? 5 : 6 + (back % 3);
	for (let glass = 0; glass < glasses; glass += 1) {
		await demo.log.execute({
			trackerId: trackers.water.id,
			values: values(['glasses', number(1)])
		});
	}
	if ([1, 3, 5].includes(back % 7)) await workout(demo, trackers.workouts, clock, back);
}

/**
 * Builds a backup file full of plausible, made-up data for the screenshots:
 * ten weeks of workouts, water, sleep, steps, and weigh-ins.
 */
export async function demoBackup(): Promise<Uint8Array> {
	const executor = new NodeSqliteExecutor();
	const database = new TestDatabase(executor);
	await migrate(database, migrations);
	const clock = new FixedClock(todayAt - DAYS * DAY, DEMO_TODAY);
	const demo = wire(database, clock);
	const weightGoal: Goal = { type: GoalType.target, field: fieldKey('weight'), target: 78 };
	const keys = [
		TemplateKey.workouts,
		TemplateKey.water,
		TemplateKey.sleep,
		TemplateKey.weight,
		TemplateKey.steps
	];
	const added = expectOk(
		await demo.addTrackers.execute({
			picks: keys.map((key) =>
				templatePick(templateOf(key), key === TemplateKey.weight ? weightGoal : undefined)
			)
		})
	);
	const trackers = demoTrackers(added);
	for (let back = DAYS; back >= 0; back -= 1) {
		const date = new Date(todayAt - back * DAY).toISOString().slice(0, 10);
		clock.setToday(date);
		await day(demo, trackers, clock, back);
		clock.advance(DAY);
	}
	await database.execute({
		name: 'demo settings',
		sql: "INSERT INTO app_setting (key, value) VALUES ('setup_complete', '1'), ('last_export_at', ?)",
		params: [String(todayAt - 2 * DAY)]
	});
	return new ZipBackupCodec().encode({
		manifest: {
			formatVersion: BACKUP_FORMAT_VERSION,
			appVersion: '1.0.0',
			schemaVersion: last(migrations)?.version ?? 0,
			createdAt: todayAt
		},
		database: executor.serialize(),
		photos: []
	});
}
