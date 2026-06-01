import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markAsRead, markAllAsRead } from '@/utils/notificationsStorage';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<ReturnType<typeof getNotifications>>([]);

  useEffect(() => {
    if (user?.id) setNotifications(getNotifications(user.id));
  }, [user?.id]);

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    if (user?.id) setNotifications(getNotifications(user.id));
  };

  const handleMarkAllRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
      setNotifications(getNotifications(user.id));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to view notifications</p>
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-sm text-indigo-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-4 ${!n.read ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'}`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                    <p className="text-xs text-slate-500 mt-2">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {n.link && (
                      <Link to={n.link} className="text-sm text-indigo-600 hover:underline" onClick={() => handleMarkRead(n.id)}>
                        View
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
