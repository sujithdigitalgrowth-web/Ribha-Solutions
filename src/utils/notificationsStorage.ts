const NOTIFICATIONS_KEY = 'talentforge_notifications';

export interface Notification {
  id: string;
  userId: string;
  type: 'proposal' | 'invite' | 'hire' | 'message' | 'review';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function getNotifications(userId: string): Notification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: Notification[] = data ? JSON.parse(data) : [];
    return all.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter((n) => !n.read).length;
}

export function addNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  const all: Notification[] = data ? JSON.parse(data) : [];
  const n: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  all.unshift(n);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  return n;
}

export function markAsRead(id: string): void {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  const all: Notification[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((n) => n.id === id);
  if (idx !== -1) all[idx].read = true;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}

export function markAllAsRead(userId: string): void {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  const all: Notification[] = data ? JSON.parse(data) : [];
  for (const n of all) if (n.userId === userId) n.read = true;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
}
