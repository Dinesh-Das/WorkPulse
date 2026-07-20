/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TaskStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  PENDING = 'Pending',
  SIGNOFF_RECEIVED = 'Signoff Received',
  MOVED_TO_PRD = 'Moved to PRD',
  TEST = 'Test',
  COMPLETED = 'Completed'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum TaskType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  ONE_OFF = 'One-off'
}

export interface Stakeholder {
  name: string;
  role: string;
  reportsTo: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stakeholder: Stakeholder;
  startDate: string;
  targetEndDate: string;
  status: string; // Manually set or derived
  businessImpact: string;
  learnings: string;
  challenges: string;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId?: string; // Blank if standalone
  name: string;
  description: string;
  type: TaskType;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  stakeholder: Stakeholder;
  businessImpact?: string;
  learnings?: string;
  challenges?: string;
  dependencies?: string[];
  color?: string;
  createdAt: number;
}
