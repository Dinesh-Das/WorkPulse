/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StorageConfig, isElectron } from '../services/storageService';
import { HardDrive, FolderOpen, Package, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupScreenProps {
  onComplete: (config: StorageConfig) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelection = async (type: 'default' | 'custom' | 'portable') => {
    setLoading(true);
    setError(null);
    try {
      let location = '';
      if (isElectron()) {
        if (type === 'default') {
          location = await window.todoAPI.getDefaultPath();
        } else if (type === 'custom') {
          const picked = await window.todoAPI.chooseDirectory();
          if (!picked) {
            setLoading(false);
            return;
          }
          location = picked;
        } else {
          location = './data'; // Portable
        }
      } else {
        location = 'localstorage';
      }

      onComplete({
        type: 'json',
        location,
        isInitialized: true
      });
    } catch (err) {
      setError('Failed to initialize storage location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-10 border-b border-slate-50 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to WorkPulse</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Your data is yours. Choose where you want to store your tasks and projects locally on this machine.
          </p>
        </div>

        <div className="p-10 space-y-4">
          <button 
            disabled={loading}
            onClick={() => handleSelection('default')}
            className="w-full group flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Recommended Storage</h3>
              <p className="text-sm text-slate-500">Secure application data folder (OS standard)</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>

          <button 
            disabled={loading}
            onClick={() => handleSelection('custom')}
            className="w-full group flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Custom Folder</h3>
              <p className="text-sm text-slate-500">Choose your own directory for sync or backup</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>

          <button 
            disabled={loading}
            onClick={() => handleSelection('portable')}
            className="w-full group flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:bg-blue-50/30 transition-all text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Portable Mode</h3>
              <p className="text-sm text-slate-500">Store data in the same folder as the application</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>

        <div className="px-10 py-6 bg-slate-50 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-4 h-4" />
            <span className="text-xs font-medium">Using JSON Storage (Recommended)</span>
          </div>
          {error && <span className="text-xs font-bold text-rose-500">{error}</span>}
        </div>
      </motion.div>
    </div>
  );
};
