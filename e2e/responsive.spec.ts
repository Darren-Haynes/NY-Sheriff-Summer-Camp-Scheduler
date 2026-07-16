import { test, expect } from './fixtures';

test.describe('Responsive Media Queries Tests', () => {

  // Force the initial browser context window bounds to start short on launch.
  // This ensures the cold-mount false branches for lines 18, 22, and 23 are tracked immediately!
  test.use({
    viewport: { width: 1200, height: 660 }
  });

  test('header check responsive width and height metrics', async ({ appContext }) => {
    const { electronApp, electronWindow } = appContext;

    // Direct the native OS window manager to contract down to 660px tall immediately
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) mainWindow.setBounds({ width: 1200, height: 660 });
    });
    // Give the layout engine 400ms to paint the short viewport before reading styles
    await electronWindow.waitForTimeout(400);

    const getLayoutStyles = async (selector: string) => {
      return await electronWindow.locator(selector).evaluate((el) => {
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
    // PHASE 1: HEIGHT MEDIA QUERY BREAKPOINTS (Short View First)
    // ==========================================

    // --- 1. Short Viewport Layout (Height < 825px) ---
    let inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('300px');
    expect(inputStyles.marginTop).toBe('0px');
    await expect(campSign).toBeHidden();

    // --- 2. Standard Viewport Layout (Height 825px - 1000px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 900 });
    await electronWindow.waitForTimeout(400);

    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('0px');
    await expect(campSign).toBeVisible();

    // --- 3. Tall Viewport Layout (Height 1001px - 1200px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 1100 });
    await electronWindow.waitForTimeout(400);

    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('-100px');
    await expect(campSign).toBeVisible();

    // --- 4. Extra Tall Viewport Layout (Height >= 1201px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 1300 });
    await electronWindow.waitForTimeout(400);

    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('-200px');
    await expect(campSign).toBeVisible();

    // ==========================================
    // PHASE 2: WIDTH MEDIA QUERY BREAKPOINTS
    // ==========================================

    // --- 1. Desktop View (Width > 900px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 850 });
    await electronWindow.waitForTimeout(300);

    // FIX: Changed from getMarginStyles to getLayoutStyles
    let leftStyles = await getLayoutStyles('#navbar-left');
    let rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('150px');
    expect(rightStyles.marginLeft).toBe('150px');

    // --- 2. Tablet View (701px - 900px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 800, height: 850 });
    await electronWindow.waitForTimeout(300);

    // FIX: Changed from getMarginStyles to getLayoutStyles
    leftStyles = await getLayoutStyles('#navbar-left');
    rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('120px');
    expect(rightStyles.marginLeft).toBe('120px');

    // --- 3. Mobile View (Width <= 700px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 660, height: 850 });
    await electronWindow.waitForTimeout(300);

    // FIX: Changed from getMarginStyles to getLayoutStyles
    leftStyles = await getLayoutStyles('#navbar-left');
    rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('109px');
    expect(rightStyles.marginLeft).toBe('120px');
  });
});
