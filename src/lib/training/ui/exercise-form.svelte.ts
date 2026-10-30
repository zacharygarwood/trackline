import { messages } from '../../i18n/messages.en.ts';
import { last } from '../../shared/collections.ts';
import { GradeScale, TRACKED_FIELDS, TrackedField } from '../domain/tracking.constants.ts';
import { gradesOf, type GradeChoice, type Tracking } from '../domain/tracking.ts';

/** Grades a custom scale gets when none are typed. */
const FALLBACK_GRADES = ['1', '2', '3'];

/** The scales offered, in order. */
export const GRADE_SCALES = [
	GradeScale.v,
	GradeScale.yds,
	GradeScale.font,
	GradeScale.oneToTen,
	GradeScale.custom
] as const;

/** The tracked fields offered, in the order the form shows them. */
export const FORM_FIELDS = [
	TrackedField.weight,
	TrackedField.reps,
	TrackedField.time,
	TrackedField.distance,
	TrackedField.grade,
	TrackedField.count
] as const;

/** The form that adds a typed name as a new exercise: what to track, the grade scale, and the count label. */
export class ExerciseForm {
	fields: readonly TrackedField[] = $state([]);
	scale: GradeScale = $state(GradeScale.v);
	customGrades = $state('');
	countLabel = $state('');

	/** Whether at least one field is chosen. */
	get ready(): boolean {
		return this.fields.length > 0;
	}

	/** Turns a field on or off. */
	toggle(field: TrackedField): void {
		this.fields = this.fields.includes(field)
			? this.fields.filter((chosen) => chosen !== field)
			: [...this.fields, field];
	}

	/** The custom grades as typed, or none yet. */
	private get typedGrades(): readonly string[] {
		return this.customGrades
			.split(messages.exercise.gradeSeparator)
			.map((grade) => grade.trim())
			.filter((grade) => grade !== '');
	}

	/** The chosen scale with its grades. */
	get gradeChoice(): GradeChoice {
		if (this.scale !== GradeScale.custom) return { scale: this.scale };
		const grades = this.typedGrades;
		return { scale: GradeScale.custom, grades: grades.length > 0 ? grades : FALLBACK_GRADES };
	}

	/** The easiest and hardest grade of the chosen scale, for example "VB to V17". */
	get scalePreview(): string {
		const grades = this.scale === GradeScale.custom ? this.typedGrades : gradesOf(this.gradeChoice);
		const easiest = grades.at(0);
		const hardest = last(grades);
		return easiest === undefined || hardest === undefined
			? ''
			: messages.exercise.scalePreview(easiest, hardest);
	}

	/** What the new exercise will track. */
	get tracking(): Tracking {
		const fields = TRACKED_FIELDS.filter((field) => this.fields.includes(field));
		const typed = this.countLabel.trim();
		const label = typed === '' ? messages.exercise.defaultCountLabel : typed;
		return {
			fields,
			grades: fields.includes(TrackedField.grade) ? this.gradeChoice : undefined,
			countLabel: fields.includes(TrackedField.count) ? label : undefined
		};
	}

	/** Clears the form for the next exercise. */
	reset(): void {
		this.fields = [];
		this.scale = GradeScale.v;
		this.customGrades = '';
		this.countLabel = '';
	}
}
