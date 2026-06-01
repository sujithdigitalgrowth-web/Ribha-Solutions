const NOTIFICATION_PREFS_KEY = 'talentforge_notification_prefs';

export interface NotificationPrefs {
  userId: string;
  proposals: boolean;
  invites: boolean;
  hires: boolean;
  messages: boolean;
  reviews: boolean;
  digest: boolean;
  pushEnabled: boolean;
}

const DEFAULTS: Omit<NotificationPrefs, 'userId'> = {
  proposals: true,
  invites: true,
  hires: true,
  messages: true,
  reviews: true,
  digest: false,
  pushEnabled: false,
};

export function getNotificationPrefs(userId: string): NotificationPrefs {
  try {
    const data = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    const map: Record<string, NotificationPrefs> = data ? JSON.parse(data) : {};
    return map[userId] || { userId, ...DEFAULTS };
  } catch {
    return { userId, ...DEFAULTS };
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  const data = localStorage.getItem(NOTIFICATION_PREFS_KEY);
  const map: Record<string, NotificationPrefs> = data ? JSON.parse(data) : {};
  map[prefs.userId] = prefs;
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(map));
}
