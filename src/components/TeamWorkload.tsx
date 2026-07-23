import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Task, TaskStatus } from '../types';

interface TeamWorkloadProps {
  tasks: Task[];
}

export const TeamWorkload: React.FC<TeamWorkloadProps> = ({ tasks }) => {
  const chartData = useMemo(() => {
    const workloadMap: Record<string, { name: string; count: number; statusCounts: Record<string, number> }> = {};

    tasks.forEach((task) => {
      const name = task.stakeholder?.name || 'Unassigned';
      if (!workloadMap[name]) {
        workloadMap[name] = { 
          name, 
          count: 0,
          statusCounts: {} 
        };
      }
      workloadMap[name].count += 1;
      
      const status = task.status;
      if (!workloadMap[name].statusCounts[status]) {
        workloadMap[name].statusCounts[status] = 0;
      }
      workloadMap[name].statusCounts[status] += 1;
    });

    return Object.values(workloadMap).sort((a, b) => b.count - a.count);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-400 italic bg-white rounded-2xl border border-gray-100">
        No task data available for workload visualization.
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Team Workload</h3>
        <p className="text-sm text-gray-500">Tasks assigned per stakeholder</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 500, fill: '#64748B' }}
            />
            <Tooltip
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
            />
            <Bar 
              dataKey="count" 
              name="Total Tasks" 
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {chartData.slice(0, 4).map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="text-xs text-gray-600 truncate max-w-[100px]">{entry.name}</span>
            <span className="text-xs font-bold text-gray-900 ml-auto">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
