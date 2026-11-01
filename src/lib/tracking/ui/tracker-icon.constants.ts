import type { IconName } from '../../design/icon.constants.ts';
import type { TrackerIcon } from '../domain/tracking.constants.ts';

/** The design icon that draws each tracker icon. */
export const TRACKER_ICON_NAMES: Readonly<Record<TrackerIcon, IconName>> = {
	dumbbell: 'train',
	run: 'run',
	steps: 'steps',
	scale: 'body',
	camera: 'camera',
	food: 'eat',
	water: 'water',
	coffee: 'coffee',
	moon: 'moon',
	smile: 'smile',
	leaf: 'leaf',
	pill: 'pill',
	book: 'book',
	pen: 'pen',
	mind: 'mind',
	hash: 'hash',
	check: 'check',
	clock: 'clock',
	star: 'star',
	box: 'box'
};
