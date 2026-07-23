import React from 'react';
import { Activity, ActivityType } from '../types';
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Edit2, 
  Clock,
  Briefcase,
  Trello
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogProps {
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.TASK_CREATED:
      return <Plus className="w-4 h-4 text-emerald-500" />;
    case ActivityType.TASK_UPDATED:
      return <Edit2 className="w-4 h-4 text-blue-500" />;
    case ActivityType.TASK_DELETED:
      return <Trash2 className="w-4 h-4 text-rose-500" />;
    case ActivityType.PROJECT_CREATED:
      return <Plus className="w-4 h-4 text-emerald-600" />;
    case ActivityType.PROJECT_UPDATED:
      return <Edit2 className="w-4 h-4 text-blue-600" />;
    case ActivityType.PROJECT_DELETED:
      return <Trash2 className="w-4 h-4 text-rose-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getActivityMessage = (activity: Activity) => {
  const entity = activity.type.startsWith('TASK') ? 'task' : 'project';
  const action = activity.type.split('_')[1].toLowerCase();
  
  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-900 dark:text-slate-100">
        <span className="font-semibold">{activity.entityName}</span> {entity} {action}
      </p>
      {activity.details && (
        <p className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">{activity.details}</p>
      )}
    </div>
  );
};

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  const sortedActivities = [...activities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col dark:bg-slate-900 dark:border-slate-800">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Activity Log</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {sortedActivities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 dark:bg-slate-800">
              <Clock className="w-6 h-6 text-gray-300 dark:text-slate-600" />
            </div>
            <p className="text-gray-400 italic text-sm dark:text-slate-500">No recent activity found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group dark:hover:bg-slate-800"
              >
                <div className="mt-0.5 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100 dark:bg-slate-800 dark:group-hover:bg-slate-700 dark:group-hover:border-slate-600">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {getActivityMessage(activity)}
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider dark:text-slate-500">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
