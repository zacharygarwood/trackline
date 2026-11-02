import {
	ChangeEntry,
	DeleteEntry,
	ListEntries,
	LogEntry,
	RestoreEntry
} from '../../src/lib/tracking/application/entries.ts';
import {
	AddSubject,
	ArchiveSubject,
	GetSubject,
	ListSubjects,
	UpdateSubject
} from '../../src/lib/tracking/application/library.ts';
import {
	DiscardPhoto,
	GetPhotoImage,
	SavePhoto
} from '../../src/lib/tracking/application/photos.ts';
import {
	GetDatabaseFood,
	SaveDatabaseFood,
	SearchFoods
} from '../../src/lib/tracking/application/food-database.ts';
import { ListHome, ListStats } from '../../src/lib/tracking/application/progress.ts';
import {
	DiscardSession,
	FinishSession,
	GetSession,
	ListSessions,
	StartSession
} from '../../src/lib/tracking/application/sessions.ts';
import {
	AddTrackers,
	DeleteTracker,
	GetTracker,
	ListTrackers,
	MoveTracker,
	UpdateTracker
} from '../../src/lib/tracking/application/trackers.ts';
import type { FieldKey, FieldValue } from '../../src/lib/tracking/domain/field.ts';
import { templateOf, type TemplateText } from '../../src/lib/tracking/domain/from-template.ts';
import type { TemplateKey } from '../../src/lib/tracking/domain/template.constants.ts';
import { FieldType } from '../../src/lib/tracking/domain/tracking.constants.ts';
import { aKey } from '../builders/tracking.builder.ts';
import { expectOk } from './result.ts';
import { FixedClock } from '../fakes/fixed-clock.ts';
import { InMemoryFoodDatabase } from '../fakes/in-memory-food-database.ts';
import { FakeImages, InMemoryPhotos } from '../fakes/in-memory-photos.ts';
import { inMemoryTracking } from '../fakes/in-memory-tracking-repositories.ts';
import { SequentialIdGenerator } from '../fakes/sequential-id-generator.ts';

/** Every tracking use case wired to in-memory fakes and a fixed clock. */
export function trackingApp(clock = new FixedClock(Date.UTC(2026, 9, 29, 12), '2026-10-29')) {
	const ids = new SequentialIdGenerator();
	const { trackers, subjects, sessions, entries } = inMemoryTracking();
	const photos = new InMemoryPhotos();
	const progress = { trackers, entries, sessions, clock };
	const foods = new InMemoryFoodDatabase();
	return {
		clock,
		photos,
		addTrackers: new AddTrackers({ trackers, subjects, ids }),
		updateTracker: new UpdateTracker(trackers),
		moveTracker: new MoveTracker(trackers),
		deleteTracker: new DeleteTracker({ trackers, entries, photos }),
		listTrackers: new ListTrackers(trackers),
		getTracker: new GetTracker(trackers),
		logEntry: new LogEntry({ trackers, subjects, sessions, entries, clock, ids }),
		changeEntry: new ChangeEntry({ trackers, subjects, entries }),
		deleteEntry: new DeleteEntry({ entries, photos }),
		restoreEntry: new RestoreEntry(entries),
		listEntries: new ListEntries(entries),
		addSubject: new AddSubject({ trackers, subjects, ids }),
		updateSubject: new UpdateSubject({ trackers, subjects }),
		archiveSubject: new ArchiveSubject(subjects),
		getSubject: new GetSubject(subjects),
		listSubjects: new ListSubjects(subjects),
		searchFoods: new SearchFoods(foods),
		getDatabaseFood: new GetDatabaseFood(foods),
		saveDatabaseFood: new SaveDatabaseFood({ trackers, subjects, foods, ids }),
		startSession: new StartSession({ trackers, sessions, clock, ids }),
		finishSession: new FinishSession({ sessions, entries, clock }),
		discardSession: new DiscardSession(sessions),
		listSessions: new ListSessions(sessions),
		getSession: new GetSession(sessions),
		savePhoto: new SavePhoto({ processor: new FakeImages(), store: photos, ids }),
		getPhotoImage: new GetPhotoImage(photos),
		discardPhoto: new DiscardPhoto(photos),
		listHome: new ListHome(progress),
		listStats: new ListStats(progress)
	};
}

/** Template words for tests: each label and unit is its own key. */
export const text = (name: string): TemplateText => ({
	name,
	label: (field) => field,
	unit: (unit) => unit
});

/** A number value for tests. */
export const number = (amount: number): FieldValue => ({ type: FieldType.number, amount });
/** Values by field key for tests, such as `values(['reps', number(5)])`. */
export const values = (...pairs: [string, FieldValue][]) =>
	new Map<FieldKey, FieldValue>(pairs.map(([key, value]) => [aKey(key), value]));

/** A tracking app with trackers added from the given templates, in order. */
export async function withTrackers(...keys: TemplateKey[]) {
	const app = trackingApp();
	const picks = keys.map((key) => {
		const template = templateOf(key);
		return {
			template,
			text: text(key),
			goal: template.goal,
			starterNames: template.starters.map((starter) => starter.key)
		};
	});
	const trackers = expectOk(await app.addTrackers.execute({ picks }));
	return { app, trackers };
}

/** A tracking app with trackers added from templates, and the first of them. */
export async function firstTracker(...keys: TemplateKey[]) {
	const { app, trackers } = await withTrackers(...keys);
	const tracker = trackers.at(0);
	if (tracker === undefined) throw new Error('No tracker was added');
	return { app, tracker, trackers };
}
