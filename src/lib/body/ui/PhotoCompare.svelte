<script lang="ts">
	import SegmentedControl from '../../design/SegmentedControl.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { CompareMode } from './compare-mode.constants.ts';

	/** One side of the comparison. */
	interface ComparedPhoto {
		readonly url: string;
		readonly label: string;
		readonly width: number;
		readonly height: number;
	}

	/** Props for comparing two photos of the same pose. */
	interface Props {
		/** The older photo. */
		before: ComparedPhoto;
		/** The newer photo. */
		after: ComparedPhoto;
	}

	const { before, after }: Props = $props();

	const HALF_WAY = 50;
	const ALL_THE_WAY = 100;

	let mode: CompareMode = $state(CompareMode.sideBySide);
	let position = $state(HALF_WAY);
	const clipId = $props.id();
	const modes = [
		{ value: CompareMode.sideBySide, label: messages.body.sideBySide },
		{ value: CompareMode.slider, label: messages.body.slider }
	] as const;
	const dividerX = $derived((before.width * position) / ALL_THE_WAY);
	const summary = $derived(messages.body.comparison(before.label, after.label));
</script>

<SegmentedControl label={messages.body.compareMode} options={modes} bind:value={mode} />

{#if mode === CompareMode.sideBySide}
	<div class="side-by-side">
		{#each [before, after] as photo (photo.label)}
			<figure>
				<img src={photo.url} alt={photo.label} />
				<figcaption>{photo.label}</figcaption>
			</figure>
		{/each}
	</div>
{:else}
	<figure>
		<svg viewBox="0 0 {before.width} {before.height}" role="img" aria-label={summary}>
			<defs>
				<clipPath id={clipId}>
					<rect x="0" y="0" width={dividerX} height={before.height} />
				</clipPath>
			</defs>
			<image
				href={after.url}
				width={before.width}
				height={before.height}
				preserveAspectRatio="xMidYMid slice"
			/>
			<image
				href={before.url}
				width={before.width}
				height={before.height}
				preserveAspectRatio="xMidYMid slice"
				clip-path="url(#{clipId})"
			/>
			<line class="divider" x1={dividerX} x2={dividerX} y1="0" y2={before.height} />
		</svg>
		<figcaption>
			<span>{before.label}</span>
			<span>{after.label}</span>
		</figcaption>
	</figure>
	<input
		type="range"
		min="0"
		max={ALL_THE_WAY}
		bind:value={position}
		aria-label={messages.body.comparePosition}
	/>
{/if}

<style>
	.side-by-side {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	figure {
		margin: 0;
	}

	img,
	svg {
		display: block;
		width: 100%;
		border-radius: var(--radius-medium);
	}

	img {
		aspect-ratio: 3 / 4;
		object-fit: cover;
	}

	svg {
		height: auto;
	}

	.divider {
		stroke: var(--color-background);
		stroke-width: var(--focus-ring-width);
		vector-effect: non-scaling-stroke;
	}

	figcaption {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	input[type='range'] {
		width: 100%;
		min-height: var(--tap-target);
		accent-color: var(--color-accent);
	}
</style>
