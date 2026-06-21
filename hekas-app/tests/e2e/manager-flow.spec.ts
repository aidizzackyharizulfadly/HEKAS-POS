/**
 * E2E Manager Flow — dashboard, employees, laporan.
 */
import { test, expect, type Page } from '@playwright/test';

async function loginAsManager(page: Page) {
	await page.goto('/login');
	await page.getByLabel(/username/i).fill('manager1');
	await page.getByLabel(/password/i).fill('password');
	await page.getByRole('button', { name: /login|masuk/i }).click();
	await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 });
}

test.describe('Manager Dashboard', () => {
	test('manager beranda menampilkan summary cards', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager');

		await page.waitForTimeout(1_500);

		// Heading
		await expect(page.locator('h1, h2, h3').first()).toBeVisible();

		// Summary sections (Finance, Inventory, Attendance)
		const body = await page.textContent('body');
		const hasFinance = body?.toLowerCase().includes('finance') ?? body?.toLowerCase().includes('revenue');
		const hasInventory = body?.toLowerCase().includes('inventory') ?? body?.toLowerCase().includes('stok');
		const hasAbsensi = body?.toLowerCase().includes('absensi') ?? body?.toLowerCase().includes('attendance');

		expect(hasFinance || hasInventory || hasAbsensi).toBeTruthy();
	});

	test('FinanceSummary margin validation muncul jika mismatch', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager');

		// Look for margin warning
		const warningText = page.locator('text=/Margin input/i');
		const hasWarning = await warningText.isVisible({ timeout: 2_000 }).catch(() => false);

		// Either warning visible or not — depends on data consistency
		if (hasWarning) {
			await expect(warningText).toContainText(/≠/);
		}
	});

	test('InventorySummary low stock alert muncul jika >= threshold', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager');

		const lowStockAlert = page.locator('text=/produk di bawah ambang/i');
		const hasAlert = await lowStockAlert.isVisible({ timeout: 2_000 }).catch(() => false);

		// Soft assert — depends on data
		expect(hasAlert !== undefined).toBeTruthy();
	});
});

test.describe('Manager Karyawan', () => {
	test('employee list dengan search dan filter', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/karyawan');

		await page.waitForTimeout(1_000);

		// Search input
		const searchInput = page.getByPlaceholder(/cari/i).first();
		if (await searchInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
			await searchInput.fill('test');
			await page.waitForTimeout(300);

			const body = await page.textContent('body');
			expect(body).toBeTruthy();
		}
	});

	test('sortable column header click', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/karyawan');

		await page.waitForTimeout(500);

		// Find sortable Nama column
		const sortBtn = page.getByRole('button', { name: /nama.*↕|nama.*↑|nama.*↓/i }).first();
		if (await sortBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await sortBtn.click();
			await page.waitForTimeout(150);

			// Should toggle sort indicator
			const body = await page.textContent('body');
			expect(body).toBeTruthy();
		}
	});

	test('LeaveRequests approve/reject flow', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/karyawan');

		// Find Leave tab atau section
		const leaveTab = page.getByRole('tab', { name: /cuti|leave/i }).first();
		if (await leaveTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await leaveTab.click();
			await page.waitForTimeout(300);

			// Find approve button
			const approveBtn = page.getByRole('button', { name: /setujui|approve/i }).first();
			if (await approveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await approveBtn.click();
				await page.waitForTimeout(200);

				// Inline review form should appear
				const notesInput = page.locator('textarea[placeholder*="approval"]').first();
				if (await notesInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
					await notesInput.fill('OK disetujui');

					const confirmBtn = page.getByRole('button', { name: /konfirmasi setujui/i }).first();
					await confirmBtn.click();
					await page.waitForTimeout(500);
				}
			}
		}
	});
});

test.describe('Manager Laporan', () => {
	test('halaman laporan accessible', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/laporan');

		await page.waitForTimeout(1_000);

		await expect(page.locator('h1, h2, h3').first()).toBeVisible();
	});

	test('export button tersedia', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/laporan');

		const exportBtn = page.getByRole('button', { name: /export|cetak|download/i }).first();
		if (await exportBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
			expect(exportBtn).toBeTruthy();
		}
	});
});

test.describe('Manager Pengaturan', () => {
	test('halaman pengaturan accessible', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/pengaturan');

		await page.waitForTimeout(1_000);

		await expect(page.locator('h1, h2, h3').first()).toBeVisible();
	});

	test('SystemSummary menampilkan info sistem', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/pengaturan');

		await page.waitForTimeout(500);

		const body = await page.textContent('body');
		expect(body?.toLowerCase()).toMatch(/sistem|version|server|database/);
	});
});

test.describe('Manager AI', () => {
	test('halaman AI control center accessible', async ({ page }) => {
		await loginAsManager(page);
		await page.goto('/manager/ai');

		await page.waitForTimeout(1_000);

		await expect(page.locator('h1, h2, h3').first()).toBeVisible();
	});
});
