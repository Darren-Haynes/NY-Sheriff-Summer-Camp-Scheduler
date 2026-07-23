import { test, expect } from './fixtures';
import path from 'path';
import fs from 'fs';

test.describe.configure({ mode: 'serial' });

const FIXTURE_GROUPS = [
  { dirPath: 'e2e/fixtures/original-format', label: 'ORIGINAL_FORMAT' },
  { dirPath: 'e2e/fixtures/new-format', label: 'NEW_FORMAT' }
];

FIXTURE_GROUPS.forEach(({ dirPath, label }) => {
  const resolvedDir = path.resolve(process.cwd(), dirPath);
  if (!fs.existsSync(resolvedDir)) return;

  // STRICT FILTER: Grab only files that start with "error"
  const excelFiles = fs.readdirSync(resolvedDir).filter(file => file.startsWith('error') && file.endsWith('.xlsx'));

  excelFiles.forEach(file => {
    test(`Excel Error Matrix [${label}] -> ${file}`, async ({ appContext }) => {
      test.setTimeout(30000);

      const { electronApp, electronWindow } = appContext;
      const fullSpreadsheetPath = path.join(resolvedDir, file);

      await electronWindow.waitForTimeout(700);

      // 1. Intercept Dialog prompts
      await electronApp.evaluate(async ({ dialog }, filePath) => {
        (global as any).nativeErrorCaught = false;

        dialog.showOpenDialog = async () => {
          return { canceled: false, filePaths: [filePath] };
        };
        dialog.showErrorBox = () => {
          (global as any).nativeErrorCaught = true;
        };
        dialog.showMessageBox = async () => {
          (global as any).nativeErrorCaught = true;
          return { response: 0, checkboxChecked: false };
        };
      }, fullSpreadsheetPath);

      // 2. Click Upload
      const uploadButton = electronWindow.locator('#upload-btn');
      await expect(uploadButton).toBeAttached();
      await uploadButton.click({ force: true });

      // 3. Dynamic Resolution: Look for UI Error boxes or Native Dialog triggers
      const errorBoxContainer = electronWindow.locator('#error-box, .error-box-container');

      const isErrorHandled = await expect.poll(async () => {
        const uiErrorVisible = await errorBoxContainer.isVisible().catch(() => false);
        const nativeErrorVisible = await electronApp.evaluate(() => (global as any).nativeErrorCaught);
        return uiErrorVisible || nativeErrorVisible;
      }, {
        message: 'Waiting for application error handlers to catch constraint anomalies',
        timeout: 15000
      }).toBe(true);

      // 4. Invariant: Ensure the successful dashboard view was never mounted
      const timetableContainer = electronWindow.locator('#text-box');
      expect(await timetableContainer.isVisible()).toBe(false);
    });
  });
});
