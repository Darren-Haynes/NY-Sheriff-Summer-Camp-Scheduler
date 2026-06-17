import { test, expect } from './fixtures'; // 👈 Import from your fixture file

test('Application launches and loads main window', async ({ appContext }) => {
  const { electronWindow } = appContext;
  // The app is already fully booted up and ready to test here!
  const title = await electronWindow.title();
  console.log(`Loaded app window with title: ${title}`);

  // Example Assertion
  await expect(electronWindow).toHaveTitle(/.*Scheduler.*/i);
});
