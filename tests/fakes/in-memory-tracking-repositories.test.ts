import { describeTrackingRepositories } from '../contracts/tracking-repositories.contract.ts';
import { inMemoryTracking } from './in-memory-tracking-repositories.ts';

describeTrackingRepositories(() => Promise.resolve(inMemoryTracking()));
