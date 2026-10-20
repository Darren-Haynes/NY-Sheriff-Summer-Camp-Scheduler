import type { ElectronApplication, Page } from '@playwright/test';
import { test, expect } from './fixtures';

/**
 * Resize the app window and wait until the page's viewport really is that size.
 *
 * A fixed sleep after `setBounds` is not reliable: tiling window managers (e.g. sway, i3)
 * can override the first resize request. Re-sending the request until the renderer reports
 * the expected viewport keeps the test deterministic on any window manager, and on CI (xvfb).
 */
const resizeWindow = async (
  electronApp: ElectronApplication,
  electronWindow: Page,
  width: number,
  height: number
) => {
  await expect
    .poll(
      async () => {
        await electronApp.evaluate(
          async ({ BrowserWindow }, size) => {
            BrowserWindow.getAllWindows()[0]?.setContentSize(size.width, size.height);
          },
          { width, height }
        );
        await electronWindow.waitForTimeout(150);
        return electronWindow.evaluate(() => ({
          width: window.innerWidth,
          height: window.innerHeight,
        }));
      },
      { message: `window should resize to ${width}x${height}`, timeout: 15000 }
    )
    .toEqual({ width, height });
};

test.describe('Responsive Media Queries Tests', () => {
  test('header check responsive width and height metrics', async ({ appContext }) => {
    const { electronApp, electronWindow } = appContext;

    // Install a fast clock wrapper over the page so the background slider can be fast-forwarded.
    await electronWindow.clock.install();

    const getLayoutStyles = async (selector: string) => {
      return await electronWindow.locator(selector).evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          height: style.height,
          marginTop: style.marginTop,
        };
      });
    };

    const campSign = electronWindow.locator('#camp-sign');

    // ==========================================
    // PHASE 1: HEIGHT MEDIA QUERY BREAKPOINTS
    // ==========================================
    await resizeWindow(electronApp, electronWindow, 1200, 660);
    let inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('300px');
    expect(inputStyles.marginTop).toBe('0px');
    await expect(campSign).toBeHidden();

    await resizeWindow(electronApp, electronWindow, 1200, 900);
    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('0px');
    await expect(campSign).toBeVisible();

    await resizeWindow(electronApp, electronWindow, 1200, 1100);
    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('-100px');
    await expect(campSign).toBeVisible();

    await resizeWindow(electronApp, electronWindow, 1200, 1300);
    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('-200px');
    await expect(campSign).toBeVisible();

    // ==========================================
    // PHASE 2: WIDTH MEDIA QUERY BREAKPOINTS
    // ==========================================
    await resizeWindow(electronApp, electronWindow, 1200, 850);
    let leftStyles = await getLayoutStyles('#navbar-left');
    let rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('150px');
    expect(rightStyles.marginLeft).toBe('150px');

    await resizeWindow(electronApp, electronWindow, 800, 850);
    leftStyles = await getLayoutStyles('#navbar-left');
    rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('120px');
    expect(rightStyles.marginLeft).toBe('120px');

    await resizeWindow(electronApp, electronWindow, 660, 850);
    leftStyles = await getLayoutStyles('#navbar-left');
    rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('109px');
    expect(rightStyles.marginLeft).toBe('120px');

    // ==========================================================
    // PHASE 3: FAST-FORWARD SLIDER TIMERS FOR COVERAGE
    // ==========================================================
    await electronWindow.clock.fastForward(13000);
    await electronWindow.waitForTimeout(200);
  });
});
