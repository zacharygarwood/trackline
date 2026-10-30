<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonSize, ButtonVariant } from '../../design/button.constants.ts';
	import Icon from '../../design/Icon.svelte';
	import { IconWeight } from '../../design/icon.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import { formatClock } from '../../ui/format.ts';
	import type { Exercise } from '../domain/exercise.ts';
	import { TrackedField } from '../domain/tracking.constants.ts';
	import { gradesOf, tracks } from '../domain/tracking.ts';
	import type { WorkoutExercise } from '../domain/workout.ts';
	import LogButton from './LogButton.svelte';
	import { SessionMode } from './session-mode.constants.ts';
	import { sessionMode } from './session-rules.ts';
	import SetBoxes from './SetBoxes.svelte';
	import SetFields from './SetFields.svelte';
	import { setText } from './workout-format.ts';
	import type { WorkoutSession } from './workout-session.svelte.ts';

	/** Props for the exercise being logged: its fields, timer, grades, sets, and log button. */
	interface Props {
		session: WorkoutSession;
		entry: WorkoutExercise;
		exercise: Exercise;
		/** The current time, in epoch milliseconds, for the timers. */
		now: number;
		onlog: () => void;
		ondone: () => void;
	}

	const { session, entry, exercise, now, onlog, ondone }: Props = $props();

	const units = $derived(session.preferenceUnits);
	const mode = $derived(sessionMode(exercise));
	const target = $derived(session.targetOf(exercise));
	const draft = $derived(session.drafts[exercise.id]);
	const has = (field: TrackedField) => tracks(exercise.tracking, field);
	const seconds = $derived(session.seconds(exercise.id, now));
	const running = $derived(session.stopwatches[exercise.id]?.since !== undefined);
	const boxes = $derived(
		Array.from(
			{ length: Math.max(target === 0 ? 1 : target, entry.sets.length + (target === 0 ? 1 : 0)) },
			(_, position) => {
				const set = entry.sets.at(position);
				return set === undefined
					? { text: '', short: undefined }
					: {
							text: setText(set, exercise, { units }),
							short: setText(set, exercise, { units, compact: true })
						};
			}
		)
	);
	const resting = $derived(mode === SessionMode.sets && session.rest.running);
	const label = $derived(
		{ sets: messages.workout.logSet, single: messages.workout.done, multi: messages.workout.log }[
			mode
		]
	);
	const pace = $derived.by(() => {
		const distance = draft === undefined ? 0 : Number(draft.distance);
		return has(TrackedField.distance) && distance > 0 && seconds >= 1
			? messages.workout.pace(formatClock(seconds / distance), units.distance)
			: undefined;
	});
	const showDone = $derived(
		mode !== SessionMode.single &&
			entry.sets.length > 0 &&
			!(target > 0 && entry.sets.length >= target)
	);
</script>

<section class="current" aria-label={exercise.name}>
	<h1>{exercise.name}</h1>

	{#if has(TrackedField.grade) && exercise.tracking.grades !== undefined && draft !== undefined}
		<div class="grades" role="group" aria-label={messages.workout.grade}>
			{#each gradesOf(exercise.tracking.grades) as grade, position (position)}
				<button
					type="button"
					class:pressed={draft.grade === position}
					aria-pressed={draft.grade === position}
					onclick={() => {
						session.pickGrade(exercise.id, position);
					}}>{grade}</button
				>
			{/each}
		</div>
	{/if}

	{#if has(TrackedField.time)}
		<div class="clock">
			<p role="timer" aria-label={messages.workout.clockOf(exercise.name)}>
				{formatClock(seconds)}
			</p>
			<Button
				variant={ButtonVariant.secondary}
				onclick={() => {
					session.toggleStopwatch(exercise.id);
				}}
			>
				{#if running}{messages.workout.pause}{:else if seconds >= 1}{messages.workout
						.resume}{:else}{messages.workout.startClock}{/if}
			</Button>
		</div>
		{#if pace !== undefined}<p class="pace">{pace}</p>{/if}
	{/if}

	{#if draft !== undefined}
		<SetFields {session} {exercise} {draft} {units} />
	{/if}

	{#if mode === SessionMode.sets}
		<SetBoxes {boxes} onremove={(position: number) => session.removeSet(exercise.id, position)} />
	{:else if mode === SessionMode.multi && entry.sets.length > 0}
		<ol class="logged" aria-label={messages.workout.logged}>
			{#each entry.sets as set, position (position)}
				{@const text = setText(set, exercise, { units })}
				<li>
					<span class="number">{position + 1}</span>
					<span class="text">{text}</span>
					<button
						type="button"
						aria-label={messages.workout.removeEntry(text)}
						onclick={() => session.removeSet(exercise.id, position)}
						><Icon name="close" weight={IconWeight.bold} /></button
					>
				</li>
			{/each}
		</ol>
	{/if}

	<LogButton
		{label}
		rest={resting ? formatClock(session.rest.left(now)) : undefined}
		restShare={session.rest.share(now)}
		onlog={mode === SessionMode.single ? ondone : onlog}
		onskip={() => {
			session.rest.stop();
		}}
	/>
	{#if showDone}
		<div class="done">
			<Button variant={ButtonVariant.secondary} size={ButtonSize.medium} onclick={ondone}
				>{messages.workout.doneWith(exercise.name)}</Button
			>
		</div>
	{/if}
</section>

<style>
	.current {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		animation: rise var(--duration-rise) ease-out;
	}

	h1 {
		font-size: var(--font-size-36);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-title);
		letter-spacing: var(--letter-spacing-title);
	}

	.grades {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--space-1);
	}

	.grades button {
		height: var(--field-height);
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-bold);
	}

	.grades .pressed {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.clock {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.clock p {
		font-size: var(--font-size-72);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-number);
		letter-spacing: var(--letter-spacing-display);
		font-variant-numeric: tabular-nums;
	}

	.pace {
		margin-top: calc(-1 * var(--space-3));
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.logged li {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		min-height: var(--control-height);
		border-top: var(--border-hairline) solid var(--color-divider);
		font-size: var(--font-size-17);
		font-variant-numeric: tabular-nums;
	}

	.number {
		width: var(--space-5);
		color: var(--color-text-muted);
	}

	.text {
		flex: 1;
	}

	.logged button {
		width: var(--tap-target);
		height: var(--tap-target);
		margin-right: calc(-1 * var(--space-3));
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		--icon-size: var(--icon-size-small);
	}

	.done {
		display: flex;
		flex-direction: column;
		margin-top: calc(-1 * var(--space-3));
	}
</style>
