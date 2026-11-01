import { messages } from '../../i18n/messages.en.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { SaveTrackerCommand } from '../application/save-tracker.ts';
import {
	Combine,
	Direction,
	Measure,
	MEASURES_BY_SOURCE,
	Period,
	type TrackerSource
} from '../domain/tracker.constants.ts';
import { needsSubject, sourceOf, type Tracker } from '../domain/tracker.ts';
import { formatTrackerNumber, toShown, toStored, type TrackerUnits } from './tracker-format.ts';
import { PRESETS, type PresetName } from './tracker-presets.ts';

/** State of the page that builds or edits a tracker. */
export class TrackerForm {
	measure: Measure = $state(Measure.number);
	/** The chosen food or exercise, for measures of one. */
	subjectId: string | undefined = $state();
	name = $state('');
	unit = $state('');
	goal = $state('');
	direction: Direction = $state(Direction.atLeast);
	period: Period = $state(Period.day);
	combine: Combine = $state(Combine.total);
	/** Whether the name was typed, so choosing a measure or subject no longer replaces it. */
	private named = false;

	/** Where the chosen measure's numbers come from. */
	get source(): TrackerSource {
		return sourceOf(this.measure);
	}

	/** Whether the form asks for a food or exercise. */
	get needsSubject(): boolean {
		return needsSubject(this.measure);
	}

	/** Changes the name as typed. */
	rename(name: string): void {
		this.name = name;
		this.named = name.trim() !== '';
	}

	/** Switches to a source, on its first measure. */
	chooseSource(source: TrackerSource): void {
		const [measure] = MEASURES_BY_SOURCE[source];
		this.chooseMeasure(measure);
	}

	/** Switches to a measure, forgetting a food or exercise it doesn't use. */
	chooseMeasure(measure: Measure): void {
		this.measure = measure;
		if (!needsSubject(measure)) this.subjectId = undefined;
		if (!this.named) this.name = needsSubject(measure) ? '' : messages.trackers.measures[measure];
	}

	/**
	 * Picks the food or exercise to measure.
	 *
	 * @param subject - Its id and name, and a food's own unit.
	 * @param subject.id - The food or exercise id.
	 * @param subject.name - Its name, used as the tracker's name until one is typed.
	 * @param subject.unit - A food's unit, such as "g"; empty for exercises.
	 */
	chooseSubject(subject: { id: string; name: string; unit: string }): void {
		this.subjectId = subject.id;
		if (this.measure === Measure.food) this.unit = subject.unit;
		if (!this.named) this.name = subject.name;
	}

	/** Starts from a preset, keeping its name until another is typed. */
	usePreset(preset: PresetName): void {
		const fields = PRESETS[preset];
		this.measure = fields.measure;
		this.unit = fields.unit;
		this.goal = fields.goal > 0 ? formatTrackerNumber(fields.goal) : '';
		this.direction = fields.direction;
		this.period = fields.period;
		this.combine = fields.combine;
		this.name = messages.trackers.presets[preset];
		this.named = true;
	}

	/** Starts from an existing tracker, to edit it. */
	fill(tracker: Tracker, units: TrackerUnits): void {
		this.measure = tracker.measure;
		this.subjectId = tracker.subjectId;
		this.unit = tracker.unit;
		this.goal = formatTrackerNumber(toShown(tracker.measure, tracker.goal, units));
		this.direction = tracker.direction;
		this.period = tracker.period;
		this.combine = tracker.combine;
		this.name = tracker.name;
		this.named = true;
	}

	/**
	 * What saving the form stores.
	 *
	 * @param units - The units the goal was typed in.
	 */
	toCommand(units: TrackerUnits): SaveTrackerCommand {
		const goal = parseDecimal(this.goal.replaceAll(',', '')) ?? 0;
		return {
			name: this.name,
			measure: this.measure,
			subjectId: this.subjectId,
			unit: this.unit,
			goal: toStored(this.measure, goal, units),
			direction: this.direction,
			period: this.period,
			combine: this.combine
		};
	}
}
