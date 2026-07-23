/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageConfig, storageService, isElectron, AppData } from '../services/storageService';
import { 
  Settings, 
  FolderOpen, 
  Database, 
  FileJson, 
  Download, 
  Upload, 
  ChevronRight, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Layout,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsPageProps {
  config: StorageConfig;
  onUpdateConfig: (config: StorageConfig) => void;
  data: AppData;
  onImport: (newData: AppData) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ config, onUpdateConfig, data, onImport }) => {
  const [version, setVersion] = useState('1.0.0');
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'storage' | 'about'>('general');

  useEffect(() => {
    if (isElectron()) {
      window.todoAPI.getAppVersion().then(setVersion);
    }
  }, []);

  const handleChangeLocation = async () => {
    if (!isElectron()) return;
    const picked = await window.todoAPI.chooseDirectory();
    if (picked) {
      const newConfig: StorageConfig = { ...config, location: picked };
      // Offer to move data logic would go here
      onUpdateConfig(newConfig);
      setStatus('Storage location updated successfully.');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleExport = async () => {
    const result = await storageService.exportData(data);
    if (result.success) {
      setStatus('Exported successfully.');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleImport = async () => {
    const result = await storageService.importData();
    if (result.success && 'data' in result && result.data) {
      if (confirm('Importing data will replace your current tasks and projects. Proceed?')) {
        onImport(result.data as AppData);
        setStatus('Imported successfully.');
        setTimeout(() => setStatus(null), 3000);
      }
    }
  };

  const handleOpenFolder = async () => {
    if (isElectron()) {
      await window.todoAPI.openPath(config.location);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8 dark:text-slate-100"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center dark:bg-blue-600">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Application Settings</h2>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 text-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4" />
          {status}
        </motion.div>
      )}

      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit dark:bg-slate-900 border dark:border-slate-800">
        {[
          { id: 'general', label: 'General', icon: Monitor },
          { id: 'storage', label: 'Data & Storage', icon: Database },
          { id: 'about', label: 'About', icon: Info },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'general' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Theme Settings */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3 dark:bg-slate-800/50 dark:border-slate-800">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Appearance</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, theme: 'light' })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        (config.theme || 'light') === 'light' 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                          : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3 dark:bg-slate-800">
                        <Sun className={`w-4 h-4 ${(config.theme || 'light') === 'light' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Light Mode</h4>
                      <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Default bright interface</p>
                    </button>

                    <button 
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, theme: 'dark' })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        config.theme === 'dark' 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' 
                          : 'border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm mb-3 dark:bg-slate-950">
                        <Moon className={`w-4 h-4 ${config.theme === 'dark' ? 'text-blue-600' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dark Mode</h4>
                      <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">High contrast dark theme</p>
                    </button>
                  </div>
                </div>
              </section>

              {/* Startup Settings */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3 dark:bg-slate-800/50 dark:border-slate-800">
                  <Layout className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Startup Behavior</h3>
                </div>
                <div className="p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Default View on Open</label>
                  <select 
                    value={config.defaultView || 'dashboard'}
                    onChange={(e) => onUpdateConfig({ ...config, defaultView: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  >
                    <option value="dashboard">Dashboard Overview</option>
                    <option value="projects">Projects List</option>
                    <option value="tasks">All Tasks</option>
                    <option value="kanban">Kanban Board</option>
                    <option value="calendar">Calendar View</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">Choose which screen you see first when the application starts.</p>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'storage' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Storage Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Data Storage</h3>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                    {config.type} Mode
                  </span>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Location</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-xs text-slate-600 break-all">
                      <FolderOpen className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      {config.location}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={handleChangeLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Change Folder
                    </button>
                    <button 
                      onClick={handleOpenFolder}
                      className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Open in Explorer
                    </button>
                  </div>
                </div>
              </section>

              {/* Backup Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                  <Download className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Import & Export</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={handleExport}
                    className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Export Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Create a JSON backup of all tasks and projects.</p>
                  </button>

                  <button 
                    onClick={handleImport}
                    className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-amber-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Import Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Load tasks from a previously exported WorkPulse file.</p>
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                  <Layout className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">WorkPulse</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  A high-performance productivity tool designed for builders, creators, and managers. 
                  Streamline your workflow with precision.
                </p>
                <div className="mt-8 flex justify-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-wider">
                  <div>Version {version}</div>
                  <div>Build 2026.07</div>
                  <div>Stable Release</div>
                </div>
              </section>

              <section className="bg-blue-600 rounded-2xl p-8 text-white">
                <h4 className="text-lg font-bold mb-2">Check for Updates</h4>
                <p className="text-blue-100 text-sm mb-6">Stay up to date with the latest features and security improvements.</p>
                <button className="px-6 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all">
                  Check Now
                </button>
              </section>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold">System Info</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Version</span>
                <span className="font-mono font-bold">{version}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Environment</span>
                <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold uppercase">
                  {isElectron() ? 'Desktop' : 'Web Preview'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Architecture</span>
                <span className="text-slate-300">Secure IPC v1</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-slate-400 uppercase font-bold tracking-tight">
                  Always ensure you have a backup of your data before moving folders or importing files.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
