import React from 'react';
import { Calendar } from 'lucide-react';

interface DaysRemainingBadgeProps {
  dueDate?: string;
  isCompleted?: boolean;
}

export const DaysRemainingBadge: React.FC<DaysRemainingBadgeProps> = ({ dueDate, isCompleted }) => {
  if (!dueDate || isCompleted) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let badgeStyles = '';
  let label = '';

  if (diffDays < 0) {
    badgeStyles = 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800';
    label = `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    badgeStyles = 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    label = 'Due today';
  } else if (diffDays === 1) {
    badgeStyles = 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    label = 'Due tomorrow';
  } else if (diffDays <= 3) {
    badgeStyles = 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    label = `${diffDays}d left`;
  } else {
    // For more than 3 days, maybe we don't show it as an "urgency" badge or show it neutrally
    badgeStyles = 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700';
    label = `${diffDays}d left`;
  }

  return (
    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-tighter ${badgeStyles}`}>
      <Calendar className="w-2.5 h-2.5" />
      {label}
    </div>
  );
};
