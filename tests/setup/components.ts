import '@testing-library/jest-dom/vitest';

/**
 * jsdom has no modal dialog support. This stand-in opens and closes the
 * dialog and fires `close`, which is all the Sheet relies on.
 * https://github.com/jsdom/jsdom/issues/3294
 */
Object.assign(HTMLDialogElement.prototype, {
	showModal(this: HTMLDialogElement) {
		this.open = true;
	},
	close(this: HTMLDialogElement) {
		this.open = false;
		this.dispatchEvent(new Event('close'));
	}
});
