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

    await electronWindow.waitForTimeout(700);

    const container = electronWindow.locator('#input-section');
    await expect(container).toBeAttached();

    console.log('Root input section attached successfully!');
  });
});

test.describe('Dashboard State Traversal and Menu View Resets', () => {
  test('Full layout navigation and view-state toggles traversal', async ({ appContext }) => {
    const { electronApp, electronWindow } = appContext;
    await electronWindow.waitForTimeout(700);

    // 1. Inject data through the authentic Electron IPC Main process channel
    await electronApp.evaluate(({ BrowserWindow }) => {
      const windows = BrowserWindow.getAllWindows();
      const mainWindow = windows[0]; // Target the primary window in the stack

      if (mainWindow) {
        const realWaterPercentages = ['71', '17', '12', '0'].map(Number);
        const realLandPercentages = ['59', '13', '9', '19'].map(Number);
        const mockCamperList = ['Doe John'];

        const mockSchedulePayload = {
          waterPercentages: realWaterPercentages,
          landPercentages: realLandPercentages,
          water9am: { fish: mockCamperList, pboard: mockCamperList, snork: mockCamperList, canoe: mockCamperList, kayak: mockCamperList, sail: mockCamperList, swim: mockCamperList },
          water10am: { fish: mockCamperList, pboard: mockCamperList, snork: mockCamperList, canoe: mockCamperList, kayak: mockCamperList, sail: mockCamperList, swim: mockCamperList },
          land9am: { art: mockCamperList, hike: mockCamperList, bball: mockCamperList, cheer: mockCamperList, soc: mockCamperList, vball: mockCamperList, arch: mockCamperList },
          land10am: { fris: mockCamperList, art: mockCamperList, hike: mockCamperList, pball: mockCamperList, fball: mockCamperList, lax: mockCamperList, yoga: mockCamperList, arch: mockCamperList }
        };

        mainWindow.webContents.send('result-list', JSON.stringify(mockSchedulePayload));
      }
    });

    // Verify the UI processed the IPC signal and mounted the main layout container
    const resultBoxContainer = electronWindow.locator('#result-box');
    await expect(resultBoxContainer).toBeAttached({ timeout: 5000 });

    // 2. 🔥 THE FIX: Click Stats, then click Kids to toggle back to the timetable view layout
    const statsBtn = electronWindow.locator('#stats-btn');
    if (await statsBtn.count() > 0) {
      await statsBtn.click({ force: true }); // Swaps layout to Stats view (Sets showStats to true)
      await electronWindow.waitForTimeout(200);

      const kidsBtn = electronWindow.locator('#kids-btn');
      await expect(kidsBtn).toBeAttached({ timeout: 2000 });
      await kidsBtn.click({ force: true }); // Toggles back to standard timetable view (Sets showStats to false)
      await electronWindow.waitForTimeout(200);
    }

    // 3. Target the close button nested inside the result layout
    const closeBtn = electronWindow.locator('#close-btn');
    await expect(closeBtn).toBeAttached({ timeout: 3000 });
    await closeBtn.click({ force: true });

    // Allow the CSS fade-in animation rules (.fade-in-1-5s) to finish setting element opacity
    await electronWindow.waitForTimeout(1600);

    // 4. Verify the Input Options container attaches cleanly as matching app.css
    const container = electronWindow.locator('#input-options');
    await expect(container).toBeAttached();

    // Trigger the view option selection button via its explicit verified ID
    const viewScheduleBtn = electronWindow.locator('#view-schedule-btn');
    await expect(viewScheduleBtn).toBeAttached();
    await viewScheduleBtn.click({ force: true });
    await electronWindow.waitForTimeout(200);

    console.log('💯 Layout navigation coverage pathways fully saturated!');
  });
});
