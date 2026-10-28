import { ClearWeightGoal } from '../body/application/clear-weight-goal.ts';
import { DeleteWeighIn } from '../body/application/delete-weigh-in.ts';
import { GetWeightGoal } from '../body/application/get-weight-goal.ts';
import { ListWeighIns } from '../body/application/list-weigh-ins.ts';
import { RecordWeighIn } from '../body/application/record-weigh-in.ts';
import { SetWeightGoal } from '../body/application/set-weight-goal.ts';
import { AddProgressPhoto } from '../body/application/add-progress-photo.ts';
import { DeleteProgressPhoto } from '../body/application/delete-progress-photo.ts';
import { GetPhotoImage } from '../body/application/get-photo-image.ts';
import { ListProgressPhotos } from '../body/application/list-progress-photos.ts';
import { FolderPhotoStore } from '../body/infrastructure/folder-photo-store.ts';
import { SqliteProgressPhotoRepository } from '../body/infrastructure/sqlite-progress-photo-repository.ts';
import { SqliteWeighInRepository } from '../body/infrastructure/sqlite-weigh-in-repository.ts';
import { SqliteWeightGoalRepository } from '../body/infrastructure/sqlite-weight-goal-repository.ts';
import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import type { Infrastructure } from './infrastructure.ts';

/**
 * Wires the Body context: weigh-ins, the weight goal, and progress photos.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireBody(infrastructure: Infrastructure) {
	const { database, photoFolder, images, clock } = infrastructure;
	const weighIns = new SqliteWeighInRepository(database);
	const weightGoal = new SqliteWeightGoalRepository(database);
	const photos = new SqliteProgressPhotoRepository(database);
	const store = new FolderPhotoStore(photoFolder);
	const ids = new UuidV7IdGenerator(clock);
	return {
		addProgressPhoto: new AddProgressPhoto({ processor: images, store, photos, ids }),
		listProgressPhotos: new ListProgressPhotos(photos),
		deleteProgressPhoto: new DeleteProgressPhoto(photos, store),
		getPhotoImage: new GetPhotoImage(store),
		recordWeighIn: new RecordWeighIn(weighIns, ids),
		deleteWeighIn: new DeleteWeighIn(weighIns),
		listWeighIns: new ListWeighIns(weighIns),
		getWeightGoal: new GetWeightGoal(weightGoal),
		setWeightGoal: new SetWeightGoal(weightGoal),
		clearWeightGoal: new ClearWeightGoal(weightGoal)
	};
}
