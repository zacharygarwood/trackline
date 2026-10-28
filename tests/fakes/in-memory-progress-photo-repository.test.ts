import { describeProgressPhotoRepository } from '../contracts/progress-photo-repository.contract.ts';
import { InMemoryProgressPhotoRepository } from './in-memory-progress-photo-repository.ts';

describeProgressPhotoRepository(() => Promise.resolve(new InMemoryProgressPhotoRepository()));
