import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { messages } from '../i18n/messages.en.ts';
import Stepper from './Stepper.svelte';

function renderStepper(initial: number) {
	const state = $state({ value: initial });
	render(Stepper, {
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

describe('Stepper', () => {
	it('steps up and down', async () => {
		const state = renderStepper(5);
		const user = userEvent.setup();

		await user.click(screen.getByRole('button', { name: messages.design.increase('Reps') }));
		await user.click(screen.getByRole('button', { name: messages.design.increase('Reps') }));
		await user.click(screen.getByRole('button', { name: messages.design.decrease('Reps') }));

		expect(state.value).toBe(6);
	});

	it('cannot step below the minimum', () => {
		renderStepper(1);

		expect(screen.getByRole('button', { name: messages.design.decrease('Reps') })).toBeDisabled();
	});

	it('accepts a typed value', async () => {
		const state = renderStepper(5);
		const user = userEvent.setup();
		const input = screen.getByRole('textbox', { name: 'Reps' });

		await user.clear(input);
		await user.type(input, '12');
		await user.tab();

		expect(state.value).toBe(12);
	});

	it('restores the value when the typed text is not a number', async () => {
		const state = renderStepper(5);
		const user = userEvent.setup();
		const input = screen.getByRole('textbox', { name: 'Reps' });

		await user.clear(input);
		await user.type(input, 'abc');
		await user.tab();

		expect(state.value).toBe(5);
		expect(input).toHaveValue('5');
	});

	it('uses the numeric keyboard for whole-number steps', () => {
		renderStepper(5);

		expect(screen.getByRole('textbox', { name: 'Reps' })).toHaveAttribute('inputmode', 'numeric');
	});
});
