<script lang="ts">
	import { page } from '$app/state';
	import RecipeForm from '../RecipeForm.svelte';
	import SubjectForm from '../SubjectForm.svelte';
</script>

{#if page.state.recipe === true}
	<RecipeForm />
{:else}
	<SubjectForm />
{/if}
