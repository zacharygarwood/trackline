<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import { formatDate } from '../../ui/format.ts';
	import type { WorkoutId } from '../domain/ids.ts';
	import type { FinishedWorkout } from '../domain/workout.ts';
	import type { TrainOverview } from './train-overview.svelte.ts';
	import type { TrainingUnits } from './workout-format.ts';

	/** Props for the latest finished workouts, each opening to its time and exercises. */
	interface Props {
		overview: TrainOverview;
		units: TrainingUnits;
		onsave: (workout: FinishedWorkout) => void;
	}

	const { overview, units, onsave }: Props = $props();
	let open: WorkoutId | undefined = $state();
</script>

<section aria-labelledby="recent-workouts">
	<h2 id="recent-workouts">{messages.trends.recentWorkouts}</h2>
	<ul>
		{#each overview.recent as workout (workout.id)}
			{@const expanded = open === workout.id}
			<li>
				<button
					type="button"
					class="row"
					aria-expanded={expanded}
					onclick={() => (open = expanded ? undefined : workout.id)}
				>
					<span class="name">{overview.nameOf(workout)}</span>
					<span class="when">{formatDate(workout.date, overview.today)}</span>
				</button>
				{#if expanded}
					<div class="details">
						<dl>
							{#each overview.summaryOf(workout, units) as row, position (position)}
								<div>
									<dt>{row.label === '' ? messages.workout.durationLabel : row.label}</dt>
									<dd>{row.value}</dd>
								</div>
							{/each}
						</dl>
						{#if overview.canSave(workout)}
							<button
								type="button"
								class="save"
								onclick={() => {
									onsave(workout);
								}}>{messages.trends.saveToWorkouts}</button
							>
						{/if}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		margin: 0 calc(-1 * var(--gutter));
		padding-top: var(--space-6);
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	h2 {
		padding: 0 var(--gutter) var(--space-3);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	ul {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	li {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--row-height);
		padding: 0 var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		text-align: left;
	}

	.row:hover {
		background: var(--color-hover);
	}

	.name {
		font-size: var(--font-size-18);
	}

	.when {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.details {
		padding: 0 var(--gutter) var(--space-4);
		animation: rise var(--duration-rise) ease-out;
	}

	dl {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
	}

	dl div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		font-size: var(--font-size-15);
	}

	dt {
		color: var(--color-text-muted);
	}

	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.save {
		height: var(--control-height);
		margin-top: var(--gap-14);
		padding: 0 var(--space-4);
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
