import { describe, expect, it, vi } from 'vitest';
import { Toaster } from './toast.svelte.ts';

describe('Toaster', () => {
	it('runs the undo, closes the toast, and counts it so other screens can reload', async () => {
		const toaster = new Toaster();
		const undo = vi.fn();
		toaster.show('Oats added', undo);

		await toaster.undo('Undone');

		expect(undo).toHaveBeenCalledOnce();
		expect(toaster.current).toBeUndefined();
		expect(toaster.announcement).toBe('Undone');
		expect(toaster.undoCount).toBe(1);
	});
});
