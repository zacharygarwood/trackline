<script lang="ts">
	import Icon from '../../design/Icon.svelte';
	import { numberText, numberValue } from '../../design/number-text.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import type { CheckIn, CheckInResult } from './check-in.svelte.ts';

	/** Props for today's check-in: a big weight field, a photo tile, and the save button. */
	interface Props {
		checkIn: CheckIn;
		/** The weight unit's label, such as "lb". */
		unit: string;
		onsaved: (result: CheckInResult) => void;
	}

	const { checkIn, unit, onsaved }: Props = $props();
	let preview: string | undefined = $state();
	const UP = 1;
	const DOWN = -1;

	async function choose(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
		const input = event.currentTarget;
		const file = input.files?.item(0);
		input.value = '';
		if (file === null || file === undefined) return;
		checkIn.photo = new Uint8Array(await file.arrayBuffer());
		if (preview !== undefined) URL.revokeObjectURL(preview);
		preview = URL.createObjectURL(file);
	}

	async function save(): Promise<void> {
		const result = await checkIn.save();
		if (result === undefined) return;
		if (preview !== undefined) URL.revokeObjectURL(preview);
		preview = undefined;
		onsaved(result);
	}
</script>

<section class="check-in" aria-label={messages.checkIn.checkIn}>
	<label for="check-in-weight">{messages.checkIn.weightIn(unit)}</label>
	<div class="weight">
		<input
			id="check-in-weight"
			type="number"
			inputmode="decimal"
			step="0.1"
			min="0"
			aria-invalid={checkIn.problem !== undefined}
			aria-describedby="check-in-problem"
			bind:value={
				() => numberValue(checkIn.weight),
				(typed: number | null) => (checkIn.weight = numberText(typed))
			}
			oninput={() => (checkIn.problem = undefined)}
			onfocus={(event) => {
				event.currentTarget.select();
			}}
		/>
		<div class="steps">
			<button
				type="button"
				aria-label={messages.checkIn.tenthMore}
				onclick={() => {
					checkIn.step(UP);
				}}><Icon name="plus" /></button
			>
			<button
				type="button"
				aria-label={messages.checkIn.tenthLess}
				onclick={() => {
					checkIn.step(DOWN);
				}}><Icon name="minus" /></button
			>
		</div>
	</div>
	<p id="check-in-problem" class="problem">{checkIn.problem ?? ''}</p>
	<div class="actions">
		<label class="tile">
			{#if preview === undefined}
				<Icon name="camera" />
			{:else}
				<img src={preview} alt="" />
			{/if}
			<input
				type="file"
				accept="image/*"
				capture="environment"
				aria-label={preview === undefined
					? messages.checkIn.takePhoto
					: messages.checkIn.changePhoto}
				onchange={choose}
			/>
		</label>
		<button type="button" class="save" onclick={save}
			>{checkIn.todays === undefined ? messages.checkIn.checkIn : messages.checkIn.update}</button
		>
	</div>
</section>

<style>
	.check-in {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-7);
	}

	label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.weight {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	#check-in-weight {
		flex: 1;
		min-width: 0;
		height: var(--weight-entry-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-56);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-display);
		font-variant-numeric: tabular-nums;
	}

	#check-in-weight:focus-visible {
		border-bottom-color: var(--color-text);
	}

	.steps {
		display: flex;
		flex-direction: column;
	}

	.steps button {
		width: var(--field-height);
		height: var(--tap-target);
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		--icon-size: var(--icon-size-medium);
	}

	.steps button + button {
		margin-top: calc(-1 * var(--border-control));
	}

	.problem {
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	.tile {
		position: relative;
		display: grid;
		flex: none;
		place-items: center;
		width: var(--photo-tile);
		height: var(--photo-tile);
		overflow: hidden;
		border: var(--border-control) solid var(--color-edge);
		color: var(--color-text);
		cursor: pointer;
		--icon-size: var(--space-7);
	}

	.tile:focus-within {
		outline: var(--focus-ring-width) solid var(--color-text);
		outline-offset: var(--focus-ring-width);
	}

	.tile img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.tile input {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.save {
		flex: 1;
		height: var(--photo-tile);
		border: none;
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
