import { test, expect } from './fixtures';
import path from 'path';
import fs from 'fs';

test.describe.configure({ mode: 'serial' });

// UPDATED: Use relative steps from this file's position inside test/e2e/
const FIXTURE_GROUPS = [
  { dirPath: './fixtures/original-format', label: 'ORIGINAL_FORMAT' },
  { dirPath: './fixtures/new-format', label: 'NEW_FORMAT' }
];

FIXTURE_GROUPS.forEach(({ dirPath, label }) => {
  // FIXED: Resolves paths reliably relative to this spec file
  const resolvedDir = path.resolve(__dirname, dirPath);

  if (!fs.existsSync(resolvedDir)) {
    console.warn(`⚠️ Warning: Path not found during scan: ${resolvedDir}`);
    return;
  }

  // STRICT FILTER: Grab only files that start with "error"
  const excelFiles = fs.readdirSync(resolvedDir).filter(file => file.startsWith('error') && file.endsWith('.xlsx'));
  excelFiles.forEach(file => {
    test(`Excel Error Matrix [${label}] -> ${file}`, async ({ appContext }) => {
      test.setTimeout(30000);

      const { electronApp, electronWindow } = appContext;
      const fullSpreadsheetPath = path.join(resolvedDir, file);

      await electronWindow.waitForTimeout(700);

      // 1. Answer the file picker with the fixture file. This is the only call into the
      // main process: it is idle here. Once the upload starts, the main process can be busy
      // for ~1.5s running the scheduler (error-50-kids files get past validation), and
      // calling into it while it is blocked made this test flaky
      // ("electronApplication.evaluate: Resulting promise was garbage collected").
      await electronApp.evaluate(async ({ dialog }, filePath) => {
        dialog.showOpenDialog = async () => {
          return { canceled: false, filePaths: [filePath] };
        };
      }, fullSpreadsheetPath);

      // 2. Click Upload
      const uploadButton = electronWindow.locator('#upload-btn');
      await expect(uploadButton).toBeAttached();
      await uploadButton.click({ force: true });

      // 3. Every rejected spreadsheet is reported in the UI error box (the app never uses
      // native error dialogs). Wait on the renderer only, which retries by itself.
      await expect(
        electronWindow.locator('#error-box'),
        'the app should report the bad spreadsheet in the error box'
      ).toBeVisible({ timeout: 15000 });

      // 4. Invariant: Ensure the successful dashboard view was never mounted
      await expect(electronWindow.locator('#text-box')).toBeHidden();
    });
  });
});
