<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icon.constants.ts';
	import { Tone } from './tone.constants.ts';

	/** Props for an icon in a soft colored circle, marking what a section is about. */
	interface Props {
		icon: IconName;
		tone?: Tone;
	}

	const { icon, tone = Tone.accent }: Props = $props();
</script>

<span class="badge {tone}" aria-hidden="true"><Icon name={icon} /></span>

<style>
	.badge {
		display: inline-grid;
		place-items: center;
		flex-shrink: 0;
		width: var(--badge-size);
		height: var(--badge-size);
		border-radius: var(--radius-round);
		--icon-size: 20px;
	}

	.accent {
		background: var(--color-accent-soft);
		color: var(--color-accent);
	}

	.rest {
		background: var(--color-rest-soft);
		color: var(--color-rest);
	}

	.protein,
	.carbs,
	.fat {
		background: var(--color-surface);
	}

	.protein {
		color: var(--color-protein);
	}

	.carbs {
		color: var(--color-carbs);
	}

	.fat {
		color: var(--color-fat);
	}
</style>
