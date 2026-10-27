import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { messages } from '../i18n/messages.en.ts';
import NumberPad from './NumberPad.svelte';
import type { NumberPadLimits } from './number-pad.ts';

const weight: NumberPadLimits = { allowDecimal: true, maxIntegerDigits: 3, maxFractionDigits: 1 };

function renderPad(initial: string, limits = weight) {
	const state = $state({ value: initial });
	render(NumberPad, {
		props: {
			get value() {
				return state.value;
			},
			set value(next) {
				state.value = next;
			},
			limits
		}
	});
	return state;
}

describe('NumberPad', () => {
	it('builds a decimal number from key presses', async () => {
		const state = renderPad('');
		const user = userEvent.setup();

		await user.click(screen.getByRole('button', { name: '8' }));
		await user.click(screen.getByRole('button', { name: '0' }));
		await user.click(screen.getByRole('button', { name: messages.design.decimalSeparator }));
		await user.click(screen.getByRole('button', { name: '4' }));

		expect(state.value).toBe('80.4');
	});

	it('deletes the last digit', async () => {
		const state = renderPad('80.4');

		await userEvent.click(screen.getByRole('button', { name: messages.design.deleteDigit }));

		expect(state.value).toBe('80.');
	});

	it('has no decimal key for whole numbers', () => {
		renderPad('', { allowDecimal: false, maxIntegerDigits: 3, maxFractionDigits: 0 });

		expect(
			screen.queryByRole('button', { name: messages.design.decimalSeparator })
		).not.toBeInTheDocument();
	});
});
