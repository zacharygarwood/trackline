<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setAppContext } from '#lib/app/app-context.ts';
	import { startApp, type App } from '#lib/app/container.ts';
	import Icon from '#lib/design/Icon.svelte';
	import TabBar from '#lib/design/TabBar.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LayoutProps } from './$types';
	import { SETTINGS_SECTION, TAB_SECTIONS, WELCOME_SECTION } from './navigation.constants.ts';

	const { children }: LayoutProps = $props();

	let storageFailed = $state(false);

	const tabs = TAB_SECTIONS.map((section) => ({
		href: resolve(section.route),
		label: section.title,
		icon: section.icon
	}));
	const settingsHref = resolve(SETTINGS_SECTION.route);
	const welcomeHref = resolve(WELCOME_SECTION.route);
	const onWelcome = $derived(page.url.pathname === welcomeHref);

	const title = $derived(
		[...TAB_SECTIONS, SETTINGS_SECTION, WELCOME_SECTION].find(
			(section) => resolve(section.route) === page.url.pathname
		)?.title
	);

	/** Sends a new user to the first-run screen before anything else. */
	async function welcomeNewUser(app: App): Promise<void> {
		const setUp = await app.settings.getSetupStatus.execute();
		if (!setUp && page.url.pathname !== welcomeHref) {
			await goto(resolve(WELCOME_SECTION.route), { replaceState: true });
		}
	}

	setAppContext(startApp())
		.then(welcomeNewUser)
		.catch(() => {
			storageFailed = true;
		});
</script>

<svelte:head>
	<title>{messages.pageTitle(title)}</title>
</svelte:head>

<div class="shell">
	<header>
		<h1>{title}</h1>
		{#if !onWelcome}
			<a href={settingsHref} aria-label={messages.navigation.settings}>
				<Icon name="settings" />
			</a>
		{/if}
	</header>

	{#if storageFailed}
		<p class="alert" role="alert">{messages.app.storageUnavailable}</p>
	{/if}

	<main>
		{@render children()}
	</main>

	{#if !onWelcome}
		<div class="tab-bar">
			<TabBar {tabs} currentHref={page.url.pathname} label={messages.navigation.tabs} />
		</div>
	{/if}
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		max-width: var(--content-max-width);
		margin: 0 auto;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(var(--space-2) + env(safe-area-inset-top)) var(--space-4) var(--space-2);
	}

	h1 {
		font-size: var(--font-size-title);
	}

	header a {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		color: var(--color-text-muted);
	}

	.alert {
		margin: 0 var(--space-4);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	main {
		flex: 1;
		padding: 0 var(--space-4);
	}

	.tab-bar {
		position: sticky;
		bottom: 0;
	}
</style>
