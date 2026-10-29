<script lang="ts">
	import Card from '../../design/Card.svelte';
	import Row from '../../design/Row.svelte';
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

<Card title={messages.body.history}>
	{#each weighIns as weighIn (weighIn.id)}
		{@const date = formatDate(weighIn.date, today)}
		{@const weight = formatMass(weighIn.weight, unit)}
		<Row
			label={date}
			value={weight}
			ariaLabel={messages.body.editWeighIn(date, weight)}
			onclick={() => {
				onselect(weighIn);
			}}
		/>
	{/each}
</Card>
