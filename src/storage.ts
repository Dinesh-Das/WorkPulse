/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Task } from './types';

const STORAGE_KEY = 'work_project_tracker_data';

interface AppData {
  projects: Project[];
  tasks: Task[];
}

export const loadData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { projects: [], tasks: [] };
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load data', e);
    return { projects: [], tasks: [] };
  }
};

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
