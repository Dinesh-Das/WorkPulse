import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { Task, TaskStatus } from '../types';
import { format, subDays, startOfDay, isSameDay, eachDayOfInterval } from 'date-fns';

interface TaskCompletionHeatmapProps {
  tasks: Task[];
}

export const TaskCompletionHeatmap: React.FC<TaskCompletionHeatmapProps> = ({ tasks }) => {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const last30Days = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    });

    return last30Days.map(day => {
      const completedCount = tasks.filter(task => {
        if (task.status !== TaskStatus.COMPLETED || !task.completedDate) return false;
        return isSameDay(new Date(task.completedDate), day);
      }).length;

      return {
        date: format(day, 'MMM dd'),
        fullDate: format(day, 'yyyy-MM-dd'),
        count: completedCount,
      };
    });
  }, [tasks]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(226, 232, 240, 0.3)'; // slate-200
    if (count < 3) return '#93c5fd'; // blue-300
    if (count < 6) return '#3b82f6'; // blue-500
    if (count < 10) return '#2563eb'; // blue-600
    return '#1e40af'; // blue-800
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Completion Heatmap</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Task activity over last 30 days</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-slate-500">Less</span>
          {[0, 2, 5, 8, 12].map((v) => (
            <div 
              key={v} 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: getColor(v) }} 
            />
          ))}
          <span className="text-[10px] text-gray-400 dark:text-slate-500">More</span>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#F1F5F9'} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              interval={6}
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748B' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748B' }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: isDark ? '#1e293b' : '#F8FAFC' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px',
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: '12px'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.count)} 
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
