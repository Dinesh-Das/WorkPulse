/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  chooseDirectory: () => ipcRenderer.invoke('choose-directory'),
  openPath: (path) => ipcRenderer.invoke('open-path', path),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, data) => ipcRenderer.invoke('write-file', { filePath: path, data }),
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: () => ipcRenderer.invoke('import-data'),
  getDefaultPath: () => ipcRenderer.invoke('get-default-path')
});
