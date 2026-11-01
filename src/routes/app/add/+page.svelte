<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { Template } from '#lib/tracking/domain/template.ts';
	import { BASICS } from '#lib/tracking/domain/basics.ts';
	import { TemplateGroup } from '#lib/tracking/domain/template.constants.ts';
	import { TEMPLATE_SECTIONS } from '#lib/tracking/ui/template-groups.ts';
	import TemplateRow from '#lib/tracking/ui/TemplateRow.svelte';
	import { templatePick } from '#lib/tracking/ui/template-text.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { back, open, replace } from '../open.ts';

	const toaster = getToaster();
	const basicsId = `group-${TemplateGroup.basic}`;
	let app: App | undefined = $state();

	void getAppContext().then((ready) => (app = ready));

	async function add(ready: App, template: Template): Promise<void> {
		const added = await ready.tracking.addTrackers.execute({ picks: [templatePick(template)] });
		const tracker = added.ok ? added.value.at(0) : undefined;
		if (tracker === undefined) return;
		toaster.show(messages.tracking.add.added(tracker.name));
		await replace(AppRoute.tracker, { tracker: tracker.id });
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.settingsTrackers)}
	backLabel={messages.shell.back(messages.navigation.trackers)}
	title={messages.tracking.add.title}
	onback={back}
/>

{#if app !== undefined}
	{@const ready = app}
	<SectionTitle title={messages.tracking.groups.basic} id={basicsId} />
	<ul aria-labelledby={basicsId}>
		{#each BASICS as template (template.key)}
			<li>
				<TemplateRow
					{template}
					onclick={() => open(AppRoute.nameTracker, { template: template.key })}
				/>
			</li>
		{/each}
	</ul>
	{#each TEMPLATE_SECTIONS as section (section.group)}
		{@const id = `group-${section.group}`}
		<SectionTitle title={messages.tracking.groups[section.group]} {id} />
		<ul aria-labelledby={id}>
			{#each section.templates as template (template.key)}
				<li><TemplateRow {template} onclick={() => add(ready, template)} /></li>
			{/each}
		</ul>
	{/each}
{/if}
