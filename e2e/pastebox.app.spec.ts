import { test, expect } from './fixtures';
import * as fs from 'fs';
import * as path from 'path';

test.describe('PasteBox Real-World Dataset Testing', () => {
  test('Gracefully captures and verifies the misformatted activity data', async ({
    appContext,
  }) => {
    const { electronWindow } = appContext;
    await electronWindow.waitForTimeout(700);

    // 1. Read your copied activity error data straight from the disk
    const fileSpecPath = path.join(__dirname, 'fixtures/error-wrong-activities.txt');
    const malformedData = fs.readFileSync(fileSpecPath, 'utf8');

    // 2. Open the PasteBox component
    const pasteNavBtn = electronWindow.locator('#paste-btn');
    await pasteNavBtn.click({ force: true });

    // 3. Paste the actual raw validation data instantly
    const textarea = electronWindow.locator('#paste-textarea');
    await expect(textarea).toBeAttached();
    await textarea.focus();
    await textarea.clear();
    await textarea.fill(malformedData);

    // 4. Submit to trigger your main process handleErrors() routine
    const submitBtn = electronWindow.locator('#submit-btn');
    await submitBtn.click({ force: true });

    // 5. Assert that the ErrorBox mounts cleanly
    // This provides coverage for ErrorBox.tsx and your MainContent send_error listeners
    const errorBox = electronWindow.locator('#error-box, .error-box-container');
    await expect(errorBox).toBeAttached({ timeout: 5000 });

    console.log('✅ Error data pathway verified successfully.');
  });

  test('Processes production 104-camper spreadsheet data and yields schedule layouts', async ({
    appContext,
  }) => {
    const { electronWindow } = appContext;
    await electronWindow.waitForTimeout(700);

    // 1. Read your success sheet data string
    const fileSpecPath = path.join(__dirname, 'fixtures/success-104-kids.txt');
    const productionData = fs.readFileSync(fileSpecPath, 'utf8');

    // 2. Open the PasteBox view
    const pasteNavBtn = electronWindow.locator('#paste-btn');
    await pasteNavBtn.click({ force: true });

    // 3. Populate your textarea container
    const textarea = electronWindow.locator('#paste-textarea');
    await expect(textarea).toBeAttached();
    await textarea.focus();
    await textarea.clear();
    await textarea.fill(productionData);

    // 4. Submit to initiate scheduleKids() allocation algorithm
    const submitBtn = electronWindow.locator('#submit-btn');
    await submitBtn.click({ force: true });

    // 5. SUCCESS DASHBOARD UNLOCKED!
    // The distributed load runs smoothly and sends 'result-list' data parameters back down,
    // mounting #result-box and running your main timeSlots grids.
    const resultBoxContainer = electronWindow.locator('#result-box');
    await expect(resultBoxContainer).toBeAttached({ timeout: 15000 });

    console.log('🎯 Production dataset successfully generated the allocation schedule grid!');
  });
});
