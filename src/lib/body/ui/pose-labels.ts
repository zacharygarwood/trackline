import { messages } from '../../i18n/messages.en.ts';
import { Pose } from '../domain/pose.constants.ts';

/** The poses in the order they are offered. */
export const POSES: readonly Pose[] = [Pose.front, Pose.side, Pose.back];

/** The label of each pose. */
export const POSE_LABELS: Readonly<Record<Pose, string>> = {
	[Pose.front]: messages.body.front,
	[Pose.side]: messages.body.side,
	[Pose.back]: messages.body.back
};
