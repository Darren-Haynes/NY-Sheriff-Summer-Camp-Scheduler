import { test, expect } from './fixtures';

test.describe('Responsive Media Queries Tests', () => {

  test.use({
    viewport: { width: 1200, height: 660 }
  });

  test('header check responsive width and height metrics', async ({ appContext }) => {
    const { electronApp, electronWindow } = appContext;

    // 1. Install a fast clock wrapper over the browser page instance context
    await electronWindow.clock.install();

    // FIX: Added [0] index array accessor to prevent the TypeError crash
    await electronApp.evaluate(async ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) mainWindow.setBounds({ width: 1200, height: 660 });
    });
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
    // PHASE 1: HEIGHT MEDIA QUERY BREAKPOINTS
    // ==========================================
    let inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('300px');
    expect(inputStyles.marginTop).toBe('0px');
    await expect(campSign).toBeHidden();

    // FIX: Added [0] index array accessor
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 900 });
    await electronWindow.waitForTimeout(400);

    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('0px');
    await expect(campSign).toBeVisible();

    // FIX: Added [0] index array accessor
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 1100 });
    await electronWindow.waitForTimeout(400);

    inputStyles = await getLayoutStyles('#input-options');
    expect(inputStyles.height).toBe('500px');
    expect(inputStyles.marginTop).toBe('-100px');
    await expect(campSign).toBeVisible();

    // FIX: Added [0] index array accessor
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

    // FIX: Added [0] index array accessor
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 850 });
    await electronWindow.waitForTimeout(300);

    let leftStyles = await getLayoutStyles('#navbar-left');
    let rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('150px');
    expect(rightStyles.marginLeft).toBe('150px');

    // FIX: Added [0] index array accessor
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 800, height: 850 });
    await electronWindow.waitForTimeout(300);

    leftStyles = await getLayoutStyles('#navbar-left');
    rightStyles = await getLayoutStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('120px');
    expect(rightStyles.marginLeft).toBe('120px');

    // FIX: Added [0] index array accessor
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 660, height: 850 });
    await electronWindow.waitForTimeout(300);

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
