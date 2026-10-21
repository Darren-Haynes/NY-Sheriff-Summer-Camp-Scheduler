import { test, expect } from './fixtures';

test.describe('IPC channel wiring', () => {
  test('submitting an empty paste box notifies the renderer (main -> preload -> renderer)', async ({
    appContext,
  }) => {
    const { electronWindow } = appContext;
    await electronWindow.waitForTimeout(700);

    // Count every event the renderer receives on the "no paste content" channel.
    await electronWindow.waitForSelector('#paste-btn');
    await electronWindow.evaluate(() => {
      const w = window as unknown as { noPasteContentEvents: number };
      w.noPasteContentEvents = 0;
      window.textAPI.send_no_paste_content(() => {
        w.noPasteContentEvents += 1;
      });
    });

    await electronWindow.locator('#paste-btn').click({ force: true });
    await expect(electronWindow.locator('#paste-textarea')).toHaveValue('Paste text here...');

    // Submitting the untouched placeholder text is treated as "no content" by the main process.
    await electronWindow.locator('#submit-btn').click({ force: true });

    await expect
      .poll(
        () =>
          electronWindow.evaluate(
            () => (window as unknown as { noPasteContentEvents: number }).noPasteContentEvents
          ),
        { timeout: 5000 }
      )
      .toBe(1);
  });
});
