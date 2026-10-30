<script lang="ts">
	import type { Snippet } from 'svelte';
	import { messages } from '../i18n/messages.en.ts';
	import Icon from './Icon.svelte';

	/** Props for a bottom sheet used for quick entry. */
	interface Props {
		/** Whether the sheet is showing; bind to it. Closing sets it to false. */
		open: boolean;
		/** The sheet's heading, for example "Weigh in". */
		title: string;
		/** The sheet's content. */
		children: Snippet;
	}

	let { open = $bindable(), title, children }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	const titleId = $props.id();

	$effect(() => {
		if (dialog === undefined || dialog.open === open) return;
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function closeOnBackdrop(event: MouseEvent & { currentTarget: HTMLDialogElement }): void {
		if (event.target === event.currentTarget) open = false;
	}
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={titleId}
	onclose={() => (open = false)}
	onclick={closeOnBackdrop}
>
	<div class="panel">
		<header>
			<h2 id={titleId}>{title}</h2>
			<button type="button" aria-label={messages.design.close} onclick={() => (open = false)}>
				<Icon name="close" />
			</button>
		</header>
		{@render children()}
	</div>
</dialog>

<style>
	dialog {
		width: 100%;
		max-width: var(--content-max-width);
		max-height: 90dvh;
		margin: auto auto 0;
		padding: 0;
		border: none;
		border-top: var(--border-hairline) solid var(--color-divider);
		background: var(--color-background);
		color: var(--color-text);
		overscroll-behavior: contain;
	}

	dialog[open] {
		animation: slide-up var(--duration-sheet) ease-out;
	}

	dialog::backdrop {
		background: var(--color-backdrop);
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-4) var(--gutter) calc(var(--space-4) + env(safe-area-inset-bottom));
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h2 {
		font-size: var(--font-size-22);
	}

	header button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		margin-right: calc(var(--space-3) * -1);
		border: none;
		background: transparent;
		cursor: pointer;
	}

	@keyframes slide-up {
		from {
			transform: translateY(100%);
		}
	}
</style>
