import type { ForgeConfig } from '@electron-forge/shared-types';
import MakerMSI from '@electron-forge/maker-wix';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDMG } from '@electron-forge/maker-dmg';
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

const config: ForgeConfig = {
  packagerConfig: {
    name: 'NY Sheriff Summer Camp Scheduler',
    asar: true,
  },
  rebuildConfig: {},
  // ... rest of your existing makers config remains untouched
  makers: [
    new MakerMSI(
      {
        description: 'NY Sheriff Institute Summer Camp Scheduler',
        exe: 'NY Sheriff Summer Camp Scheduler',
        icon: './assets/icons/sheriff-badge-msi.ico',
        ui: {
          images: {
            banner:
              'C:/Users/darre/Projects/NY-Sheriff-Summer-Camp-Scheduler/assets/banner-msi.jpeg',
          },
          chooseDirectory: true,
        },
        manufacturer: 'Darren Haynes',
        programFilesFolderName: 'NY Summer Camp',
        version: '1.0.0',
      },
      ['win32']
    ),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}, ['linux']),
    new MakerDeb({}, ['linux']),
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
