import React, { useEffect, useState } from 'react';
import { notificationsApi } from '@/services/api';
import { NotificationItem } from '@/types';
import {
  Bell, CheckCheck, Clock, AlertTriangle, CheckCircle2,
  Info, ShieldAlert
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getAll();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'unread') return !n.is_read;
    if (filterType === 'read') return n.is_read;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
      case 'warning': return <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
      default: return <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-sky-600" />
            <span>Academic Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time timetable changes, exam announcements, and institutional alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-sky-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'all'
              ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'unread'
              ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilterType('read')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'read'
              ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          No notifications found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-sky-50/50 border-sky-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(notif.notification_type)}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{notif.message}</p>
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
                    <span>Target: {notif.role_target.toUpperCase()}</span>
                    <span>&bull;</span>
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-600 hover:bg-sky-100 transition-colors shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
