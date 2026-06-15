import { test, expect } from './fixtures';

test('Pastebox accurately processes raw kid schedules', async ({ electronWindow }) => {
  await electronWindow.locator('button:has-text("Paste")').click();
  const textarea = electronWindow.locator('textarea');
  await expect(textarea).toHaveValue('Paste text here...');
});
