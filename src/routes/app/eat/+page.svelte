<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '#lib/design/Button.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { AppRoute } from '../app-route.constants.ts';
</script>

<PageHeader title={messages.navigation.eat} />

<div class="action">
	<Button onclick={() => goto(resolve(AppRoute.addFood))}>{messages.navigation.addFood}</Button>
</div>

<div class="rows">
	<NavRow label={messages.navigation.today} href={resolve(AppRoute.eaten)} />
	<NavRow label={messages.navigation.pastDays} href={resolve(AppRoute.pastDays)} />
	<NavRow label={messages.navigation.myFoods} href={resolve(AppRoute.myFoods)} />
</div>

<style>
	.action {
		display: grid;
	}

	.rows {
		margin-top: var(--space-6);
	}
</style>
