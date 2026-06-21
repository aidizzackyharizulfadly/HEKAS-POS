/**
 * Example E2E test — smoke check login page loads.
 * Hapus atau ganti dengan flow sebenarnya.
 */
import { test, expect } from '@playwright/test';

test('login page renders', async ({ page }) => {
	await page.goto('/login');
	await expect(page).toHaveTitle(/HEKAS/i);
});

test('login form has username + password fields', async ({ page }) => {
	await page.goto('/login');
	await expect(page.getByLabel(/username/i)).toBeVisible();
	await expect(page.getByLabel(/password/i)).toBeVisible();
});
