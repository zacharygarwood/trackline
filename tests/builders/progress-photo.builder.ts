import { Pose } from '../../src/lib/body/domain/pose.constants.ts';
import {
	createProgressPhoto,
	type ProgressPhoto,
	type ProgressPhotoId
} from '../../src/lib/body/domain/progress-photo.ts';
import { parseId } from '../../src/lib/shared/id.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { expectOk } from '../support/result.ts';

let sequence = 0;

/** A fresh, valid UUIDv7 for a progress photo, unique within a test run. */
export function aProgressPhotoId(): ProgressPhotoId {
	sequence += 1;
	const suffix = sequence.toString(16).padStart(12, '0');
	return expectOk(parseId<'ProgressPhoto'>(`01920000-0000-7000-8000-${suffix}`));
}

/** Builds progress photos for tests: `aProgressPhoto().on('2026-10-27').posing(Pose.side).build()`. */
export function aProgressPhoto() {
	let id = aProgressPhotoId();
	let date = '2026-10-27';
	let pose: Pose = Pose.front;
	const builder = {
		withId(value: ProgressPhotoId) {
			id = value;
			return builder;
		},
		on(value: string) {
			date = value;
			return builder;
		},
		posing(value: Pose) {
			pose = value;
			return builder;
		},
		build(): ProgressPhoto {
			return expectOk(
				createProgressPhoto({
					id,
					date: expectOk(LocalDate.parse(date)),
					pose,
					width: 1536,
					height: 2048
				})
			);
		}
	};
	return builder;
}
