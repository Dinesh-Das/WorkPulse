/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskType, TaskStatus, TaskPriority, Project, Stakeholder } from '../types';
import { X } from 'lucide-react';

interface TaskFormProps {
  onSave: (task: Task) => void;
  onCancel: () => void;
  projects: Project[];
  allTasks: Task[];
  initialData?: Task;
  defaultProjectId?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  onSave, 
  onCancel, 
  projects, 
  allTasks,
  initialData,
  defaultProjectId 
}) => {
  const [formData, setFormData] = useState<Partial<Task>>(
    initialData || {
      name: '',
      description: '',
      type: TaskType.ONE_OFF,
      status: TaskStatus.OPEN,
      priority: TaskPriority.MEDIUM,
      projectId: defaultProjectId || '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      stakeholder: { name: '', role: '', reportsTo: '' },
      businessImpact: '',
      learnings: '',
      challenges: '',
      dependencies: [],
      progress: 0,
      tags: [],
    }
  );

  const [tagInput, setTagInput] = useState('');

  // Auto-inherit stakeholder from project
  useEffect(() => {
    if (formData.projectId && !initialData) {
      const project = projects.find(p => p.id === formData.projectId);
      if (project) {
        setFormData(prev => ({
          ...prev,
          stakeholder: { ...project.stakeholder }
        }));
      }
    }
  }, [formData.projectId, projects, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      createdAt: initialData?.createdAt || Date.now(),
      completedDate: formData.status === TaskStatus.COMPLETED ? new Date().toISOString().split('T')[0] : undefined,
      tags: formData.tags || []
    } as Task);
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !(formData.tags || []).includes(trimmedTag)) {
      setFormData({ ...formData, tags: [...(formData.tags || []), trimmedTag] });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  const updateStakeholder = (field: keyof Stakeholder, value: string) => {
    setFormData({
      ...formData,
      stakeholder: { 
        name: formData.stakeholder?.name || '',
        role: formData.stakeholder?.role || '',
        reportsTo: formData.stakeholder?.reportsTo || '',
        [field]: value 
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Task' : 'New Task Entry'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="What needs to be done?"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Standalone Task</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {Object.values(TaskType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {Object.values(TaskStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {Object.values(TaskPriority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                {(formData.tags || []).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100 uppercase tracking-tighter"
                  >
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Press Enter to add tags"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                <span>Task Progress</span>
                <span className="text-blue-600 font-bold">{formData.progress || 0}%</span>
              </label>
              <div className="flex items-center h-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress || 0}
                  onChange={(e) => {
                    const progress = parseInt(e.target.value);
                    const newStatus = progress === 100 ? TaskStatus.COMPLETED : (progress > 0 ? TaskStatus.IN_PROGRESS : formData.status);
                    setFormData({ ...formData, progress, status: newStatus });
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dependencies (Blocked By)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                {allTasks
                  .filter(t => t.id !== initialData?.id)
                  .map(t => (
                    <label key={t.id} className="flex items-center gap-2 p-2 rounded hover:bg-white transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.dependencies?.includes(t.id)}
                        onChange={(e) => {
                          const deps = formData.dependencies || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, dependencies: [...deps, t.id] });
                          } else {
                            setFormData({ ...formData, dependencies: deps.filter(id => id !== t.id) });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate">
                        {t.name}
                      </span>
                    </label>
                  ))}
                {allTasks.filter(t => t.id !== initialData?.id).length === 0 && (
                  <p className="text-xs text-gray-400 italic col-span-2">No other tasks available to link.</p>
                )}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Stakeholder Hierarchy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.stakeholder?.name}
                    onChange={(e) => updateStakeholder('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={formData.stakeholder?.role}
                    onChange={(e) => updateStakeholder('role', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
                  <input
                    type="text"
                    value={formData.stakeholder?.reportsTo}
                    onChange={(e) => updateStakeholder('reportsTo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Impact</label>
                <textarea
                  rows={2}
                  value={formData.businessImpact}
                  onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="What was the value added?"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Learnings</label>
                  <textarea
                    rows={2}
                    value={formData.learnings}
                    onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="What did you learn?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                  <textarea
                    rows={2}
                    value={formData.challenges}
                    onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Any blockers encountered?"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              {initialData ? 'Update Task' : 'Log Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
