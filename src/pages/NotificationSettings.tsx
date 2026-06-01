import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from '@/utils/notificationPrefsStorage';

export function NotificationSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [pushStatus, setPushStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'>('idle');

  useEffect(() => {
    if (user?.id) setPrefs(getNotificationPrefs(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') setPushStatus('granted');
    else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') setPushStatus('denied');
    else if (typeof Notification === 'undefined') setPushStatus('unsupported');
  }, []);

  const handleChange = (key: keyof Omit<NotificationPrefs, 'userId'>, value: boolean) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const handleEnablePush = async () => {
    if (typeof Notification === 'undefined') return;
    setPushStatus('requesting');
    try {
      const perm = await Notification.requestPermission();
      setPushStatus(perm === 'granted' ? 'granted' : 'denied');
      if (prefs && perm === 'granted') {
        handleChange('pushEnabled', true);
      }
    } catch {
      setPushStatus('denied');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] py-16 px-4 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in.</p>
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Log in</Link>
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Notification settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Choose what you want to be notified about
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">New proposals</span>
            <input type="checkbox" checked={prefs.proposals} onChange={(e) => handleChange('proposals', e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Job invites</span>
            <input type="checkbox" checked={prefs.invites} onChange={(e) => handleChange('invites', e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Hires & contracts</span>
            <input type="checkbox" checked={prefs.hires} onChange={(e) => handleChange('hires', e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Messages</span>
            <input type="checkbox" checked={prefs.messages} onChange={(e) => handleChange('messages', e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Reviews</span>
            <input type="checkbox" checked={prefs.reviews} onChange={(e) => handleChange('reviews', e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Weekly digest</span>
            <input type="checkbox" checked={prefs.digest} onChange={(e) => handleChange('digest', e.target.checked)} className="rounded" />
          </label>
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-600">
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Push notifications</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Get notified even when the app is closed. Requires browser permission.
            </p>
            {pushStatus === 'unsupported' && (
              <p className="text-sm text-amber-600 dark:text-amber-400">Push notifications are not supported in this browser.</p>
            )}
            {pushStatus === 'granted' && (
              <p className="text-sm text-green-600 dark:text-green-400">Push notifications are enabled.</p>
            )}
            {pushStatus === 'denied' && (
              <p className="text-sm text-slate-500 dark:text-slate-400">Permission denied. Enable in browser settings to receive push notifications.</p>
            )}
            {(pushStatus === 'idle' || pushStatus === 'requesting') && (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={pushStatus === 'requesting'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm"
              >
                {pushStatus === 'requesting' ? 'Requesting...' : 'Enable push notifications'}
              </button>
            )}
          </div>
        </div>

        <Link to="/dashboard" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
