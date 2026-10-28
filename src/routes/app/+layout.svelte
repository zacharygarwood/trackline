<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setAppContext } from '#lib/app/app-context.ts';
	import { startApp, type App } from '#lib/app/container.ts';
	import Icon from '#lib/design/Icon.svelte';
	import Notice from '#lib/design/Notice.svelte';
	import TabBar from '#lib/design/TabBar.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { watchForUpdates } from '#lib/platform/pwa/app-updates.ts';
	import { canAddToHomeScreen } from '#lib/platform/pwa/home-screen.ts';
	import { first } from '#lib/shared/collections.ts';
	import type { LayoutProps } from './$types';
	import {
		PHOTOS_SECTION,
		SETTINGS_SECTION,
		TAB_SECTIONS,
		WELCOME_SECTION
	} from './navigation.constants.ts';

	const { children }: LayoutProps = $props();

	let storageFailed = $state(false);
	let applyUpdate: (() => void) | undefined = $state();
	let installHint: (() => Promise<void>) | undefined = $state();

	const tabs = TAB_SECTIONS.map((section) => ({
		href: resolve(section.route),
		label: section.title,
		icon: section.icon
	}));
	const settingsHref = resolve(SETTINGS_SECTION.route);
	const welcomeHref = resolve(WELCOME_SECTION.route);
	const onWelcome = $derived(page.url.pathname === welcomeHref);

	const currentHref = $derived(currentTab(page.url.pathname));

	const title = $derived(
		[...TAB_SECTIONS, PHOTOS_SECTION, SETTINGS_SECTION, WELCOME_SECTION].find(
			(section) => resolve(section.route) === page.url.pathname
		)?.title
	);

	/** The tab a path belongs to: the longest tab path it starts with, so the gallery marks Body. */
	function currentTab(pathname: string): string | undefined {
		return first(
			tabs
				.map((tab) => tab.href)
				.filter((href) => pathname === href || pathname.startsWith(`${href}/`))
				.toSorted((a, b) => b.length - a.length)
		);
	}

	/** Sends a new user to the first-run screen before anything else. */
	async function welcomeNewUser(app: App): Promise<void> {
		const setUp = await app.settings.getSetupStatus.execute();
		if (!setUp && page.url.pathname !== welcomeHref) {
			await goto(resolve(WELCOME_SECTION.route), { replaceState: true });
		}
	}

	/** Offers the Add to Home Screen hint on iPhone until the user dismisses it. */
	async function offerInstallHint(app: App): Promise<void> {
		const show = await app.settings.shouldShowInstallHint.execute({
			canAddToHomeScreen: canAddToHomeScreen(navigator)
		});
		if (show) installHint = () => app.settings.dismissInstallHint.execute();
	}

	if ('serviceWorker' in navigator) {
		void watchForUpdates(
			navigator.serviceWorker,
			(apply) => (applyUpdate = apply),
			() => {
				location.reload();
			}
		);
	}

	onNavigate((navigation) => {
		if (!('startViewTransition' in document)) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	setAppContext(startApp())
		.then(async (app) => {
			await welcomeNewUser(app);
			await offerInstallHint(app);
		})
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

	{#if installHint !== undefined && !onWelcome}
		{@const dismiss = installHint}
		<div class="notice">
			<Notice
				message={messages.app.installHint}
				action={messages.app.dismiss}
				onaction={() => {
					installHint = undefined;
					void dismiss();
				}}
			/>
		</div>
	{/if}

	<main>
		{@render children()}
	</main>

	{#if applyUpdate !== undefined}
		{@const apply = applyUpdate}
		<div class="update">
			<Notice message={messages.app.updateReady} action={messages.app.reload} onaction={apply} />
		</div>
	{/if}

	{#if !onWelcome}
		<div class="tab-bar">
			<TabBar {tabs} {currentHref} label={messages.navigation.tabs} />
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
		view-transition-name: header;
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
		z-index: 1;
		view-transition-name: tab-bar;
	}

	.notice {
		margin: 0 var(--space-4) var(--space-4);
	}

	.update {
		position: sticky;
		bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
		z-index: 1;
		margin: var(--space-2) var(--space-4);
	}
</style>
