const SUPPORT_TICKETS_KEY = 'talentforge_support_tickets';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  category: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
}

export function getSupportTickets(userId?: string): SupportTicket[] {
  try {
    const data = localStorage.getItem(SUPPORT_TICKETS_KEY);
    const all: SupportTicket[] = data ? JSON.parse(data) : [];
    if (!userId) return all;
    return all.filter((t) => t.userId === userId);
  } catch {
    return [];
  }
}

export function createSupportTicket(t: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>): SupportTicket {
  const data = localStorage.getItem(SUPPORT_TICKETS_KEY);
  const all: SupportTicket[] = data ? JSON.parse(data) : [];
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    ...t,
    id: crypto.randomUUID(),
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  all.push(ticket);
  localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify(all));
  return ticket;
}
