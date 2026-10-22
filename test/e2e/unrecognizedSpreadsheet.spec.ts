import { test, expect } from './fixtures';
import * as Excel from 'exceljs';
import fs from 'fs';

// A file that the app cannot make sense of must always produce a visible error. Before the fix,
// these files made the main process throw, nothing was sent to the window, and the user saw
// nothing happen at all.

const EXPECTED_HEADING = 'Unrecognized spreadsheet format or data';

// The same two-sheet layout the app's own "Export to Excel" produces, filled with made-up names.
// Loading an export back in by mistake is the realistic way to hit this.
const writeExportedScheduleWorkbook = async (filePath: string): Promise<void> => {
  const workbook = new Excel.Workbook();

  const byActivity = workbook.addWorksheet('By Activity');
  byActivity.addRow(['Activity Time', 'Activity', 'Kid Count', 'Names']);
  byActivity.addRow(['Water 9AM', 'fish', 2, 'Ann Example, Bob Sample']);
  byActivity.addRow(['Land 9AM', 'art', 2, 'Ann Example, Bob Sample']);

  const byName = workbook.addWorksheet('By Name');
  byName.addRow(['Name', 'Water Time', 'Water Activity', 'Land Time', 'Land Activity']);
  byName.addRow(['Ann Example', '9am', 'fish', '10am', 'hike']);
  byName.addRow(['Bob Sample', '10am', 'swim', '9am', 'art']);

  await workbook.xlsx.writeFile(filePath);
};

const uploadFile = async (
  appContext: Parameters<Parameters<typeof test>[2]>[0]['appContext'],
  filePath: string
): Promise<void> => {
  const { electronApp, electronWindow } = appContext;
  await electronWindow.waitForTimeout(700);

  await electronApp.evaluate(async ({ dialog }, chosenPath) => {
    dialog.showOpenDialog = async () => {
      return { canceled: false, filePaths: [chosenPath] };
    };
  }, filePath);

  await electronWindow.locator('#upload-btn').click({ force: true });
};

test.describe('Unrecognized spreadsheets are reported, never ignored', () => {
  test('a workbook with no camper-choice columns (an exported schedule) shows an error', async ({
    appContext,
  }, testInfo) => {
    const { electronWindow } = appContext;
    const filePath = testInfo.outputPath('exported-schedule.xlsx');
    await writeExportedScheduleWorkbook(filePath);

    await uploadFile(appContext, filePath);

    await expect(
      electronWindow.locator('#error-box'),
      'the app should say it cannot use this workbook'
    ).toBeVisible({ timeout: 15000 });
    await expect(electronWindow.locator('#error-textarea')).toHaveValue(
      new RegExp(EXPECTED_HEADING)
    );
    await expect(electronWindow.locator('#text-box')).toBeHidden();
  });

  test('a file that is not a real Excel workbook shows an error', async ({
    appContext,
  }, testInfo) => {
    const { electronWindow } = appContext;
    const filePath = testInfo.outputPath('not-really-excel.xlsx');
    fs.writeFileSync(filePath, 'this is plain text, not an Excel workbook');

    await uploadFile(appContext, filePath);

    await expect(electronWindow.locator('#error-box')).toBeVisible({ timeout: 15000 });
    await expect(electronWindow.locator('#error-textarea')).toHaveValue(
      new RegExp(EXPECTED_HEADING)
    );
    await expect(electronWindow.locator('#text-box')).toBeHidden();
  });
});
