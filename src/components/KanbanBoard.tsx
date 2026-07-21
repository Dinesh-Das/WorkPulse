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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus, TaskPriority, Project } from '../types';
import { Edit2, Trash2, Clock, Users, AlertCircle, Link2 } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  allTasks: Task[];
  projects: Project[];
  onTaskUpdate: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  allTasks,
  projects,
  onTaskUpdate,
  onEditTask,
  onDeleteTask,
}) => {
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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dragging over a column or another task
    const isOverAColumn = columns.includes(overId as TaskStatus);
    const overTask = tasks.find((t) => t.id === overId);

    const newStatus = isOverAColumn ? (overId as TaskStatus) : overTask?.status;

    if (newStatus && activeTask.status !== newStatus) {
      onTaskUpdate({ ...activeTask, status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
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
                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      allTasks={allTasks}
                      project={projects.find((p) => p.id === task.projectId)}
                      onEdit={() => onEditTask(task)}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

interface SortableTaskCardProps {
  task: Task;
  allTasks: Task[];
  project?: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  allTasks,
  project,
  onEdit,
  onDelete,
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
    opacity: isDragging ? 0.5 : 1,
  };

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3 group hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative overflow-hidden ${isBlocked ? 'ring-2 ring-amber-500/20' : ''}`}
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
            {task.name}
          </h4>
        </div>
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
        </div>
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
    </div>
  );
};
