import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SegmentedControl from './SegmentedControl.svelte';

const options = [
	{ value: 'kg', label: 'Kilograms' },
	{ value: 'lb', label: 'Pounds' }
] as const;

describe('SegmentedControl', () => {
	it('shows the chosen option as checked', () => {
		render(SegmentedControl, { props: { label: 'Units', options, value: 'kg' } });

		expect(screen.getByRole('radio', { name: 'Kilograms' })).toBeChecked();
		expect(screen.getByRole('group', { name: 'Units' })).toBeInTheDocument();
	});

	it('reports a new choice', async () => {
		const onchange = vi.fn();
		render(SegmentedControl, { props: { label: 'Units', options, value: 'kg', onchange } });

		await userEvent.click(screen.getByRole('radio', { name: 'Pounds' }));

		expect(onchange).toHaveBeenCalledWith('lb');
	});
});
