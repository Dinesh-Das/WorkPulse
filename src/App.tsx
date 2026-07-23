/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, TaskStatus, TaskType, TaskPriority, Activity, ActivityType } from './types';
import { storageService, StorageConfig, AppData, isElectron } from './services/storageService';
import { exportToExcel } from './exportUtils';
import { ProjectForm } from './components/ProjectForm';
import { TaskForm } from './components/TaskForm';
import { KanbanBoard } from './components/KanbanBoard';
import { SetupScreen } from './components/SetupScreen';
import { SettingsPage } from './components/SettingsPage';
import { TeamWorkload } from './components/TeamWorkload';
import { ActivityLog } from './components/ActivityLog';
import { PriorityDistribution } from './components/PriorityDistribution';
import { HighlightText } from './components/HighlightText';
import { 
  Search,
  Filter,
  LayoutDashboard, 
  Briefcase, 
  CheckCircle2, 
  Trello,
  Plus, 
  FileDown, 
  Clock, 
  Users, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertCircle,
  Settings,
  Link2,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    [TaskStatus.OPEN]: 'bg-blue-50 text-blue-700 border-blue-100',
    [TaskStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    [TaskStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-100',
    [TaskStatus.SIGNOFF_RECEIVED]: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    [TaskStatus.MOVED_TO_PRD]: 'bg-purple-50 text-purple-700 border-purple-100',
    [TaskStatus.TEST]: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    [TaskStatus.COMPLETED]: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    [TaskPriority.LOW]: 'bg-gray-50 text-gray-600 border-gray-100',
    [TaskPriority.MEDIUM]: 'bg-blue-50 text-blue-600 border-blue-100',
    [TaskPriority.HIGH]: 'bg-orange-50 text-orange-600 border-orange-100',
    [TaskPriority.CRITICAL]: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[priority] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {priority}
    </span>
  );
};

export default function App() {
  const [config, setConfig] = useState<StorageConfig | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'kanban' | 'settings'>('dashboard');
  const [showArchived, setShowArchived] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<{
    key: 'dueDate' | 'priority' | 'status' | 'name';
    direction: 'asc' | 'desc';
  } | null>({ key: 'dueDate', direction: 'asc' });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  const toggleAllTasksSelection = (filteredTasks: Task[]) => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    }
  };

  const logActivity = (type: ActivityType, entityId: string, entityName: string, details?: string) => {
    const newActivity: Activity = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      type,
      entityId,
      entityName,
      details,
      timestamp: Date.now()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 100));
  };

  const bulkDeleteTasks = () => {
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      const deletedTasks = tasks.filter(t => selectedTaskIds.includes(t.id));
      setTasks(tasks.filter(t => !selectedTaskIds.includes(t.id)));
      deletedTasks.forEach(task => logActivity(ActivityType.TASK_DELETED, task.id, task.name));
      setSelectedTaskIds([]);
    }
  };

  const bulkUpdateStatus = (status: TaskStatus) => {
    const updatedTaskIds = tasks.filter(t => selectedTaskIds.includes(t.id)).map(t => t.id);
    setTasks(tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, status } : t));
    updatedTaskIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task) logActivity(ActivityType.TASK_UPDATED, id, task.name, `Bulk update status: ${status}`);
    });
    setSelectedTaskIds([]);
  };

  const bulkUpdatePriority = (priority: TaskPriority) => {
    const updatedTaskIds = tasks.filter(t => selectedTaskIds.includes(t.id)).map(t => t.id);
    setTasks(tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, priority } : t));
    updatedTaskIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task) logActivity(ActivityType.TASK_UPDATED, id, task.name, `Bulk update priority: ${priority}`);
    });
    setSelectedTaskIds([]);
  };

  const bulkArchiveTasks = (archive: boolean) => {
    const updatedTaskIds = tasks.filter(t => selectedTaskIds.includes(t.id)).map(t => t.id);
    setTasks(tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, isArchived: archive } : t));
    updatedTaskIds.forEach(id => {
      const task = tasks.find(t => t.id === id);
      if (task) logActivity(archive ? ActivityType.TASK_ARCHIVED : ActivityType.TASK_UNARCHIVED, id, task.name);
    });
    setSelectedTaskIds([]);
  };

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const toggleSort = (key: 'dueDate' | 'priority' | 'status' | 'name') => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ column }: { column: 'dueDate' | 'priority' | 'status' | 'name' }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-3 h-3 text-blue-600" /> : 
      <ChevronDown className="w-3 h-3 text-blue-600" />;
  };

  // 1. Initial Storage Config Check
  useEffect(() => {
    storageService.getConfig().then(cfg => {
      if (cfg) {
        setConfig(cfg);
        if (!isElectron()) {
          setIsInitialized(true);
        }
      } else if (!isElectron()) {
        // Default config for web preview
        const defaultConfig: StorageConfig = {
          type: 'json',
          location: 'browser',
          isInitialized: true
        };
        setConfig(defaultConfig);
        setIsInitialized(true);
      }
    });
  }, []);

  // 2. Load Data when Config is ready
  useEffect(() => {
    if (config?.isInitialized) {
      storageService.loadData(config).then(data => {
        setProjects(data.projects);
        setTasks(data.tasks);
        setActivities(data.activities || []);
        setIsInitialized(true);
      });
    }
  }, [config]);

  // 3. Auto-save whenever projects/tasks change (Debounced if needed, but here simple)
  useEffect(() => {
    if (config?.isInitialized && isInitialized) {
      storageService.saveData(config, { projects, tasks, activities, version: 1 });
    }
  }, [projects, tasks, activities, config, isInitialized]);

  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => !t.isArchived);
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pendingTasks = activeTasks.filter(t => t.status === TaskStatus.PENDING).length;
    const overdueTasks = activeTasks.filter(t => 
      t.status !== TaskStatus.COMPLETED && 
      t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    return { totalTasks, completedTasks, pendingTasks, overdueTasks };
  }, [tasks]);

  const isBlocked = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return task.dependencies.some(depId => {
      const depTask = tasks.find(t => t.id === depId);
      return depTask && depTask.status !== TaskStatus.COMPLETED;
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesArchive = !!t.isArchived === showArchived;
      return matchesSearch && matchesStatus && matchesArchive;
    });

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];

        if (sortConfig.key === 'priority') {
          const priorityMap = {
            [TaskPriority.LOW]: 1,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.HIGH]: 3,
            [TaskPriority.CRITICAL]: 4,
          };
          aVal = priorityMap[a.priority as TaskPriority] || 0;
          bVal = priorityMap[b.priority as TaskPriority] || 0;
        }

        if (sortConfig.key === 'status') {
          const statusMap: Record<TaskStatus, number> = {
            [TaskStatus.OPEN]: 1,
            [TaskStatus.IN_PROGRESS]: 2,
            [TaskStatus.PENDING]: 3,
            [TaskStatus.TEST]: 4,
            [TaskStatus.SIGNOFF_RECEIVED]: 5,
            [TaskStatus.MOVED_TO_PRD]: 6,
            [TaskStatus.COMPLETED]: 7,
          };
          aVal = statusMap[a.status as TaskStatus] || 0;
          bVal = statusMap[b.status as TaskStatus] || 0;
        }

        if (sortConfig.key === 'dueDate') {
          aVal = new Date(aVal || 0).getTime();
          bVal = new Date(bVal || 0).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tasks, searchQuery, statusFilter, sortConfig, showArchived]);

  const handleSaveProject = (project: Project) => {
    const existingProject = projects.find(p => p.id === project.id);
    if (existingProject) {
      setProjects(projects.map(p => p.id === project.id ? project : p));
      logActivity(ActivityType.PROJECT_UPDATED, project.id, project.name);
    } else {
      setProjects([project, ...projects]);
      logActivity(ActivityType.PROJECT_CREATED, project.id, project.name);
    }
    setIsProjectFormOpen(false);
    setEditingProject(undefined);
  };

  const handleSaveTask = (task: Task) => {
    const existingTask = tasks.find(t => t.id === task.id);
    if (existingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
      
      let details = `Status: ${task.status}`;
      if (existingTask.status !== task.status) {
        details = `Status changed: ${existingTask.status} → ${task.status}`;
      }
      logActivity(ActivityType.TASK_UPDATED, task.id, task.name, details);
    } else {
      setTasks([task, ...tasks]);
      logActivity(ActivityType.TASK_CREATED, task.id, task.name);
    }
    setIsTaskFormOpen(false);
    setEditingTask(undefined);
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete && confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
      logActivity(ActivityType.TASK_DELETED, id, taskToDelete.name);
    }
  };

  const archiveTask = (id: string, archive: boolean) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (taskToUpdate) {
      setTasks(tasks.map(t => t.id === id ? { ...t, isArchived: archive } : t));
      logActivity(archive ? ActivityType.TASK_ARCHIVED : ActivityType.TASK_UNARCHIVED, id, taskToUpdate.name);
    }
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete && confirm('Deleting a project will NOT delete its tasks. Proceed?')) {
      setProjects(projects.filter(p => p.id !== id));
      logActivity(ActivityType.PROJECT_DELETED, id, projectToDelete.name);
    }
  };

  const handleSetupComplete = (newConfig: StorageConfig) => {
    storageService.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const handleImport = (newData: AppData) => {
    setProjects(newData.projects);
    setTasks(newData.tasks);
  };

  if (!config && isElectron()) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col p-6 z-40">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800">WorkPulse</span>
        </div>

        <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'projects', label: 'Projects', icon: Briefcase },
                { id: 'tasks', label: 'All Tasks', icon: CheckCircle2 },
                { id: 'kanban', label: 'Kanban Board', icon: Trello },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSearchQuery('');
                    setStatusFilter('All');
                    setSelectedTaskIds([]);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
        </div>

        <div className="mt-auto space-y-2">
          <button 
            onClick={() => exportToExcel(projects, tasks)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-md"
          >
            <FileDown className="w-4 h-4" />
            Quick Excel Export
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="lg:pl-64 min-h-screen">
        <header className="sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex items-center justify-between z-30">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, here's what's happening.</p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'settings' && (
              <button 
                onClick={() => setIsTaskFormOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Log Task
              </button>
            )}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Tasks', value: stats.totalTasks, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Blocked / Pending', value: stats.pendingTasks, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Overdue', value: stats.overdueTasks, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Team Workload Chart */}
                  <div className="lg:col-span-2">
                    <TeamWorkload tasks={tasks.filter(t => !t.isArchived)} />
                  </div>

                  {/* Priority Distribution */}
                  <div className="lg:col-span-1">
                    <PriorityDistribution tasks={tasks.filter(t => !t.isArchived)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Activity Log */}
                  <div className="lg:col-span-1">
                    <ActivityLog activities={activities} />
                  </div>

                  {/* Recent Tasks */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Recent Tasks</h3>
                      <button onClick={() => setActiveTab('tasks')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                      {tasks.filter(t => !t.isArchived).slice(0, 5).map(task => (
                        <div key={task.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group relative overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-1" 
                            style={{ backgroundColor: projects.find(p => p.id === task.projectId)?.color || 'transparent' }} 
                          />
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.name}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span>{task.type}</span>
                                <span>•</span>
                                <span>Due {new Date(task.dueDate || '').toLocaleDateString()}</span>
                                {task.projectId && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-600 font-medium">
                                      {projects.find(p => p.id === task.projectId)?.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="p-10 text-center text-gray-400 italic">No tasks logged yet. Start by adding one!</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'kanban' && (
              <motion.div 
                key="kanban"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Task Board</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        showArchived 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      {showArchived ? 'View Active' : 'View Archive'}
                    </button>
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <KanbanBoard 
                  tasks={filteredTasks}
                  allTasks={tasks}
                  projects={projects}
                  searchQuery={searchQuery}
                  onTaskUpdate={handleSaveTask}
                  onEditTask={(task) => { setEditingTask(task); setIsTaskFormOpen(true); }}
                  onDeleteTask={deleteTask}
                  onArchiveTask={archiveTask}
                />
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div 
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Manage Initiatives</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        {Object.values(TaskStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => setIsProjectFormOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingProject(project); setIsProjectFormOpen(true); }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProject(project.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-6">{project.description}</p>
                        
                        <div className="space-y-4">
                          {project.stakeholder && (
                            <div className="flex items-center gap-3 text-sm">
                              <Users className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-700">{project.stakeholder.name}</p>
                                <p className="text-xs text-gray-500">{project.stakeholder.role} (Reports to {project.stakeholder.reportsTo})</p>
                              </div>
                            </div>
                          )}
                          {(project.startDate || project.targetEndDate) && (
                            <div className="flex items-center gap-3 text-sm">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <p className="text-gray-600">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} — {project.targetEndDate ? new Date(project.targetEndDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {tasks.filter(t => t.projectId === project.id).length} Linked Tasks
                        </span>
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                  ))}
                </div>
                {filteredProjects.length === 0 && (
                  <div className="p-20 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold">No projects found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div 
                key="tasks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">All Tasks</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        showArchived 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      {showArchived ? 'View Active' : 'View Archive'}
                    </button>
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        {Object.values(TaskStatus).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => exportToExcel(projects, tasks)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100"
                      title="Export to Excel"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 w-10">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                            onChange={() => toggleAllTasksSelection(filteredTasks)}
                          />
                        </th>
                        <th 
                          className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group/h"
                          onClick={() => toggleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Task Name
                            <SortIcon column="name" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group/h"
                          onClick={() => toggleSort('dueDate')}
                        >
                          <div className="flex items-center gap-2">
                            Due Date
                            <SortIcon column="dueDate" />
                          </div>
                        </th>
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4">Type</th>
                        <th 
                          className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group/h"
                          onClick={() => toggleSort('priority')}
                        >
                          <div className="flex items-center gap-2">
                            Priority
                            <SortIcon column="priority" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group/h"
                          onClick={() => toggleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            <SortIcon column="status" />
                          </div>
                        </th>
                        <th className="px-6 py-4">Stakeholder</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredTasks.map(task => {
                        const project = projects.find(p => p.id === task.projectId);
                        const blocked = isBlocked(task);
                        const isSelected = selectedTaskIds.includes(task.id);
                        return (
                          <tr key={task.id} className={`hover:bg-gray-50/50 transition-colors group ${blocked ? 'bg-amber-50/20' : ''} ${isSelected ? 'bg-blue-50/50' : ''}`}>
                            <td className="px-6 py-4">
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={isSelected}
                                onChange={() => toggleTaskSelection(task.id)}
                              />
                            </td>
                            <td className="px-6 py-4 relative">
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1" 
                                style={{ backgroundColor: project?.color || 'transparent' }} 
                              />
                              <div className="flex flex-col">
                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                  <HighlightText text={task.name} highlight={searchQuery} />
                                  {blocked && <Link2 className="w-3.5 h-3.5 text-amber-500" title="Task is blocked by dependencies" />}
                                </p>
                                {blocked && (
                                  <p className="text-[10px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Blocked by {task.dependencies?.filter(id => tasks.find(t => t.id === id && t.status !== TaskStatus.COMPLETED)).length} tasks
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm ${task.projectId ? 'text-indigo-600 font-medium' : 'text-gray-400 italic'}`}>
                                {task.projectId ? projects.find(p => p.id === task.projectId)?.name : 'Standalone'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 uppercase">
                                {task.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <PriorityBadge priority={task.priority} />
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={task.status} />
                            </td>
                            <td className="px-6 py-4">
                              {task.stakeholder ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                    {task.stakeholder.name.charAt(0)}
                                  </div>
                                  <span className="text-sm text-gray-700">{task.stakeholder.name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">No Stakeholder</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => { setEditingTask(task); setIsTaskFormOpen(true); }}
                                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-all border border-transparent hover:border-gray-200"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => archiveTask(task.id, !task.isArchived)}
                                  className={`p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 ${
                                    task.isArchived ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-amber-600'
                                  }`}
                                  title={task.isArchived ? 'Unarchive' : 'Archive'}
                                >
                                  {task.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                </button>
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-600 transition-all border border-transparent hover:border-gray-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTasks.length === 0 && (
                    <div className="p-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-gray-900 font-bold">No tasks found</h3>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && config && (
              <SettingsPage 
                config={config} 
                onUpdateConfig={handleSetupComplete} 
                data={{ projects, tasks, version: 1 }}
                onImport={handleImport}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Forms */}
      <AnimatePresence>
        {isProjectFormOpen && (
          <ProjectForm 
            onSave={handleSaveProject} 
            onCancel={() => { setIsProjectFormOpen(false); setEditingProject(undefined); }} 
            initialData={editingProject}
          />
        )}
        {isTaskFormOpen && (
          <TaskForm 
            onSave={handleSaveTask} 
            onCancel={() => { setIsTaskFormOpen(false); setEditingTask(undefined); }} 
            projects={projects}
            allTasks={tasks}
            initialData={editingTask}
          />
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedTaskIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-6 border border-gray-800"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-gray-700">
              <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {selectedTaskIds.length}
              </div>
              <span className="text-sm font-medium">Tasks Selected</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-500">Status</span>
                <select 
                  className="bg-gray-800 border-none rounded text-xs py-1 px-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  onChange={(e) => bulkUpdateStatus(e.target.value as TaskStatus)}
                  value=""
                >
                  <option value="" disabled>Change Status...</option>
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-500">Priority</span>
                <select 
                  className="bg-gray-800 border-none rounded text-xs py-1 px-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  onChange={(e) => bulkUpdatePriority(e.target.value as TaskPriority)}
                  value=""
                >
                  <option value="" disabled>Change Priority...</option>
                  {Object.values(TaskPriority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={bulkDeleteTasks}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>

              <button 
                onClick={() => bulkArchiveTasks(!showArchived)}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-amber-500/20"
              >
                {showArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                {showArchived ? 'Restore Selected' : 'Archive Selected'}
              </button>

              <button 
                onClick={() => setSelectedTaskIds([])}
                className="text-xs text-gray-400 hover:text-white underline underline-offset-4"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
