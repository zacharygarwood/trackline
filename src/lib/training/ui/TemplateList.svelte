<script lang="ts">
	import Card from '../../design/Card.svelte';
	import IconButton from '../../design/IconButton.svelte';
	import Row from '../../design/Row.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { WorkoutTemplateId } from '../domain/ids.ts';
	import type { WorkoutTemplate } from '../domain/workout-template.ts';

	/** Props for the list of templates; tapping one starts a workout from it. */
	interface Props {
		/** Templates in list order. */
		templates: readonly WorkoutTemplate[];
		/** Starts a workout from a template. */
		onstart: (id: WorkoutTemplateId) => void;
		/** Opens a template's rename, move, and delete options. */
		onoptions: (template: WorkoutTemplate) => void;
	}

	const { templates, onstart, onoptions }: Props = $props();
</script>

<Card title={messages.training.templates}>
	{#each templates as template (template.id)}
		<Row
			label={template.name}
			value={messages.training.templateSummary(template.exercises.length)}
			onclick={() => {
				onstart(template.id);
			}}
		>
			{#snippet end()}
				<IconButton
					label={messages.training.templateActions(template.name)}
					icon="more"
					onclick={() => {
						onoptions(template);
					}}
				/>
			{/snippet}
		</Row>
	{/each}
</Card>
