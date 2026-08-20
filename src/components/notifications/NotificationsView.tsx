import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, CheckCircle2, ShieldAlert, CheckCheck, 
  Clock, AlertOctagon, Sparkles, Check 
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    setSelectedTaskId 
  } = useApp();

  const userNotifs = notifications.filter(n => {
    if (n.targetRole && n.targetRole !== currentUser.role) return false;
    if (n.userId && n.userId !== currentUser.id) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              System Notifications & Exception Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of blocker escalations, QA test feedback, and review requests.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {userNotifs.map(notif => {
          const isCritical = notif.type === 'BLOCKER_CRITICAL';
          const isQA = notif.type === 'QA_FAILED' || notif.type === 'QA_PASSED';

          return (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.linkTaskId) setSelectedTaskId(notif.linkTaskId);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                !notif.isRead 
                  ? isCritical 
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800' 
                    : 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isCritical ? (
                    <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />
                  ) : isQA ? (
                    <CheckCheck className="w-5 h-5 text-purple-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-sky-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {notif.createdAt}
                  </span>
                </div>
              </div>

              {notif.linkTaskId && (
                <button className="text-xs text-sky-600 font-semibold hover:underline shrink-0">
                  Inspect Task →
                </button>
              )}
            </div>
          );
        })}

        {userNotifs.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Zero unread notifications! You are all caught up.
          </div>
        )}
      </div>
    </div>
  );
};
