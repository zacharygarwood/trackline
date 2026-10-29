import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import NumberField from './NumberField.svelte';

function renderField(initial: number) {
	const state = $state({ value: initial });
	render(NumberField, {
		props: {
			label: 'Reps',
			get value() {
				return state.value;
			},
			set value(next) {
				state.value = next;
			},
			range: { min: 1, max: 999, step: 1 }
		}
	});
	return state;
}

describe('NumberField', () => {
	it('accepts a typed value', async () => {
		const state = renderField(5);
		const user = userEvent.setup();
		const input = screen.getByRole('textbox', { name: 'Reps' });

		await user.clear(input);
		await user.type(input, '12');
		await user.tab();

		expect(state.value).toBe(12);
	});

	it('restores the value when the typed text is not a number', async () => {
		const state = renderField(5);
		const user = userEvent.setup();
		const input = screen.getByRole('textbox', { name: 'Reps' });

		await user.clear(input);
		await user.type(input, 'abc');
		await user.tab();

		expect(state.value).toBe(5);
		expect(input).toHaveValue('5');
	});

	it('uses the numeric keyboard for whole-number steps', () => {
		renderField(5);

		expect(screen.getByRole('textbox', { name: 'Reps' })).toHaveAttribute('inputmode', 'numeric');
	});
});
