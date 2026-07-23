import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onEditTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  // Add empty slots for the first week
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= numDays; i++) {
    days.push(i);
  }

  const getTasksForDay = (day: number) => {
    const dayDate = new Date(year, month, day).toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dayDate);
  };

  const priorityColors = {
    [TaskPriority.LOW]: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    [TaskPriority.CRITICAL]: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full dark:bg-slate-900 dark:border-slate-800">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{monthNames[month]} {year}</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider dark:text-slate-500">Upcoming Schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100 transition-all text-gray-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100 transition-all dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100 transition-all text-gray-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:border-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 bg-gray-50/30 border-b border-gray-100 dark:bg-slate-900/50 dark:border-slate-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-tighter dark:text-slate-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,1fr)]">
          {days.map((day, index) => {
            const isToday = day && 
              new Date().getDate() === day && 
              new Date().getMonth() === month && 
              new Date().getFullYear() === year;

            const dayTasks = day ? getTasksForDay(day) : [];

            return (
              <div 
                key={index} 
                className={`border-r border-b border-gray-50 p-2 min-h-[120px] transition-colors group dark:border-slate-800 ${
                  !day ? 'bg-gray-50/20 dark:bg-slate-800/10' : 'hover:bg-blue-50/10 dark:hover:bg-blue-900/10'
                }`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                        isToday 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50 dark:shadow-none dark:ring-blue-900/30' 
                          : 'text-gray-400 group-hover:text-gray-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      }`}>
                        {day}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                          {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <motion.div
                          key={task.id}
                          layoutId={task.id}
                          onClick={() => onEditTask(task)}
                          className={`px-2 py-1.5 rounded-md border text-[10px] font-bold truncate cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${
                            priorityColors[task.priority] || 'bg-gray-100 text-gray-600'
                          } ${task.status === TaskStatus.COMPLETED ? 'opacity-50 line-through' : ''}`}
                        >
                          {task.name}
                        </motion.div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[9px] font-bold text-gray-400 pl-1">
                          + {dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
