import { test, expect } from './fixtures';
import path from 'path'; // Keeps path formatting clean for Mac/Windows

test('File upload button intercepts dialog autonomously', async ({ appContext }) => {
  test.setTimeout(30000);

  const { electronApp, electronWindow } = appContext;

  // 1. Establish the clean path to your new test-data folder
  // This points directly to: tests/test-data/sample-kids-schedule.xlsx
  const targetExcelPath = path.join(__dirname, 'test-data/sample-kids-schedule.xlsx');

  // 2. Intercept the Main Process IPC handler completely
  // We pass `targetExcelPath` down as an argument so the mock can use it if needed
  await electronApp.evaluate(async ({ ipcMain, BrowserWindow }, filePath) => {
    ipcMain.removeHandler('open-file-dialog');

    ipcMain.handle('open-file-dialog', async () => {
      const mainWindow = BrowserWindow.getAllWindows()[0];

      if (mainWindow) {
        mainWindow.webContents.send(
          'error-list',
          JSON.stringify([
            {
              header: 'Unable to schedule kids',
              errorList: ['Mock file error text for autonomous verification loops.'],
            },
          ])
        );
      }

      // Updated: Return your dynamically resolved workspace file path string
      return {
        canceled: false,
        filePaths: [filePath],
      };
    });
  }, targetExcelPath); // 👈 We pass the path variable safely into the main process thread here

  // 3. Click the Upload button found in your UI layout trace
  const uploadButton = electronWindow.locator('button:has-text("Upload")');
  await expect(uploadButton).toBeVisible();
  await uploadButton.click();

  // 4. Assert on a unique text node injected inside your error view container
  const errorMessageNode = electronWindow.locator('text=Unable to schedule kids');
  await expect(errorMessageNode).toBeVisible({ timeout: 15000 });
});
