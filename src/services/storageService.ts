/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Task } from '../types';

export interface AppData {
  projects: Project[];
  tasks: Task[];
  version: number;
}

export interface StorageConfig {
  type: 'json' | 'sqlite'; // For now we focus on JSON
  location: string;
  isInitialized: boolean;
}

const WEB_STORAGE_KEY = 'workpulse_web_data';
const CONFIG_KEY = 'workpulse_config';

declare global {
  interface Window {
    todoAPI: {
      getAppVersion: () => Promise<string>;
      chooseDirectory: () => Promise<string | null>;
      openPath: (path: string) => Promise<void>;
      readFile: (path: string) => Promise<any>;
      writeFile: (path: string, data: any) => Promise<{ success: boolean; error?: string }>;
      exportData: (data: any) => Promise<{ success: boolean; path?: string }>;
      importData: () => Promise<{ success: boolean; data?: any }>;
      getDefaultPath: () => Promise<string>;
    };
  }
}

export const isElectron = () => !!window.todoAPI;

export const storageService = {
  async getConfig(): Promise<StorageConfig | null> {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  async saveConfig(config: StorageConfig) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  async loadData(config: StorageConfig): Promise<AppData> {
    if (isElectron()) {
      const data = await window.todoAPI.readFile(`${config.location}/todos.json`);
      if (data) return data;
    } else {
      const stored = localStorage.getItem(WEB_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
    return { projects: [], tasks: [], version: 1 };
  },

  async saveData(config: StorageConfig, data: AppData) {
    if (isElectron()) {
      await window.todoAPI.writeFile(`${config.location}/todos.json`, data);
    } else {
      localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(data));
    }
  },

  async exportData(data: AppData) {
    if (isElectron()) {
      return window.todoAPI.exportData(data);
    } else {
      // Fallback web export
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "workpulse_export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      return { success: true };
    }
  },

  async importData() {
    if (isElectron()) {
      return window.todoAPI.importData();
    } else {
      // For web, we usually handle this via <input type="file"> in components
      return { success: false, error: 'Web import handled via UI' };
    }
  }
};
