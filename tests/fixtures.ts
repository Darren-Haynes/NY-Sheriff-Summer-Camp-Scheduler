import { test as base, _electron as electron, Page, ElectronApplication } from '@playwright/test';
import path from 'path';

// Define a unified interface for our fixtures
type ElectronFixtures = {
  appContext: {
    electronApp: ElectronApplication;
    electronWindow: Page;
  };
};

export const test = base.extend<ElectronFixtures>({
  appContext: async ({}, use) => {
    let electronExecutablePath = '';

    if (process.platform === 'darwin') {
      electronExecutablePath = path.join(
        __dirname,
        '../node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'
      );
    } else if (process.platform === 'win32') {
      electronExecutablePath = path.join(__dirname, '../node_modules/electron/dist/electron.exe');
    } else {
      electronExecutablePath = path.join(__dirname, '../node_modules/electron/dist/electron');
    }

    const electronApp = await electron.launch({
      executablePath: electronExecutablePath,
      args: [path.join(__dirname, '../.webpack/arm64/main/index.js')],
    });

    let window;
    for (let i = 0; i < 50; i++) {
      const windows = electronApp.windows();
      if (windows.length > 0) {
        window = windows[0];
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (!window) {
      window = await electronApp.firstWindow();
    }

    await window.waitForLoadState('domcontentloaded');

    // Correct Fix: Pass BOTH control objects down in a single fixture bundle
    await use({ electronApp, electronWindow: window });

    // Clean up cleanly after tests complete
    await electronApp.close();
  },
});

export { expect } from '@playwright/test';
