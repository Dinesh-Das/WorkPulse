import React, { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { Task, TaskPriority } from '../types';

interface PriorityDistributionProps {
  tasks: Task[];
}

export const PriorityDistribution: React.FC<PriorityDistributionProps> = ({ tasks }) => {
  const chartData = useMemo(() => {
    const counts = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
      [TaskPriority.CRITICAL]: 0,
    };

    tasks.forEach(task => {
      if (counts[task.priority] !== undefined) {
        counts[task.priority]++;
      }
    });

    return [
      { name: 'Low', value: counts[TaskPriority.LOW], color: '#10B981' }, // Emerald-500
      { name: 'Medium', value: counts[TaskPriority.MEDIUM], color: '#3B82F6' }, // Blue-500
      { name: 'High', value: counts[TaskPriority.HIGH], color: '#F59E0B' }, // Amber-500
      { name: 'Critical', value: counts[TaskPriority.CRITICAL], color: '#EF4444' }, // Red-500
    ].filter(item => item.value > 0);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-400 italic dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500">
        No task data for priority distribution.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Priority Distribution</h3>
      </div>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px',
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
              }}
              itemStyle={{
                color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-medium text-gray-600 dark:text-slate-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-500 font-medium dark:text-slate-400">{item.name}</span>
            </div>
            <span className="text-gray-900 font-bold dark:text-slate-100">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
