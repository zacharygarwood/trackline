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
					<span class="glyph"><Icon name={tab.icon} /></span>
					<span>{tab.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		border-top: var(--border-hairline) solid var(--color-divider);
		background: var(--color-background);
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
		justify-content: center;
		gap: var(--tab-gap);
		min-height: calc(var(--tab-bar-height) - var(--border-hairline));
		padding: 0 var(--space-1);
		color: var(--color-text-muted);
		font-size: var(--font-size-12);
		font-weight: var(--font-weight-medium);
		text-decoration: none;
		user-select: none;
	}

	a[aria-current='page'] {
		color: var(--color-text);
		font-weight: var(--font-weight-semibold);
	}

	.glyph {
		display: flex;
	}

	a[aria-current='page'] .glyph {
		color: var(--color-accent);
	}
</style>
