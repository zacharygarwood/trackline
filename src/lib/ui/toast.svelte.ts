import { createContext } from 'svelte';

/** How long a toast stays up, in milliseconds. */
const TOAST_MILLISECONDS = 5000;

/** A short confirmation shown above the tab bar, optionally with an Undo. */
export interface Toast {
	readonly text: string;
	readonly undo: (() => Promise<void> | void) | undefined;
}

/** Shows one toast at a time and remembers what screen readers should hear. */
export class Toaster {
	current: Toast | undefined = $state();
	/** The latest announcement for the polite live region. */
	announcement = $state('');
	/** How many undos have run; a screen showing data an undo may change reloads when it grows. */
	undoCount = $state(0);
	private timer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Shows a toast, replacing any other, for five seconds.
	 *
	 * @param text - What happened, for example "Banana added".
	 * @param undo - Reverses it, if it can be undone.
	 */
	show(text: string, undo?: () => Promise<void> | void): void {
		clearTimeout(this.timer);
		this.current = { text, undo };
		this.announcement = text;
		this.timer = setTimeout(() => (this.current = undefined), TOAST_MILLISECONDS);
	}

	/**
	 * Says something to screen readers without a toast.
	 *
	 * @param text - The announcement.
	 */
	announce(text: string): void {
		this.announcement = text;
	}

	/**
	 * Runs the current toast's undo and closes it.
	 *
	 * @param undone - What to announce afterwards.
	 */
	async undo(undone: string): Promise<void> {
		const undo = this.current?.undo;
		clearTimeout(this.timer);
		this.current = undefined;
		this.announcement = undone;
		await undo?.();
		this.undoCount += 1;
	}
}

/**
 * Reloads a screen's data whenever an undo runs while it is shown, such as
 * undoing an add made on a page that has since closed. Call while a component
 * is being set up.
 *
 * @param toaster - The app's toaster.
 * @param reload - Loads the screen's data again.
 */
export function reloadOnUndo(toaster: Toaster, reload: () => Promise<void> | undefined): void {
	let seen = toaster.undoCount;
	$effect(() => {
		if (toaster.undoCount === seen) return;
		seen = toaster.undoCount;
		void reload();
	});
}

/** Shares the app's one toaster with every screen. */
export const [getToaster, setToaster] = createContext<Toaster>();
