<script lang="ts">
	import { messages } from '../i18n/messages.en.ts';

	/** Props for the accent bar that leads back to the workout in progress. */
	interface Props {
		/** The workout's name. */
		name: string;
		/** How long it has run, as a clock. */
		elapsed: string;
		/** The workout screen. */
		href: string;
		/** Runs instead of following the link, to open the screen with page state. */
		onclick?: ((event: MouseEvent) => void) | undefined;
	}

	const { name, elapsed, href, onclick }: Props = $props();
</script>

<a {href} {onclick} aria-label={messages.shell.resume(name, elapsed)}>
	<span>{name}</span>
	<span class="time">{messages.shell.resumeTime(elapsed)}</span>
</a>

<style>
	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--button-height);
		margin: 0 calc(-1 * var(--gutter));
		padding: 0 var(--gutter);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	.time {
		font-variant-numeric: tabular-nums;
	}
</style>
