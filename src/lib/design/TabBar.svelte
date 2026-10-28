<script lang="ts">
	import { ARIA_CURRENT_PAGE } from './html.constants.ts';
	import Icon from './Icon.svelte';
	import type { IconName } from './icon.constants.ts';

	/** One destination in the tab bar. */
	interface Tab {
		readonly href: string;
		readonly label: string;
		readonly icon: IconName;
	}

	/** Props for the bottom navigation bar. */
	interface Props {
		/** The tabs, in display order. */
		tabs: readonly Tab[];
		/** The `href` of the tab being shown, if any. */
		currentHref: string | undefined;
		/** The navigation landmark's accessible name. */
		label: string;
	}

	const { tabs, currentHref, label }: Props = $props();
</script>

<nav aria-label={label}>
	<ul>
		{#each tabs as tab (tab.href)}
			<li>
				<a href={tab.href} aria-current={tab.href === currentHref ? ARIA_CURRENT_PAGE : undefined}>
					<span class="pill"><Icon name={tab.icon} /></span>
					<span>{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		border-top: var(--border-hairline) solid var(--color-divider);
		background: var(--color-card);
		padding-bottom: env(safe-area-inset-bottom);
	}

	ul {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		flex: 1;
	}

	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		min-height: var(--tap-target);
		padding: var(--space-2) var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		text-decoration: none;
		user-select: none;
	}

	.pill {
		display: grid;
		place-items: center;
		width: var(--space-12);
		height: var(--space-8);
		border-radius: var(--radius-round);
		transition: background var(--duration-quick);
	}

	a[aria-current='page'] {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	a[aria-current='page'] .pill {
		background: var(--color-accent-soft);
	}
</style>
