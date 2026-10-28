import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect } from './fixtures.ts';

/** Goes through the first-run screen with the defaults and lands on Today. */
export async function finishFirstRun(page: Page): Promise<void> {
	await page.goto('/app/welcome');
	await page.getByRole('button', { name: messages.welcome.start }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.today);
}

/**
 * Types an entry on the open sheet's number pad.
 *
 * @param page - The page with an open sheet.
 * @param entry - Digits and at most one decimal point, for example "80.4".
 */
export async function typeOnNumberPad(page: Page, entry: string): Promise<void> {
	const sheet = page.getByRole('dialog');
	for (const key of entry) {
		const name = key === '.' ? messages.design.decimalSeparator : key;
		await sheet.getByRole('button', { name, exact: true }).click();
	}
}

/** Records a weigh-in for the current day from the Body tab. */
export async function weighIn(page: Page, entry: string): Promise<void> {
	await page.goto('/app/body');
	await page.getByRole('button', { name: messages.body.weighIn }).click();
	await typeOnNumberPad(page, entry);
	await page.getByRole('dialog').getByRole('button', { name: messages.body.save }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
}
