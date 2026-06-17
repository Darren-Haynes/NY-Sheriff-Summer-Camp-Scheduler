import { test, expect } from './fixtures';

test('Pastebox accurately processes raw kid schedules', async ({ appContext }) => {
  const { electronWindow } = appContext;
  await electronWindow.locator('button:has-text("Paste")').click();
  electronWindow.locator('button:has-text("Close")');
  electronWindow.locator('button:has-text("Upload")');
  electronWindow.locator('button:has-text("Submit")');
  const textarea = electronWindow.locator('textarea');
  await expect(textarea).toHaveValue('Paste text here...');
});
