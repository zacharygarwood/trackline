<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import type { LocalDate } from '../../shared/local-date.ts';
	import type { MassUnit } from '../../shared/mass-unit.constants.ts';
	import { formatDate, formatMass } from '../../ui/format.ts';
	import type { WeighIn } from '../domain/weigh-in.ts';

	/** Props for the list of past weigh-ins. */
	interface Props {
		/** Weigh-ins, newest first. */
		weighIns: readonly WeighIn[];
		/** The unit to show weights in. */
		unit: MassUnit;
		/** Today, for "Today" and "Yesterday" labels. */
		today: LocalDate;
		/** Called when the user taps a weigh-in to edit it. */
		onselect: (weighIn: WeighIn) => void;
	}

	const { weighIns, unit, today, onselect }: Props = $props();
</script>

<section>
	<h2>{messages.body.history}</h2>
	<ul>
		{#each weighIns as weighIn (weighIn.id)}
			{@const date = formatDate(weighIn.date, today)}
			{@const weight = formatMass(weighIn.weight, unit)}
			<li>
				<button
					type="button"
					aria-label={messages.body.editWeighIn(date, weight)}
					onclick={() => {
						onselect(weighIn);
					}}
				>
					<span>{date}</span>
					<span class="weight">{weight}</span>
				</button>
			</li>
		{/each}
	</ul>
</section>

<style>
	h2 {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-body);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li + li {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	button {
		display: flex;
		justify-content: space-between;
		width: 100%;
		min-height: var(--tap-target);
		padding: var(--space-3) 0;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}

	.weight {
		font-variant-numeric: tabular-nums;
	}
</style>
