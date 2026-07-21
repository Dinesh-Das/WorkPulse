import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Task, Project, TaskStatus, TaskPriority } from './types';

export const exportToExcel = async (projects: Project[], tasks: Task[]) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Task Manager';
  workbook.created = new Date();

  // --- Sheet 1: Detailed Tasks ---
  const taskSheet = workbook.addWorksheet('Task Details');
  
  // Define columns
  taskSheet.columns = [
    { header: 'Task Name', key: 'name', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Priority', key: 'priority', width: 15 },
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Project', key: 'project', width: 25 },
    { header: 'Stakeholder Name', key: 'shName', width: 20 },
    { header: 'Stakeholder Role', key: 'shRole', width: 20 },
    { header: 'Stakeholder Reports To', key: 'shReportsTo', width: 20 },
    { header: 'Business Impact', key: 'businessImpact', width: 30 },
    { header: 'Learnings', key: 'learnings', width: 30 },
    { header: 'Challenges', key: 'challenges', width: 30 },
    { header: 'Dependencies', key: 'dependencies', width: 40 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  // Style header row
  const headerRow = taskSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' }, // blue-500
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Add data
  tasks.forEach(task => {
    const project = projects.find(p => p.id === task.projectId);
    const deps = task.dependencies?.map(id => tasks.find(t => t.id === id)?.name || 'Unknown').join(', ') || 'None';
    
    taskSheet.addRow({
      name: task.name,
      status: task.status,
      priority: task.priority,
      type: task.type,
      dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
      project: project?.name || 'Standalone',
      shName: task.stakeholder?.name || 'N/A',
      shRole: task.stakeholder?.role || 'N/A',
      shReportsTo: task.stakeholder?.reportsTo || 'N/A',
      businessImpact: task.businessImpact || '',
      learnings: task.learnings || '',
      challenges: task.challenges || '',
      dependencies: deps,
      createdAt: new Date(task.createdAt).toLocaleString(),
    });
  });

  // Apply row styling and alignment
  taskSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle', wrapText: true };
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' }, // gray-50
        };
      }
      // Add borders to cells
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    }
  });

  // --- Sheet 2: Summary & Statistics ---
  const statsSheet = workbook.addWorksheet('Summary & Stats');
  
  statsSheet.columns = [
    { header: 'Statistic', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 25 },
  ];

  // Style stats header
  const statsHeader = statsSheet.getRow(1);
  statsHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
  statsHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' }, // emerald-500
  };
  statsHeader.height = 25;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const overdueTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate && new Date(t.dueDate).getTime() < new Date().getTime()).length;
  const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) + '%' : '0%';

  statsSheet.addRow({ metric: 'GENERAL METRICS', value: '' }).font = { bold: true, size: 14 };
  statsSheet.addRow({ metric: 'Total Logged Tasks', value: totalTasks });
  statsSheet.addRow({ metric: 'Completed Tasks', value: completedTasks });
  statsSheet.addRow({ metric: 'Overdue Tasks', value: overdueTasks });
  statsSheet.addRow({ metric: 'Completion Rate', value: completionRate });
  statsSheet.addRow({}); // Spacer

  // Priority Breakdown
  statsSheet.addRow({ metric: 'PRIORITY DISTRIBUTION', value: '' }).font = { bold: true, size: 14 };
  Object.values(TaskPriority).forEach(p => {
    const count = tasks.filter(t => t.priority === p).length;
    statsSheet.addRow({ metric: p, value: count });
  });
  statsSheet.addRow({}); // Spacer

  // Status Breakdown
  statsSheet.addRow({ metric: 'STATUS DISTRIBUTION', value: '' }).font = { bold: true, size: 14 };
  Object.values(TaskStatus).forEach(s => {
    const count = tasks.filter(t => t.status === s).length;
    statsSheet.addRow({ metric: s, value: count });
  });
  statsSheet.addRow({}); // Spacer

  // Project Insights
  statsSheet.addRow({ metric: 'PROJECT BREAKDOWN', value: '' }).font = { bold: true, size: 14 };
  projects.forEach(p => {
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    const pCompleted = projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    statsSheet.addRow({ metric: p.name, value: `${pCompleted}/${projectTasks.length} tasks done` });
  });

  // Style stats rows
  statsSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle' };
      if (row.getCell(1).font?.bold) {
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F4F6' },
        };
      }
    }
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Work_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
