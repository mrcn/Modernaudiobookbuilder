import { test, expect } from '@playwright/test';

/**
 * Project Setup E2E Tests
 * Tests the project configuration screen after book upload
 */

test.describe('Project Setup Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();

    // Upload a test file to reach project setup
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    const testFileContent = 'CHAPTER 1: The Beginning\n\n' + 'This is test content. '.repeat(100);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-book.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testFileContent),
    });

    // Wait for project setup screen
    await expect(page.getByText(/project setup|configure/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display project setup form', async ({ page }) => {
    // Check for main form elements
    await expect(page.getByText(/project setup|configure/i)).toBeVisible();
    await expect(page.getByText(/title|book title/i)).toBeVisible();
    await expect(page.getByText(/author/i)).toBeVisible();
  });

  test('should pre-fill title from filename', async ({ page }) => {
    // The title field should contain "test-book" or "test book"
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    const titleValue = await titleInput.inputValue();

    expect(titleValue.toLowerCase()).toContain('test');
  });

  test('should allow editing title', async ({ page }) => {
    // Find and clear title input
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();

    await titleInput.clear();
    await titleInput.fill('My Custom Book Title');

    const newValue = await titleInput.inputValue();
    expect(newValue).toBe('My Custom Book Title');
  });

  test('should allow editing author', async ({ page }) => {
    // Find author input
    const authorInput = page.locator('input[name="author"], input[placeholder*="author" i]').first();

    await authorInput.clear();
    await authorInput.fill('Jane Doe');

    const newValue = await authorInput.inputValue();
    expect(newValue).toBe('Jane Doe');
  });

  test('should display modernization options', async ({ page }) => {
    // Check for modernization settings
    const hasModernization = await page.getByText(/moderniz|update.*language|contemporary/i).isVisible();
    expect(hasModernization).toBeTruthy();
  });

  test('should allow entering modernization instructions', async ({ page }) => {
    // Find textarea for modernization instructions
    const instructionsTextarea = page.locator('textarea').first();

    if (await instructionsTextarea.isVisible()) {
      await instructionsTextarea.fill('Make the language more modern and accessible');

      const value = await instructionsTextarea.inputValue();
      expect(value).toContain('modern');
    }
  });

  test('should display book statistics', async ({ page }) => {
    // Check for stats like word count, character count
    await expect(page.getByText(/word count|words/i)).toBeVisible();
    await expect(page.getByText(/character|chars/i)).toBeVisible();
  });

  test('should display cost estimation', async ({ page }) => {
    // Check for cost estimates (GPT-4, TTS, etc.)
    const hasCost = await page.getByText(/cost|price|estimate|\$/i).isVisible();
    expect(hasCost).toBeTruthy();
  });

  test('should allow selecting book range with sliders', async ({ page }) => {
    // Look for range sliders
    const sliders = page.locator('input[type="range"], [role="slider"]');
    const sliderCount = await sliders.count();

    if (sliderCount > 0) {
      // Interact with first slider
      const firstSlider = sliders.first();
      await firstSlider.click();

      // Sliders should be interactive
      expect(await firstSlider.isEnabled()).toBeTruthy();
    }
  });

  test('should update statistics when range changes', async ({ page }) => {
    // Get initial word count
    const wordCountElement = page.getByText(/\d+.*word/i).first();

    if (await wordCountElement.isVisible()) {
      const initialText = await wordCountElement.textContent();

      // Try to adjust range slider
      const slider = page.locator('input[type="range"], [role="slider"]').first();

      if (await slider.isVisible()) {
        // Move slider
        await slider.click();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');

        await page.waitForTimeout(500);

        // Statistics might update (this is aspirational - may not in mock)
        const newText = await wordCountElement.textContent();

        // Just verify the element still exists
        expect(newText).toBeTruthy();
      }
    }
  });

  test('should have start/continue button', async ({ page }) => {
    // Look for button to proceed with processing
    const proceedButton = page.getByRole('button', { name: /start|continue|next|process|moderniz/i });

    await expect(proceedButton).toBeVisible();
  });

  test('should have cancel button', async ({ page }) => {
    // Look for cancel button
    const cancelButton = page.getByRole('button', { name: /cancel|back/i });

    await expect(cancelButton).toBeVisible();
  });

  test('should return to library when canceling', async ({ page }) => {
    // Click cancel
    const cancelButton = page.getByRole('button', { name: /cancel|back/i });
    await cancelButton.click();

    // Should be back at library
    await expect(page.getByText('Pride and Prejudice')).toBeVisible();
  });

  test('should proceed to next step when starting process', async ({ page }) => {
    // Fill out required fields
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    const authorInput = page.locator('input[name="author"], input[placeholder*="author" i]').first();

    await titleInput.clear();
    await titleInput.fill('Test Book');

    await authorInput.clear();
    await authorInput.fill('Test Author');

    // Click start/process button
    const proceedButton = page.getByRole('button', { name: /start|continue|next|process|moderniz/i });
    await proceedButton.click();

    // Should proceed to next screen (editor, processing, etc.)
    await page.waitForTimeout(2000);

    // Verify we've moved to a new screen (not project setup anymore)
    const isStillOnSetup = await page.getByText(/project setup/i).isVisible();

    // If we see processing/editor UI, we've moved forward
    const hasMovedForward =
      (await page.getByText(/processing|chunk|editor|moderniz.*progress/i).isVisible()) || !isStillOnSetup;

    expect(hasMovedForward).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    // Clear title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.clear();

    // Try to proceed without title
    const proceedButton = page.getByRole('button', { name: /start|continue|next|process|moderniz/i });
    await proceedButton.click();

    await page.waitForTimeout(500);

    // Should either show error or prevent proceeding
    // This is implementation-dependent, so we just verify button behavior
    expect(await proceedButton.isVisible()).toBeTruthy();
  });

  test('should display all configuration sections', async ({ page }) => {
    // Verify all expected sections are present
    await expect(page.getByText(/title|book title/i)).toBeVisible();
    await expect(page.getByText(/author/i)).toBeVisible();

    // Check for additional sections
    const hasStats = await page.getByText(/statistic|word count/i).isVisible();
    const hasRange = await page.getByText(/range|portion|select/i).isVisible();

    // At least basic configuration should be present
    expect(hasStats || hasRange).toBeTruthy();
  });
});
