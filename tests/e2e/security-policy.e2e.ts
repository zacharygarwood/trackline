import { expect, test } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';

test('the landing page shows the app name', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.app.name);
});

test('the landing page ships a strict Content Security Policy', async ({ page }) => {
	await page.goto('/');

	const policy = await page
		.locator('meta[http-equiv="content-security-policy"]')
		.getAttribute('content');

	expect(policy).toContain("default-src 'self'");
	expect(policy).toContain("connect-src 'self'");
	expect(policy).not.toContain('unsafe-inline');
});

test('the landing page loads without Content Security Policy violations', async ({ page }) => {
	const violations: string[] = [];
	page.on('console', (message) => {
		if (message.text().includes('Content Security Policy')) violations.push(message.text());
	});

	await page.goto('/');
	await page.waitForLoadState('networkidle');

	expect(violations).toEqual([]);
});
