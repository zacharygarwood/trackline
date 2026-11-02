<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Row from '#lib/design/Row.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import StepButton from '#lib/design/StepButton.svelte';
	import TextField from '#lib/design/TextField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { RecipeEditor } from '#lib/tracking/ui/recipe-editor.svelte.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { back, backTwice, replace } from '../open.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = { mass: preferences.massUnit, distance: preferences.current.distanceUnit };
	const MORE = 1;
	const LESS = -1;
	const { recipe: text, library } = messages.tracking;
	let editor: RecipeEditor | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new RecipeEditor(app.tracking, units);
		if (!(await next.load({ tracker: page.state.tracker, subject: page.state.subject }))) {
			await replace(AppRoute.today);
			return;
		}
		editor = next;
	});

	async function save(ready: RecipeEditor): Promise<void> {
		if ((await ready.save()) === undefined) return;
		back();
	}

	async function archive(ready: RecipeEditor): Promise<void> {
		const name = ready.recipe?.name ?? '';
		await ready.archive();
		toaster.show(library.deleted(name));
		backTwice();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(editor?.tracker?.name ?? messages.navigation.home)}
	title={editor?.recipe?.name ?? library.newRecipe}
	onback={back}
/>

{#if editor?.tracker !== undefined}
	{@const ready = editor}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			void save(ready);
		}}
	>
		<TextField label={library.name} bind:value={ready.name} />
		<TextField label={text.makes} bind:value={ready.makes} />

		<SectionTitle title={text.ingredients} />
		{#if ready.lines.length === 0}
			<p class="empty">{text.noIngredients}</p>
		{/if}
		<ul>
			{#each ready.lines as line (line.food.id)}
				<li>
					<Row label={line.food.name} detail={text.servings(line.servings)}>
						{#snippet end()}
							<div class="steps">
								<StepButton
									label={text.less(line.food.name)}
									symbol="−"
									onclick={() => {
										ready.step(line.food.id, LESS);
									}}
								/>
								<StepButton
									label={text.more(line.food.name)}
									symbol="+"
									onclick={() => {
										ready.step(line.food.id, MORE);
									}}
								/>
							</div>
						{/snippet}
					</Row>
				</li>
			{/each}
		</ul>
		<SearchField label={text.addIngredient} bind:value={ready.search} />
		<ul>
			{#each ready.matches as food (food.id)}
				<li>
					<NavRow
						label={food.name}
						onclick={() => {
							ready.add(food);
						}}
					/>
				</li>
			{/each}
		</ul>

		{#if ready.perServing.length > 0}
			<SectionTitle title={library.perServing} />
			<ul>
				{#each ready.perServing as line (line.key)}
					<li><Row label={line.label} value={line.value} /></li>
				{/each}
			</ul>
		{/if}

		{#if ready.problem !== undefined}
			<p class="problem" role="alert">{ready.problem}</p>
		{/if}
		<div class="actions">
			<Button type="submit">{library.save}</Button>
			{#if ready.recipe !== undefined}
				<Button variant={ButtonVariant.quiet} onclick={() => archive(ready)}
					>{library.delete}</Button
				>
			{/if}
		</div>
	</form>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	.steps {
		display: flex;
		gap: var(--space-2);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.problem {
		margin-top: var(--space-4);
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-8);
	}
</style>
