import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import {
	ChangeEntry,
	DeleteEntry,
	ListEntries,
	LogEntry,
	RestoreEntry
} from '../tracking/application/entries.ts';
import {
	AddSubject,
	ArchiveSubject,
	GetSubject,
	ListSubjects,
	UpdateSubject
} from '../tracking/application/library.ts';
import { DiscardPhoto, GetPhotoImage, SavePhoto } from '../tracking/application/photos.ts';
import { ListHome, ListStats } from '../tracking/application/progress.ts';
import {
	DiscardSession,
	FinishSession,
	GetSession,
	ListSessions,
	StartSession
} from '../tracking/application/sessions.ts';
import {
	AddTrackers,
	DeleteTracker,
	GetTracker,
	ListTrackers,
	MoveTracker,
	UpdateTracker
} from '../tracking/application/trackers.ts';
import { FolderPhotoStore } from '../tracking/infrastructure/folder-photo-store.ts';
import {
	SqliteEntryRepository,
	SqliteSessionRepository,
	SqliteSubjectRepository,
	SqliteTrackerRepository
} from '../tracking/infrastructure/sqlite-tracking-repositories.ts';
import {
	GetDatabaseFood,
	SaveDatabaseFood,
	SearchFoods
} from '../tracking/application/food-database.ts';
import type { Infrastructure } from './infrastructure.ts';

type Repositories = ReturnType<typeof repositoriesOf>;

function repositoriesOf(infrastructure: Infrastructure) {
	const { database, clock, photoFolder } = infrastructure;
	return {
		clock,
		ids: new UuidV7IdGenerator(clock),
		trackers: new SqliteTrackerRepository(database),
		subjects: new SqliteSubjectRepository(database),
		sessions: new SqliteSessionRepository(database),
		entries: new SqliteEntryRepository(database),
		photos: new FolderPhotoStore(photoFolder)
	};
}

function wireTrackers({ trackers, subjects, entries, sessions, photos, clock, ids }: Repositories) {
	const progress = { trackers, entries, sessions, clock };
	return {
		addTrackers: new AddTrackers({ trackers, subjects, ids }),
		updateTracker: new UpdateTracker(trackers),
		moveTracker: new MoveTracker(trackers),
		deleteTracker: new DeleteTracker({ trackers, entries, photos }),
		listTrackers: new ListTrackers(trackers),
		getTracker: new GetTracker(trackers),
		listHome: new ListHome(progress),
		listStats: new ListStats(progress)
	};
}

function wireEntries({ trackers, subjects, sessions, entries, photos, clock, ids }: Repositories) {
	return {
		logEntry: new LogEntry({ trackers, subjects, sessions, entries, clock, ids }),
		changeEntry: new ChangeEntry({ trackers, subjects, entries }),
		deleteEntry: new DeleteEntry({ entries, photos }),
		restoreEntry: new RestoreEntry(entries),
		listEntries: new ListEntries(entries)
	};
}

function wireLibraries({ trackers, subjects, ids }: Repositories) {
	return {
		addSubject: new AddSubject({ trackers, subjects, ids }),
		updateSubject: new UpdateSubject({ trackers, subjects }),
		archiveSubject: new ArchiveSubject(subjects),
		getSubject: new GetSubject(subjects),
		listSubjects: new ListSubjects(subjects)
	};
}

function wireSessions({ trackers, sessions, entries, clock, ids }: Repositories) {
	return {
		startSession: new StartSession({ trackers, sessions, clock, ids }),
		finishSession: new FinishSession({ sessions, entries, clock }),
		discardSession: new DiscardSession(sessions),
		listSessions: new ListSessions(sessions),
		getSession: new GetSession(sessions)
	};
}

/**
 * Wires the Tracking context: trackers, their libraries, sessions, entries, and photos.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireTracking(infrastructure: Infrastructure) {
	const repositories = repositoriesOf(infrastructure);
	const { photos, ids, trackers, subjects } = repositories;
	const { foods } = infrastructure;
	return {
		...wireTrackers(repositories),
		...wireEntries(repositories),
		...wireLibraries(repositories),
		...wireSessions(repositories),
		savePhoto: new SavePhoto({ processor: infrastructure.images, store: photos, ids }),
		getPhotoImage: new GetPhotoImage(photos),
		discardPhoto: new DiscardPhoto(photos),
		searchFoods: new SearchFoods(foods),
		getDatabaseFood: new GetDatabaseFood(foods),
		saveDatabaseFood: new SaveDatabaseFood({ trackers, subjects, foods, ids })
	};
}
