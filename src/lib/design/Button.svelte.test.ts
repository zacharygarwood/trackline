import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button.svelte';

const label = createRawSnippet(() => ({ render: () => '<span>Save</span>' }));

describe('Button', () => {
	it('runs its action when pressed', async () => {
		const onclick = vi.fn();
		render(Button, { props: { onclick, children: label } });

		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(onclick).toHaveBeenCalledOnce();
	});

	it('does nothing while disabled', async () => {
		const onclick = vi.fn();
		render(Button, { props: { onclick, disabled: true, children: label } });

		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(onclick).not.toHaveBeenCalled();
	});

	it('is a plain button, never a form submit, by default', () => {
		render(Button, { props: { children: label } });

		expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
	});
});
