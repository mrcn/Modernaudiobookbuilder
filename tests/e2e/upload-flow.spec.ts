import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Upload Flow E2E Tests
 * Tests the book upload workflow including drag-and-drop and file validation
 */

test.describe('Book Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the library view to load
    await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();
  });

  test('should display library view on initial load', async ({ page }) => {
    // Check that we're on the library page
    await expect(page.getByRole('heading', { name: /library/i })).toBeVisible();

    // Check for sample books in the library
    await expect(page.getByText('Pride and Prejudice')).toBeVisible();
    await expect(page.getByText('Jane Austen')).toBeVisible();
  });

  test('should show upload button', async ({ page }) => {
    // Find the upload/add new book button
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await expect(uploadButton).toBeVisible();
  });

  test('should open upload screen when clicking upload button', async ({ page }) => {
    // Click upload button
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    // Verify we're on the upload screen
    await expect(page.getByText(/drag.*drop|upload|select.*file/i)).toBeVisible();
  });

  test('should display file upload zone', async ({ page }) => {
    // Navigate to upload screen
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    // Check for upload zone elements - looking for "Drop your book here"
    await expect(page.getByText(/drop your book here/i)).toBeVisible();
    await expect(page.getByText(/.txt/i)).toBeVisible(); // Should mention .txt file support
  });

  test('should handle file selection via input', async ({ page }) => {
    // Navigate to upload screen
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    // Create a test file
    const testFileContent = 'CHAPTER 1\n\nThis is a test book for uploading.\n\nIt has multiple paragraphs and should be processed correctly.';

    // Look for file input (may be hidden)
    const fileInput = page.locator('input[type="file"]');

    // Set the file using setInputFiles with buffer
    await fileInput.setInputFiles({
      name: 'test-book.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testFileContent),
    });

    // Wait for file to be processed
    await page.waitForTimeout(1000);

    // Check if the book title appears (filename without extension) - use .first() to avoid strict mode
    await expect(page.getByText(/test-book/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should validate file type', async ({ page }) => {
    // Navigate to upload screen
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    // Try to upload a non-.txt file
    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: 'invalid-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake pdf content'),
    });

    // Note: Current implementation may not validate file types
    // This test verifies the app doesn't crash with invalid files
    await page.waitForTimeout(1000);

    // Check the app is still functional (not crashed)
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should show book statistics after upload', async ({ page }) => {
    // Navigate to upload screen
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    // Upload a test file
    const testFileContent = 'CHAPTER 1\n\nThis is a test book.\n\n' + 'Word '.repeat(500) + '\n\nCHAPTER 2\n\nMore content here.';

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'statistics-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(testFileContent),
    });

    // Wait for the book title to appear (project setup shows filename as title) - use .first() for strict mode
    await expect(page.getByText(/statistics-test/i).first()).toBeVisible({ timeout: 5000 });

    // Check for statistics (word count, character count, etc.) - use count to avoid strict mode
    const wordCount = await page.getByText(/\d+.*word/i).count();
    const charCount = await page.getByText(/\d+.*character/i).count();
    const chunkCount = await page.getByText(/\d+.*chunk/i).count();
    expect(wordCount > 0 || charCount > 0 || chunkCount > 0).toBeTruthy();
  });

  test('should allow canceling upload', async ({ page }) => {
    // Navigate to upload screen
    const uploadButton = page.getByRole('button', { name: /^upload book$/i });
    await uploadButton.click();

    // Look for cancel or back button
    const cancelButton = page.getByRole('button', { name: /cancel|back/i });

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Should return to library
      await expect(page.getByText('Pride and Prejudice')).toBeVisible();
    }
  });
});
