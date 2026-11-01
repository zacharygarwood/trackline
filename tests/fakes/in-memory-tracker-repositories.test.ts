import { describeTrackerRepositories } from '../contracts/tracker-repositories.contract.ts';
import {
	InMemoryTrackerEntries,
	InMemoryTrackers,
	InMemoryTrackerSetup
} from './in-memory-tracker-repositories.ts';

describeTrackerRepositories(() => {
	const entries = new InMemoryTrackerEntries();
	return Promise.resolve({
		trackers: new InMemoryTrackers(entries),
		entries,
		setup: new InMemoryTrackerSetup()
	});
});
