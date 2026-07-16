import { test, expect } from './fixtures';

test.describe('Responsive Media Queries Tests', () => {

  test('header check responsive width', async ({ appContext }) => {
    const { electronApp, electronWindow } = appContext;

    // Helper function to extract computed styles safely from the browser window
    const getMarginStyles = async (selector: string) => {
      return await electronWindow.locator(selector).evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
        };
      });
    };

    // --- 1. TEST VIEW (Width > 900px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 1200, height: 800 });
    await electronWindow.waitForTimeout(300); // Allow media query engine to paint

    let leftStyles = await getMarginStyles('#navbar-left');
    let rightStyles = await getMarginStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('150px');
    expect(rightStyles.marginLeft).toBe('150px');

    // --- 2. TEST VIEW (701px - 900px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 800, height: 800 });
    await electronWindow.waitForTimeout(300);

    leftStyles = await getMarginStyles('#navbar-left');
    rightStyles = await getMarginStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('120px');
    expect(rightStyles.marginLeft).toBe('120px');

    // --- 3. TEST VIEW (Width <= 700px) ---
    await electronApp.evaluate(async ({ BrowserWindow }, { width, height }) => {
      BrowserWindow.getAllWindows()[0].setBounds({ width, height });
    }, { width: 500, height: 800 });
    await electronWindow.waitForTimeout(300);

    leftStyles = await getMarginStyles('#navbar-left');
    rightStyles = await getMarginStyles('#navbar-right');
    expect(leftStyles.marginRight).toBe('109px');
    expect(rightStyles.marginLeft).toBe('120px'); // Handled by headerAlign900 fallback
  });
});
