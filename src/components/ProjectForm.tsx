/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Stakeholder } from '../types';
import { X } from 'lucide-react';

interface ProjectFormProps {
  onSave: (project: Project) => void;
  onCancel: () => void;
  initialData?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<Project>>(
    initialData || {
      name: '',
      description: '',
      stakeholder: { name: '', role: '', reportsTo: '' },
      startDate: '',
      targetEndDate: '',
      status: 'Open',
      businessImpact: '',
      learnings: '',
      challenges: '',
      color: '#3b82f6', // Default blue
    }
  );

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Slate', value: '#64748b' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      createdAt: initialData?.createdAt || Date.now(),
    } as Project);
  };

  const updateStakeholder = (field: keyof Stakeholder, value: string) => {
    setFormData({
      ...formData,
      stakeholder: { ...formData.stakeholder!, [field]: value },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Project' : 'New Project Initiative'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Q3 Infrastructure Upgrade"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === c.value ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="What are we building?"
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Stakeholder Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    required
                    type="text"
                    value={formData.stakeholder?.name}
                    onChange={(e) => updateStakeholder('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    required
                    type="text"
                    value={formData.stakeholder?.role}
                    onChange={(e) => updateStakeholder('role', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reports To</label>
                  <input
                    required
                    type="text"
                    value={formData.stakeholder?.reportsTo}
                    onChange={(e) => updateStakeholder('reportsTo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                required
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target End Date</label>
              <input
                required
                type="date"
                value={formData.targetEndDate}
                onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Impact</label>
                <textarea
                  rows={2}
                  value={formData.businessImpact}
                  onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="What value does this bring?"
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
                    placeholder="Key takeaways..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                  <textarea
                    rows={2}
                    value={formData.challenges}
                    onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Obstacles encountered..."
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
              {initialData ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
