import { test, expect } from './fixtures';

test.describe('File dialog cancellation', () => {
  test('cancelling the open-file dialog is a no-op: no error, UI unchanged', async ({
    appContext,
  }) => {
    const { electronApp, electronWindow } = appContext;
    await electronWindow.waitForTimeout(700);

    // fileUpload() logs "Promise rejected with: ..." when the main-process handler throws.
    const rendererErrors: string[] = [];
    electronWindow.on('console', msg => {
      if (msg.type() === 'error') rendererErrors.push(msg.text());
    });

    // Simulate the user pressing Cancel in the native file picker.
    await electronApp.evaluate(async ({ dialog }) => {
      (global as unknown as { openDialogCalls: number }).openDialogCalls = 0;
      dialog.showOpenDialog = async () => {
        (global as unknown as { openDialogCalls: number }).openDialogCalls += 1;
        return { canceled: true, filePaths: [] };
      };
    });

    await electronWindow.locator('#upload-btn').click({ force: true });

    await expect
      .poll(() =>
        electronApp.evaluate(
          () => (global as unknown as { openDialogCalls: number }).openDialogCalls
        )
      )
      .toBe(1);

    // Let the IPC round trip settle so a rejected promise would have reached the renderer.
    await electronWindow.waitForTimeout(1000);

    expect(rendererErrors).toEqual([]);
    await expect(electronWindow.locator('#upload-btn')).toBeVisible();
    await expect(electronWindow.locator('#error-box, .error-box-container')).toHaveCount(0);
  });
});
