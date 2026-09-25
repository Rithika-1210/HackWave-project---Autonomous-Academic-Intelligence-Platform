import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/services/api';
import { NotificationItem } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { TabNavigation } from '@/components/common/TabNavigation';
import {
  Bell, CheckCheck, Clock, AlertTriangle, CheckCircle2,
  Info, ShieldAlert, MapPin, ArrowRight, ExternalLink
} from 'lucide-react';

interface LocationTarget {
  name: string;
  path: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const resolveNotificationLocation = (notif: NotificationItem, userRole?: string): LocationTarget => {
    const text = `${notif.title} ${notif.message}`.toLowerCase();

    // 1. Examination & Seating
    if (text.includes('exam') || text.includes('hall') || text.includes('seating') || text.includes('mid-term') || text.includes('end-semester')) {
      if (userRole === 'exam_cell') {
        return { name: 'Exam Operations Portal', path: '/dashboard/exam_cell' };
      }
      return { name: 'Examinations & Seating', path: '/examinations' };
    }

    // 2. Conflict or Rescheduling
    if (text.includes('conflict') || text.includes('clash') || text.includes('reschedul')) {
      return { name: 'Dynamic Rescheduling Center', path: '/timetables' };
    }

    // 3. Timetable / Schedule related
    if (text.includes('timetable') || text.includes('schedule') || text.includes('slot') || text.includes('period')) {
      if (userRole === 'student') {
        return { name: 'Class Timetable', path: '/timetables' };
      }
      if (userRole === 'faculty') {
        return { name: 'Weekly Teaching Timetable', path: '/timetables' };
      }
      return { name: 'Academic Timetables', path: '/timetables' };
    }

    // 4. Faculty & Workload
    if (text.includes('faculty') || text.includes('workload') || text.includes('professor') || text.includes('teaching')) {
      return { name: 'Faculty Members & Workload', path: '/faculty' };
    }

    // 5. Student Management
    if (text.includes('student') || text.includes('enroll') || text.includes('batch')) {
      if (userRole === 'student') {
        return { name: 'Student Portal Dashboard', path: '/dashboard/student' };
      }
      return { name: 'Student Directory', path: '/students' };
    }

    // 6. Classrooms & Labs
    if (text.includes('classroom') || text.includes('laboratory') || text.includes('lab ') || text.includes('room')) {
      return { name: 'Classrooms & Laboratories', path: '/resources' };
    }

    // 7. Departments
    if (text.includes('department') || text.includes('governance')) {
      return { name: 'Department Management', path: '/departments' };
    }

    // 8. Courses & Subjects
    if (text.includes('course') || text.includes('subject') || text.includes('syllabus') || text.includes('curricul')) {
      return { name: 'Courses & Subjects', path: '/courses' };
    }

    // 9. AI Copilot / Digital Twin
    if (text.includes('copilot') || text.includes('twin') || text.includes('recommend') || text.includes('approval')) {
      return { name: 'Academic Intelligence Suite', path: '/ai/digital-twin' };
    }

    // 10. Default Role Fallback
    switch (notif.role_target) {
      case 'faculty':
        return { name: 'Faculty Dashboard', path: '/dashboard/faculty' };
      case 'student':
        return { name: 'Student Dashboard', path: '/dashboard/student' };
      case 'hod':
        return { name: 'Department Dashboard', path: '/dashboard/hod' };
      case 'exam_cell':
        return { name: 'Exam Operations', path: '/dashboard/exam_cell' };
      case 'admin':
        return { name: 'Admin Overview', path: '/dashboard/admin' };
      default:
        return { name: 'Academic Overview', path: '/timetables' };
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      handleMarkRead(notif.id);
    }
    const loc = resolveNotificationLocation(notif, user?.role);
    navigate(loc.path);
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
      
      {/* Standardized Header */}
      <PageHeader
        title="Academic Notification Center"
        subtitle="Real-time timetable changes, exam announcements, and institutional alerts. Click any card to navigate directly to its location."
        icon={Bell}
        actions={unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-sky-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      />

      {/* Filter Tabs using TabNavigation */}
      <TabNavigation
        tabs={[
          { id: 'all', label: 'All Notifications', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'read', label: 'Read', count: notifications.length - unreadCount },
        ]}
        activeTab={filterType}
        onChange={setFilterType}
        variant="pill"
      />

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
          {filteredNotifications.map((notif) => {
            const loc = resolveNotificationLocation(notif, user?.role);
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                  notif.is_read
                    ? 'bg-white border-slate-200 hover:border-sky-300'
                    : 'bg-sky-50/60 border-sky-200/90 shadow-xs hover:border-sky-400'
                }`}
                title={`Click to open destination: ${loc.name}`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {getIcon(notif.notification_type)}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-400 flex-wrap">
                      {/* Location Badge */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-100/80 text-sky-800 font-semibold group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        <MapPin className="w-3 h-3" />
                        <span>Located at: {loc.name}</span>
                      </span>
                      <span>Target: {notif.role_target.toUpperCase()}</span>
                      <span>&bull;</span>
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!notif.is_read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notif.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-sky-600 hover:bg-sky-100/60 transition-colors cursor-pointer"
                      title="Mark as read without opening"
                    >
                      Mark Read
                    </button>
                  )}
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
