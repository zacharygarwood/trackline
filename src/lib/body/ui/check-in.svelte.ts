import { messages } from '../../i18n/messages.en.ts';
import { parseDecimal } from '../../ui/format.ts';
import { Pose } from '../domain/pose.constants.ts';
import type { ProgressPhoto } from '../domain/progress-photo.ts';
import type { WeighIn } from '../domain/weigh-in.ts';
import type { BodyScreen } from './body-screen.svelte.ts';
import type { PhotoGallery } from './photo-gallery.svelte.ts';

const TENTH = 0.1;
const ONE_DECIMAL = 1;

/** What a check-in did, so it can be undone. */
export interface CheckInResult {
	/** "Checked in" or "Updated". */
	readonly message: string;
	readonly undo: () => Promise<void>;
}

/** The Body tab's check-in: today's weight, typed or stepped, and an optional photo. */
export class CheckIn {
	weight = $state('');
	/** The chosen photo's bytes, before it is saved. */
	photo: Uint8Array | undefined = $state();
	problem: string | undefined = $state();

	constructor(
		private readonly body: BodyScreen,
		private readonly gallery: PhotoGallery
	) {}

	/** Today's weigh-in, if there is one. */
	get todays(): WeighIn | undefined {
		return this.body.weighIns.find((weighIn) => weighIn.date.equals(this.body.today));
	}

	/** Starts the field at the latest weight. */
	prefill(): void {
		this.weight = this.body.suggestionFor(this.body.today);
		const typed = parseDecimal(this.weight);
		if (typed !== undefined) this.weight = typed.toFixed(ONE_DECIMAL);
	}

	/** Moves the weight a tenth up (1) or down (-1). */
	step(direction: number): void {
		const current = parseDecimal(this.weight) ?? 0;
		this.weight = Math.max(0, current + direction * TENTH).toFixed(ONE_DECIMAL);
		this.problem = undefined;
	}

	/**
	 * Saves the weight and the photo for today.
	 *
	 * @returns What happened and how to undo it, or undefined if nothing was saved.
	 */
	async save(): Promise<CheckInResult | undefined> {
		const typed = this.weight.trim() !== '';
		if (!typed && this.photo === undefined) return undefined;
		const previous = this.todays;
		if (typed) {
			this.problem = await this.body.record(this.body.today, this.weight);
			if (this.problem !== undefined) {
				this.problem = messages.checkIn.checkNumber;
				return undefined;
			}
		}
		const photo = await this.savePhoto();
		const message = previous === undefined ? messages.checkIn.checkedIn : messages.checkIn.updated;
		return { message, undo: () => this.undo(previous, photo) };
	}

	private async savePhoto(): Promise<ProgressPhoto | undefined> {
		const image = this.photo;
		if (image === undefined) return undefined;
		this.photo = undefined;
		await this.gallery.add(image, this.body.today.toString(), Pose.front);
		return this.gallery.photos.at(0);
	}

	private async undo(
		previous: WeighIn | undefined,
		photo: ProgressPhoto | undefined
	): Promise<void> {
		const todays = this.todays;
		if (previous !== undefined) {
			await this.body.record(previous.date, String(previous.weight.toUnit(this.body.unit)));
		} else if (todays !== undefined) {
			await this.body.remove(todays);
		}
		if (photo !== undefined) await this.gallery.remove(photo);
	}
}
