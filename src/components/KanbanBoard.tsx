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
import { Edit2, Trash2, Clock, Users, AlertCircle, Link2, Archive, ArchiveRestore } from 'lucide-react';

import { HighlightText } from './HighlightText';

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
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                {status}
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
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
                className="bg-gray-50/50 rounded-2xl p-3 min-h-[200px] border border-dashed border-gray-200"
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
      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 group hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative overflow-hidden ${
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
          <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
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
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(!task.isArchived);
                }}
                className={`p-1 hover:bg-gray-100 rounded transition-all ${
                  task.isArchived ? 'text-amber-500' : 'text-gray-400 hover:text-amber-600'
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
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
            {project.name}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}</span>
        </div>
        {task.stakeholder && (
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Users className="w-3 h-3" />
            <span className="truncate">{task.stakeholder.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
