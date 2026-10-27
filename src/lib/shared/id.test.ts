import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../tests/support/result.ts';
import { InvalidId, parseId } from './id.ts';

describe('parseId', () => {
	it('accepts a lowercase UUIDv7', () => {
		expect(expectOk(parseId('0192f3a1-7c4e-7b2a-9d3f-1a2b3c4d5e6f'))).toBe(
			'0192f3a1-7c4e-7b2a-9d3f-1a2b3c4d5e6f'
		);
	});

	it.each([
		'0192f3a1-7c4e-4b2a-9d3f-1a2b3c4d5e6f',
		'0192f3a1-7c4e-7b2a-cd3f-1a2b3c4d5e6f',
		'0192F3A1-7C4E-7B2A-9D3F-1A2B3C4D5E6F',
		'not-an-id',
		''
	])('rejects %j', (text) => {
		expect(expectErr(parseId(text))).toBeInstanceOf(InvalidId);
	});
});
