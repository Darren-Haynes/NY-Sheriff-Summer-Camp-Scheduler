import path from 'path';
import type { ForgeConfig } from '@electron-forge/shared-types';
import MakerMSI from '@electron-forge/maker-wix';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

// === INJECT TEST ENVIRONMENT FLAG FOR WEBPACK ===
if (process.env.TEST_RUN === 'true') {
  process.env.NODE_ENV = 'test';
}

// The packager names the app binary after its `name` (with spaces). The deb and rpm makers look
// for a binary named after package.json's `name` instead, so they are told where it really is.
const APP_NAME = 'NY Sheriff Summer Camp Scheduler';

const config: ForgeConfig = {
  packagerConfig: {
    name: APP_NAME,
    asar: true,
    icon: './assets/icons/sheriff-badge-msi.ico',
    // macOS only; ignored on other platforms.
    //
    // Electron ships ad-hoc signed, but the packager then renames the app and rewrites
    // Info.plist, which leaves a stale signature. On Apple Silicon macOS reports an app with a
    // broken signature as "damaged and can't be opened". Signing again here, after those edits,
    // gives a valid ad-hoc signature. It is not a Developer ID signature, so users still get a
    // first-launch prompt, but the app is no longer reported as damaged.
    osxSign: {
      identity: '-', // ad-hoc: no certificate needed
      identityValidation: false, // '-' is not a keychain identity, so skip the lookup
      // The hardened runtime is only needed for notarization. With an ad-hoc signature it can
      // stop Electron from loading its own frameworks (library validation), so leave it off.
      optionsForFile: () => ({ hardenedRuntime: false }),
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerMSI(
      {
        description: 'NY Sheriff Institute Summer Camp Scheduler',
        exe: `${APP_NAME}.exe`,
        icon: './assets/icons/sheriff-badge-msi.ico',
        ui: {
          images: {
            banner: path.resolve(__dirname, 'assets/banner-msi.jpeg'),
          },
          chooseDirectory: true,
        },
        manufacturer: 'Darren Haynes',
        programFilesFolderName: 'NY Summer Camp',
        // No `version` here: the MSI maker takes it from package.json. A hard-coded value
        // here would override it, and every release would ship an MSI labelled 1.0.0.
      },
      ['win32']
    ),
    // The DMG volume name defaults to the app name, but macOS limits it to 27 characters and
    // this app's name is 32. `title` sets the volume name; the file name is unaffected.
    new MakerDMG({ title: 'NY Sheriff Camp Scheduler' }, ['darwin']),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({ options: { bin: APP_NAME } }, ['linux']),
    new MakerDeb({ options: { bin: APP_NAME } }, ['linux']),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/main/preload.ts',
              config: {
                ...mainConfig,
                target: 'electron-preload',
              },
            },
          },
        ],
      },
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
