<script lang="ts">
	import { asset } from '$app/paths';
	import type { ScreenshotFile } from './screenshot.constants.ts';

	/** One screenshot with its description. */
	interface Shot {
		readonly file: ScreenshotFile;
		readonly alt: string;
	}

	/** Props for the two phone screenshots at the top of a site page. */
	interface Props {
		shots: readonly Shot[];
	}

	const SCREENSHOT_WIDTH = 1082;
	const SCREENSHOT_HEIGHT = 2202;

	const { shots }: Props = $props();
</script>

<div class="phones">
	{#each shots as shot (shot.file)}
		<img
			src={asset(shot.file)}
			alt={shot.alt}
			width={SCREENSHOT_WIDTH}
			height={SCREENSHOT_HEIGHT}
		/>
	{/each}
</div>

<style>
	.phones {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		border: var(--border-hairline) solid var(--color-divider);
	}
</style>
