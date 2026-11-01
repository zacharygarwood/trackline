<script lang="ts">
	import { goto, onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setAppContext } from '#lib/app/app-context.ts';
	import { startApp, type App } from '#lib/app/container.ts';
	import Icon from '#lib/design/Icon.svelte';
	import Notice from '#lib/design/Notice.svelte';
	import TabBar from '#lib/design/TabBar.svelte';
	import Toast from '#lib/design/Toast.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { watchForUpdates } from '#lib/platform/pwa/app-updates.ts';
	import { canAddToHomeScreen } from '#lib/platform/pwa/home-screen.ts';
	import { AppPreferences, setPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { formatShortDate } from '#lib/ui/format.ts';
	import { setToaster, Toaster } from '#lib/ui/toast.svelte.ts';
	import type { LayoutProps } from './$types';
	import {
		HOME_SECTION,
		SCREEN_SECTIONS,
		SETTINGS_SECTION,
		TAB_SECTIONS,
		WELCOME_SECTION
	} from './navigation.constants.ts';

	const { children }: LayoutProps = $props();

	const preferences = new AppPreferences();
	const toaster = new Toaster();
	setPreferences(preferences);
	setToaster(toaster);

	let storageFailed = $state(false);
	let applyUpdate: (() => void) | undefined = $state();
	let installHint: (() => Promise<void>) | undefined = $state();
	let today: LocalDate | undefined = $state();

	const homeHref = resolve(HOME_SECTION.route);
	const settingsHref = resolve(SETTINGS_SECTION.route);
	const welcomeHref = resolve(WELCOME_SECTION.route);
	const onWelcome = $derived(page.url.pathname === welcomeHref);
	const onHome = $derived(page.url.pathname === homeHref);

	const tabs = TAB_SECTIONS.map((section) => ({
		href: resolve(section.route),
		label: section.title,
		icon: section.icon
	}));
	const section = $derived(
		[...TAB_SECTIONS, ...SCREEN_SECTIONS, SETTINGS_SECTION, WELCOME_SECTION].find(
			(candidate) => candidate.route === page.route.id
		)
	);
	const title = $derived(section?.title);
	const currentHref = $derived(section?.tab === undefined ? undefined : resolve(section.tab));
	const heading = $derived(onHome && today !== undefined ? formatShortDate(today) : title);

	$effect(() => {
		document.documentElement.dataset.theme = preferences.current.theme;
	});

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
			today = app.clock.today();
			await preferences.load(app.settings);
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
	{#if onHome}
		<header>
			<h1>{heading}</h1>
			<a href={settingsHref} aria-label={messages.navigation.settings}>
				<Icon name="settings" />
			</a>
		</header>
	{/if}

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

	<main class:headless={!onHome}>
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

	{#if toaster.current !== undefined}
		{@const toast = toaster.current}
		<div class="toast">
			<Toast
				text={toast.text}
				undo={toast.undo === undefined ? undefined : messages.shell.undo}
				onundo={() => toaster.undo(messages.shell.undone)}
			/>
		</div>
	{/if}

	<div class="visually-hidden" role="status" aria-live="polite">{toaster.announcement}</div>
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
		margin-bottom: var(--space-3);
		padding: calc(var(--space-11) + env(safe-area-inset-top)) var(--space-2) 0 var(--gutter);
		view-transition-name: header;
	}

	h1 {
		color: var(--color-text-muted);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-medium);
	}

	header a {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		color: var(--color-text);
		view-transition-name: header-action;
		--icon-size: var(--icon-size-header);
	}

	.alert {
		margin: 0 var(--gutter);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
	}

	main {
		flex: 1;
		padding: 0 var(--gutter) var(--space-12);
	}

	main.headless {
		padding-top: calc(var(--space-11) + env(safe-area-inset-top));
	}

	.tab-bar {
		position: sticky;
		bottom: 0;
		z-index: 1;
		view-transition-name: tab-bar;
	}

	.toast {
		position: sticky;
		bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
		z-index: 2;
	}

	.notice {
		margin: var(--space-4) var(--gutter);
	}

	.update {
		position: sticky;
		bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
		z-index: 1;
		margin: var(--space-2) var(--gutter);
	}
</style>
