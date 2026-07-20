/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Project, Task, TaskStatus } from './types';

export const exportToExcel = (projects: Project[], tasks: Task[]) => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const statusCounts = Object.values(TaskStatus).map(status => ({
    Status: status,
    Count: tasks.filter(t => t.status === status).length
  }));

  const overdueCount = tasks.filter(t => 
    t.status !== TaskStatus.COMPLETED && 
    t.dueDate && 
    new Date(t.dueDate) < new Date()
  ).length;

  const summaryData = [
    ['Work Summary Report'],
    ['Generated On', new Date().toLocaleDateString()],
    [''],
    ['Task Status Breakdown'],
    ...statusCounts.map(s => [s.Status, s.Count]),
    [''],
    ['Critical Metrics'],
    ['Total Projects', projects.length],
    ['Total Tasks', tasks.length],
    ['Overdue Tasks', overdueCount]
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Projects Sheet
  const projectsData = projects.map(p => ({
    'Project Name': p.name,
    'Description': p.description,
    'Stakeholder': p.stakeholder.name,
    'Stakeholder Role': p.stakeholder.role,
    'Reports To': p.stakeholder.reportsTo,
    'Start Date': p.startDate,
    'Target End Date': p.targetEndDate,
    'Status': p.status,
    'Business Impact': p.businessImpact,
    'Learnings': p.learnings,
    'Challenges': p.challenges
  }));
  const projectsSheet = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

  // Tasks Sheet
  const tasksData = tasks.map(t => {
    const project = projects.find(p => p.id === t.projectId);
    return {
      'Task Name': t.name,
      'Project': project ? project.name : 'Standalone',
      'Type': t.type,
      'Priority': t.priority,
      'Status': t.status,
      'Stakeholder': t.stakeholder.name,
      'Start Date': t.startDate,
      'Due Date': t.dueDate,
      'Completed Date': t.completedDate || 'N/A',
      'Description': t.description,
      'Business Impact': t.businessImpact || 'N/A',
      'Learnings': t.learnings || 'N/A',
      'Challenges': t.challenges || 'N/A'
    };
  });
  const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');

  // Generate and download
  XLSX.writeFile(workbook, `Work_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
