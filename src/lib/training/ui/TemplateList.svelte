<script lang="ts">
	import Card from '../../design/Card.svelte';
	import EmptyState from '../../design/EmptyState.svelte';
	import Icon from '../../design/Icon.svelte';
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

<Card title={messages.training.templates} flush>
	{#if templates.length === 0}
		<EmptyState message={messages.training.noTemplates} />
	{:else}
		<ul>
			{#each templates as template (template.id)}
				<li>
					<button
						type="button"
						class="start"
						onclick={() => {
							onstart(template.id);
						}}
					>
						<span class="name">{template.name}</span>
						<span class="summary"
							>{messages.training.templateSummary(template.exercises.length)}</span
						>
					</button>
					<button
						type="button"
						class="options"
						aria-label={messages.training.templateActions(template.name)}
						onclick={() => {
							onoptions(template);
						}}
					>
						<Icon name="more" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</Card>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		padding-left: var(--space-4);
	}

	li + li {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	button {
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.start {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		min-height: var(--tap-target);
		padding: var(--space-3) 0;
		text-align: left;
	}

	.summary {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.options {
		display: grid;
		place-items: center;
		width: var(--space-12);
		height: var(--space-12);
		color: var(--color-text-muted);
	}
</style>
