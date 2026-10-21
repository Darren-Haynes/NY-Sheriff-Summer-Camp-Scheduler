import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

/**
 * Give the renderer a viewport of exactly `width` x `height` and wait until it reports it.
 *
 * These tests check CSS media-query breakpoints, so what matters is the size the page sees,
 * not the size of the native window. Asking the OS for a window size is not reliable:
 * tiling window managers (sway, i3) override it, and macOS clamps a window to the display's
 * usable area (a 1300px-high window becomes ~1228px on a laptop). Viewport emulation sets
 * the page size directly, so the result is the same on every OS, display and CI runner.
 */
const resizeWindow = async (electronWindow: Page, width: number, height: number) => {
  await electronWindow.setViewportSize({ width, height });
  await expect
    .poll(
      () =>
        electronWindow.evaluate(() => ({
          width: window.innerWidth,
          height: window.innerHeight,
        })),
      { message: `viewport should be ${width}x${height}`, timeout: 15000 }
    )
    .toEqual({ width, height });
};

test.describe('Responsive Media Queries Tests', () => {
  test('header check responsive width and height metrics', async ({ appContext }) => {
    const { electronWindow } = appContext;

    // Install a fast clock wrapper over the page so the background slider can be fast-forwarded.
    await electronWindow.clock.install();

    // React re-renders after the viewport changes, so the CSS settles a moment later.
    // `toHaveCSS` retries until it matches, which avoids reading the styles too early.
    const inputOptions = electronWindow.locator('#input-options');
    const navbarLeft = electronWindow.locator('#navbar-left');
    const navbarRight = electronWindow.locator('#navbar-right');
    const campSign = electronWindow.locator('#camp-sign');

    // ==========================================
    // PHASE 1: HEIGHT MEDIA QUERY BREAKPOINTS
    // ==========================================
    await resizeWindow(electronWindow, 1200, 660);
    await expect(inputOptions).toHaveCSS('height', '300px');
    await expect(inputOptions).toHaveCSS('margin-top', '0px');
    await expect(campSign).toBeHidden();

    await resizeWindow(electronWindow, 1200, 900);
    await expect(inputOptions).toHaveCSS('height', '500px');
    await expect(inputOptions).toHaveCSS('margin-top', '0px');
    await expect(campSign).toBeVisible();

    await resizeWindow(electronWindow, 1200, 1100);
    await expect(inputOptions).toHaveCSS('height', '500px');
    await expect(inputOptions).toHaveCSS('margin-top', '-100px');
    await expect(campSign).toBeVisible();

    await resizeWindow(electronWindow, 1200, 1300);
    await expect(inputOptions).toHaveCSS('height', '500px');
    await expect(inputOptions).toHaveCSS('margin-top', '-200px');
    await expect(campSign).toBeVisible();

    // ==========================================
    // PHASE 2: WIDTH MEDIA QUERY BREAKPOINTS
    // ==========================================
    await resizeWindow(electronWindow, 1200, 850);
    await expect(navbarLeft).toHaveCSS('margin-right', '150px');
    await expect(navbarRight).toHaveCSS('margin-left', '150px');

    await resizeWindow(electronWindow, 800, 850);
    await expect(navbarLeft).toHaveCSS('margin-right', '120px');
    await expect(navbarRight).toHaveCSS('margin-left', '120px');

    await resizeWindow(electronWindow, 660, 850);
    await expect(navbarLeft).toHaveCSS('margin-right', '109px');
    await expect(navbarRight).toHaveCSS('margin-left', '120px');

    // ==========================================================
    // PHASE 3: FAST-FORWARD SLIDER TIMERS FOR COVERAGE
    // ==========================================================
    await electronWindow.clock.fastForward(13000);
    await electronWindow.waitForTimeout(200);
  });
});
