import { test, expect } from './fixtures';
import path from 'path';

test('Export button triggers export_excel loop successfully and exercises branches', async ({ appContext }) => {
  test.setTimeout(30000);

  const { electronApp, electronWindow } = appContext;
  const targetExcelPath = path.join(__dirname, 'test-data/sample-kids-schedule.xlsx');

  await electronApp.evaluate(async ({ ipcMain, BrowserWindow }, filePath) => {
    ipcMain.removeHandler('open-file-dialog');
    ipcMain.removeHandler('export-excel');
    ipcMain.removeHandler('copy-schedule');

    (global as any).exportExcelCalled = false;
    (global as any).copyScheduleCount = 0;

    ipcMain.handle('open-file-dialog', async () => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        const realWaterPercentages = ['71', '17', '12', '0'].map(Number);
        const realLandPercentages = ['59', '13', '9', '19'].map(Number);
        const mockCamperList = ['Doe John'];

        const mockSchedulePayload = {
          waterPercentages: realWaterPercentages,
          landPercentages: realLandPercentages,
          water9am: { fish: mockCamperList, pboard: mockCamperList, snork: mockCamperList, canoe: mockCamperList, kayak: mockCamperList, sail: mockCamperList, swim: mockCamperList },
          water10am: { fish: mockCamperList, pboard: mockCamperList, snork: mockCamperList, canoe: mockCamperList, kayak: mockCamperList, sail: mockCamperList, swim: mockCamperList },
          land9am: { art: mockCamperList, hike: mockCamperList, bball: mockCamperList, cheer: mockCamperList, soc: mockCamperList, vball: mockCamperList, arch: mockCamperList },
          land10am: { fris: mockCamperList, art: mockCamperList, hike: mockCamperList, pball: mockCamperList, fball: mockCamperList, lax: mockCamperList, yoga: mockCamperList, arch: mockCamperList }
        };
        mainWindow.webContents.send('result-list', JSON.stringify(mockSchedulePayload));
      }
      return { canceled: false, filePaths: [filePath] };
    });

    ipcMain.handle('export-excel', async () => {
      (global as any).exportExcelCalled = true;
      return { success: true };
    });

    // Track clipboard calls to ensure branch completion
    ipcMain.handle('copy-schedule', async () => {
      (global as any).copyScheduleCount += 1;
      return { success: true };
    });
  }, targetExcelPath);

  // 1. Initial Interaction
  const uploadButton = electronWindow.locator('#upload-btn');
  await expect(uploadButton).toBeVisible();
  await uploadButton.click();

  // 2. Clear out default view copy branch (Line 101 false condition)
  const copyButton = electronWindow.locator('#submit-btn');
  await expect(copyButton).toBeAttached({ timeout: 15000 });
  await copyButton.click({ force: true });
  await electronWindow.waitForTimeout(200); // Allow frame settlement

  // 3. Clear the Stats/Kids Toggle branches (Lines 43, 58, 68)
  const statsButton = electronWindow.locator('#stats-btn');
  await expect(statsButton).toBeAttached();
  await statsButton.click({ force: true });
  await electronWindow.waitForTimeout(200);

  const kidsButton = electronWindow.locator('#kids-btn');
  await expect(kidsButton).toBeAttached({ timeout: 5000 });

  // Clear out stats view copy branch (Line 101 true condition)
  await copyButton.click({ force: true });
  await electronWindow.waitForTimeout(200);

  // Revert back to the primary layout state
  await kidsButton.click({ force: true });
  await electronWindow.waitForTimeout(200);

  // 4. Run the Export loop to satisfy the isolated statement line
  const exportButton = electronWindow.locator('#upload-btn-2');
  await expect(exportButton).toBeAttached();
  await exportButton.click({ force: true });

  // Poll until both backend loops hit true configurations
  await expect.poll(async () => {
    return await electronApp.evaluate(() => {
      return (global as any).exportExcelCalled && (global as any).copyScheduleCount >= 2;
    });
  }, {
    message: 'Wait for branch handlers to be traced cleanly',
    timeout: 5000
  }).toBe(true);

  await electronWindow.waitForTimeout(500);
});
