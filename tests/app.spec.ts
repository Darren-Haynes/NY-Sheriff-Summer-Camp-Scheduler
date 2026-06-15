import { _electron as electron, test, expect } from '@playwright/test';
import path from 'path';

test('Application launches and loads main window', async () => {
  // Give the runner ample time to handle production binary overhead
  test.setTimeout(60000);

  const electronApp = await electron.launch({
    // executablePath: path.join(
    //   __dirname,
    //   '../out/NY Sheriff Summer Camp Scheduler-darwin-arm64/NY Sheriff Summer Camp Scheduler.app/Contents/MacOS/NY Sheriff Summer Camp Scheduler'
    // ),
    //     // Correct Fix: Provide the binary path to executablePath, NOT args
    executablePath: path.join(
      __dirname,
      '../node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'
    ),
    // Fix: Force absolute path paths pointing directly to the compiled Webpack target file
    args: [path.join(__dirname, '../.webpack/arm64/main/index.js')],
  });

  // Resilient Polling Fix: Prevent missing the initialization event hook
  let window;
  for (let i = 0; i < 50; i++) {
    const windows = electronApp.windows();
    if (windows.length > 0) {
      window = windows[0];
      break;
    }
    // Briefly yield execution back to the Node event loop (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Fallback to standard tracking if the polling interval misses it
  if (!window) {
    window = await electronApp.firstWindow();
  }

  // Wait until the DOM content tree is fully parsed and interactive
  await window.waitForLoadState('domcontentloaded');

  const title = await window.title();
  console.log(`Loaded app window with title: ${title}`);

  // Safely kill the application wrapper context
  await electronApp.close();
});
