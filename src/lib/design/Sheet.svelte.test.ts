import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { messages } from '../i18n/messages.en.ts';
import Sheet from './Sheet.svelte';

function renderSheet(open: boolean) {
	const state = $state({ open });
	render(Sheet, {
		props: {
			get open() {
				return state.open;
			},
			set open(next) {
				state.open = next;
			},
			title: 'Weigh in',
			children: createRawSnippet(() => ({ render: () => '<p>Sheet content</p>' }))
		}
	});
	return state;
}

describe('Sheet', () => {
	it('shows its title and content as a dialog when open', () => {
		renderSheet(true);

		expect(screen.getByRole('dialog', { name: 'Weigh in' })).toBeVisible();
		expect(screen.getByText('Sheet content')).toBeInTheDocument();
	});

	it('stays hidden when closed', () => {
		renderSheet(false);

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('closes from the close button', async () => {
		const state = renderSheet(true);

		await userEvent.click(screen.getByRole('button', { name: messages.design.close }));

		expect(state.open).toBe(false);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});
});
