import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import StepperField from './StepperField.svelte';

function renderField() {
	const state = $state({ text: '', steps: 0 });
	render(StepperField, {
		props: {
			label: 'kg',
			get value() {
				return state.text;
			},
			lessLabel: 'Less weight',
			moreLabel: 'More weight',
			oninput: (text: string) => {
				state.text = text;
			},
			onstep: () => {
				state.steps += 1;
			}
		}
	});
	return state;
}

describe('StepperField', () => {
	it('accepts a decimal typed one key at a time', async () => {
		const state = renderField();
		const user = userEvent.setup();

		await user.type(screen.getByLabelText('kg'), '72.5');

		expect(state.text).toBe('72.5');
	});

	it('accepts a decimal comma', async () => {
		const state = renderField();
		const user = userEvent.setup();

		await user.type(screen.getByLabelText('kg'), '72,5');

		expect(state.text).toBe('72,5');
	});
});
