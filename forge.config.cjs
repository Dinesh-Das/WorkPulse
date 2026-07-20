/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  packagerConfig: {
    executableName: 'work-pulse',
    name: 'WorkPulse',
    icon: './public/icon' // Forge will look for .ico or .png
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
      platforms: ['darwin', 'win32'],
    },
  ],
};
