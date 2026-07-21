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
      /^\/\.env/
    ]
    // icon: './public/icon' // Forge will look for .ico or .png
  },
  rebuildConfig: {},
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
