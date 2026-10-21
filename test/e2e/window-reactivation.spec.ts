import { test, expect } from './fixtures';

test.describe('Window re-creation (macOS dock click after closing the window)', () => {
  test('re-opening the window does not re-register IPC handlers and still works', async ({
    appContext,
  }) => {
    const { electronApp, electronWindow } = appContext;
    await electronWindow.waitForTimeout(700);

    // On macOS the app stays alive after its last window closes. Linux and Windows quit
    // instead, so remove that behaviour to be able to simulate the mac flow here.
    await electronApp.evaluate(async ({ app, BrowserWindow }) => {
      app.removeAllListeners('window-all-closed');
      BrowserWindow.getAllWindows().forEach(window => window.destroy());
    });

    // Clicking the dock icon makes Electron emit 'activate', which calls createWindow() again.
    // If createWindow() throws (e.g. duplicate ipcMain.handle), the error surfaces from emit().
    const newWindowPromise = electronApp.waitForEvent('window');
    const activateError = await electronApp.evaluate(async ({ app }) => {
      try {
        app.emit('activate');
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    });
    expect(activateError).toBeNull();

    // The new window must be fully functional: its IPC round trip has to reach *this* window.
    const newWindow = await newWindowPromise;
    await newWindow.waitForLoadState('domcontentloaded');
    await newWindow.waitForSelector('#paste-btn');
    await newWindow.waitForTimeout(700);

    await newWindow.evaluate(() => {
      const w = window as unknown as { noPasteContentEvents: number };
      w.noPasteContentEvents = 0;
      window.textAPI.send_no_paste_content(() => {
        w.noPasteContentEvents += 1;
      });
    });

    await newWindow.locator('#paste-btn').click({ force: true });
    await expect(newWindow.locator('#paste-textarea')).toHaveValue('Paste text here...');
    await newWindow.locator('#submit-btn').click({ force: true });

    await expect
      .poll(() =>
        newWindow.evaluate(
          () => (window as unknown as { noPasteContentEvents: number }).noPasteContentEvents
        )
      )
      .toBe(1);
  });
});
