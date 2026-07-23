/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  packagerConfig: {
    executableName: 'work-pulse',
    name: 'WorkPulse',
    asar: true,
    ignore: [
      /^\/src($|\/)/,
      /^\/public($|\/)/,
      /^\/assets($|\/)/,
      /^\/scripts($|\/)/,
      /^\/tsconfig\.json$/,
      /^\/vite\.config\.ts$/,
      /^\/forge\.config\.cjs$/,
      /^\/metadata\.json$/,
      /^\/\.gitignore$/,
      /^\/README\.md$/,
      /^\/out($|\/)/,
      /^\/bun\.lock$/,
      /^\/package-lock\.json$/,
      /^\/\.env/,
      // Exclude extra locales to save space
      /locales\/(?!(en-US|en)\.pak$).*\.pak$/
    ]
    // icon: './public/icon' // Forge will look for .ico or .png
  },
  rebuildConfig: {},
  hooks: {
    postPackage: async (forgeConfig, options) => {
      const fs = require('fs/promises');
      const path = require('path');
      const { outputPaths } = options;
      
      for (const outputPath of outputPaths) {
        const localesPath = path.join(outputPath, 'locales');
        try {
          const files = await fs.readdir(localesPath);
          for (const file of files) {
            if (!file.endsWith('en-US.pak') && !file.endsWith('en.pak')) {
              await fs.unlink(path.join(localesPath, file));
            }
          }
          console.log(`Pruned locales in ${outputPath}`);
        } catch (e) {
          console.warn(`Could not prune locales in ${outputPath}:`, e.message);
        }

        try {
          await fs.unlink(path.join(outputPath, 'LICENSES.chromium.html'));
          console.log(`Removed chromium licenses in ${outputPath}`);
        } catch (e) {
          // ignore
        }
      }
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'WorkPulse',
        authors: 'WorkPulse Team',
        description: 'Personal Work Initiative Tracker'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'linux'],
    },
  ],
};
