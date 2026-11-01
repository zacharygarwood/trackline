import { describe, expect, it } from 'vitest';
import { aField, aNumberField } from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { createField } from './field.ts';
import { servingsFieldOf } from './portion.ts';

describe('servingsFieldOf', () => {
	it('is the first number field', () => {
		const fields = [aField(), aNumberField({ key: 'servings' }), aNumberField({ key: 'kcal' })].map(
			(draft) => expectOk(createField(draft))
		);

		expect(servingsFieldOf(fields)?.key).toBe('servings');
		expect(servingsFieldOf([])).toBeUndefined();
	});
});
