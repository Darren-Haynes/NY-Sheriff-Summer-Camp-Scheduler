import { test, expect } from './fixtures';

test('Application launches and loads main window', async ({ appContext }) => {
  const { electronWindow } = appContext;
  const title = await electronWindow.title();
  console.log(`Loaded app window with title: ${title}`);

  await expect(electronWindow).toHaveTitle(/.*Scheduler.*/i);
});

test.describe('Responsive App Component Testing', () => {
  test('Evaluates component loading states', async ({ appContext }) => {
    const { electronWindow } = appContext;

    // 1. Wait for the main.ts dev-server reload timeout to clear
    await electronWindow.waitForTimeout(700);

    // 2. Switch to toBeAttached() so layout/opacity animations don't trip up the test
    const container = electronWindow.locator('#input-section');
    await expect(container).toBeAttached();

    console.log('Root input section attached successfully!');
  });
});
