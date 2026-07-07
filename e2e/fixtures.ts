import { test as base, _electron as electron, Page, ElectronApplication } from '@playwright/test';
import path from 'path';
import * as fs from 'fs';

// Define a unified interface for our fixtures
type ElectronFixtures = {
  appContext: {
    electronApp: ElectronApplication;
    electronWindow: Page;
  };
};

export const test = base.extend<ElectronFixtures>({
  appContext: async ({}, use, testInfo) => {
    let electronExecutablePath = '';

    // Resolve the correct prebuilt Electron executable per platform
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

    // Dynamic directory scanning for Electron Forge's platform output
    let webpackMainEntry = path.join(__dirname, '../.webpack/main/index.js');
    const arm64Entry = path.join(__dirname, '../.webpack/arm64/main/index.js');
    const x64Entry = path.join(__dirname, '../.webpack/x64/main/index.js');

    if (fs.existsSync(arm64Entry)) {
      webpackMainEntry = arm64Entry; // Apple Silicon Mac
    } else if (fs.existsSync(x64Entry)) {
      webpackMainEntry = x64Entry; // GitHub Actions Ubuntu runner (or Intel Mac)
    }

    const electronApp = await electron.launch({
      executablePath: electronExecutablePath,
      args: [webpackMainEntry], // Target the programmatically detected main bundle
    });

    let window: Page | undefined;
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

    // Pass the built Electron instances down to the test block
    await use({ electronApp, electronWindow: window });

    // === AFTER-TEST COVERAGE TEARDOWN ===
    try {
      // Extract the coverage payload directly from your Electron Renderer window
      const coverage = await window.evaluate(() => (window as any).__coverage__);

      if (coverage) {
        // Resolve .nyc_output relative to the workspace root directory
        const dir = path.join(process.cwd(), '.nyc_output');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Generate a safe unique name based on the executing test's structure
        const safeTitle = testInfo.titlePath
          .join('-')
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        const fileName = `coverage-${safeTitle}.json`;

        fs.writeFileSync(path.join(dir, fileName), JSON.stringify(coverage));
      } else {
        console.warn(
          '⚠️ window.__coverage__ is undefined. Verify that Electron Forge is parsing your React files with babel-plugin-istanbul!'
        );
      }
    } catch (e) {
      console.error('❌ Failed to grab runtime coverage data from Electron window:', e);
    }

    // Close app after test is completed and coverage is saved
    await electronApp.close();
  },
});

export { expect } from '@playwright/test';
