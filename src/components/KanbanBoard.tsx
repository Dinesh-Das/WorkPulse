/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TaskStatus, TaskPriority, Project } from '../types';
import { Edit2, Trash2, Clock, Users, AlertCircle, Link2, Archive, ArchiveRestore, Calendar } from 'lucide-react';

import { HighlightText } from './HighlightText';
import { DaysRemainingBadge } from './DaysRemainingBadge';

interface KanbanBoardProps {
  tasks: Task[];
  allTasks: Task[];
  projects: Project[];
  searchQuery?: string;
  onTaskUpdate: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onArchiveTask: (id: string, archive: boolean) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  allTasks,
  projects,
  searchQuery = '',
  onTaskUpdate,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = Object.values(TaskStatus);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    // Check if dragging over a column or another task
    const isOverAColumn = columns.includes(overId as TaskStatus);
    const overTask = tasks.find((t) => t.id === overId);

    const newStatus = isOverAColumn ? (overId as TaskStatus) : overTask?.status;

    if (newStatus && activeTaskObj.status !== newStatus) {
      onTaskUpdate({ ...activeTaskObj, status: newStatus });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
        {columns.map((status) => (
          <div key={status} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 dark:text-slate-300">
                {status}
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-500">
                  {tasks.filter((t) => t.status === status).length}
                </span>
              </h3>
            </div>
            
            <SortableContext
              id={status}
              items={tasks.filter((t) => t.status === status).map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id={status}
                className="bg-gray-50/50 rounded-2xl p-3 min-h-[200px] border border-dashed border-gray-200 dark:bg-slate-900/50 dark:border-slate-800"
              >
                <AnimatePresence>
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        allTasks={allTasks}
                        project={projects.find((p) => p.id === task.projectId)}
                        searchQuery={searchQuery}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task.id)}
                        onArchive={(archive) => onArchiveTask(task.id, archive)}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="w-80">
            <TaskCard 
              task={activeTask}
              allTasks={allTasks}
              project={projects.find((p) => p.id === activeTask.projectId)}
              searchQuery={searchQuery}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface SortableTaskCardProps {
  task: Task;
  allTasks: Task[];
  project?: Project;
  searchQuery?: string;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: (archive: boolean) => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  allTasks,
  project,
  searchQuery,
  onEdit,
  onDelete,
  onArchive,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={isDragging ? 'opacity-0' : ''}
    >
      <TaskCard
        task={task}
        allTasks={allTasks}
        project={project}
        searchQuery={searchQuery}
        onEdit={onEdit}
        onDelete={onDelete}
        onArchive={onArchive}
        attributes={attributes}
        listeners={listeners}
      />
    </motion.div>
  );
};

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  project?: Project;
  searchQuery?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: (archive: boolean) => void;
  isOverlay?: boolean;
  attributes?: any;
  listeners?: any;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  allTasks,
  project,
  searchQuery = '',
  onEdit,
  onDelete,
  onArchive,
  isOverlay,
  attributes,
  listeners,
}) => {
  const priorityColors: Record<string, string> = {
    [TaskPriority.LOW]: 'text-gray-400',
    [TaskPriority.MEDIUM]: 'text-blue-500',
    [TaskPriority.HIGH]: 'text-orange-500',
    [TaskPriority.CRITICAL]: 'text-rose-500',
  };

  const isBlocked = task.dependencies?.some(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask && depTask.status !== TaskStatus.COMPLETED;
  });

  return (
    <motion.div
      {...attributes}
      {...listeners}
      whileHover={{ y: -2, scale: isOverlay ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 group hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative overflow-hidden dark:bg-slate-900 dark:border-slate-800 ${
        isBlocked ? 'ring-2 ring-amber-500/20' : ''
      } ${isOverlay ? 'shadow-xl rotate-2 ring-2 ring-blue-500/50' : ''}`}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: project?.color || 'transparent' }} 
      />
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          {isBlocked ? (
            <Link2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
          ) : (
            <AlertCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${priorityColors[task.priority]}`} />
          )}
          <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors dark:text-slate-100 dark:group-hover:text-blue-400">
            <HighlightText text={task.name} highlight={searchQuery} />
          </h4>
        </div>
        {!isOverlay && onEdit && onDelete && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 dark:hover:bg-slate-800"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600 dark:hover:bg-slate-800"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(!task.isArchived);
                }}
                className={`p-1 hover:bg-gray-100 rounded transition-all dark:hover:bg-slate-800 ${
                  task.isArchived ? 'text-amber-500' : 'text-gray-400 hover:text-amber-600 dark:text-slate-500'
                }`}
                title={task.isArchived ? 'Unarchive' : 'Archive'}
              >
                {task.isArchived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {project && (
        <div className="mb-3">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider dark:bg-indigo-900/30 dark:text-indigo-400">
            {project.name}
          </span>
        </div>
      )}
      
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag, index) => {
            const colors = [
              'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
              'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
              'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800',
              'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
              'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
              'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800',
              'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
            ];
            const colorIndex = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
            return (
              <span 
                key={index} 
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-tighter ${colors[colorIndex]}`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter dark:text-slate-500">
          <span>Progress</span>
          <span className="text-gray-900 dark:text-slate-300">{task.progress || 0}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${task.progress || 0}%` }}
            className={`h-full rounded-full transition-all ${
              (task.progress || 0) === 100 ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
          </div>
          <DaysRemainingBadge dueDate={task.dueDate} isCompleted={task.status === TaskStatus.COMPLETED} />
        </div>
        {task.stakeholder && (
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
            <Users className="w-3 h-3" />
            <span className="truncate">{task.stakeholder.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
