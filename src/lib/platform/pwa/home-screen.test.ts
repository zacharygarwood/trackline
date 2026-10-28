import { describe, expect, it } from 'vitest';
import { canAddToHomeScreen } from './home-screen.ts';

describe('canAddToHomeScreen', () => {
	it('is true in Safari on iOS before the app is installed', () => {
		expect(canAddToHomeScreen({ standalone: false })).toBe(true);
	});

	it('is false once opened from the home screen', () => {
		expect(canAddToHomeScreen({ standalone: true })).toBe(false);
	});

	it('is false in browsers that install apps their own way', () => {
		expect(canAddToHomeScreen({})).toBe(false);
	});
});
