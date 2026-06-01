const MESSAGES_KEY = 'talentforge_messages';

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // base64 or blob URL for mock
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  attachments?: MessageAttachment[];
}

export function getConversationId(user1: string, user2: string): string {
  return [user1, user2].sort().join('_');
}

export function getMessages(conversationId: string): Message[] {
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    const messages: Message[] = data ? JSON.parse(data) : [];
    return messages.filter((m) => m.conversationId === conversationId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    return [];
  }
}

export function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  attachments?: MessageAttachment[]
): Message {
  const data = localStorage.getItem(MESSAGES_KEY);
  const messages: Message[] = data ? JSON.parse(data) : [];
  const msg: Message = {
    id: crypto.randomUUID(),
    conversationId,
    senderId,
    receiverId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    read: false,
    attachments: attachments?.length ? attachments : undefined,
  };
  messages.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  return msg;
}

export function markMessageRead(messageId: string): void {
  const data = localStorage.getItem(MESSAGES_KEY);
  const messages: Message[] = data ? JSON.parse(data) : [];
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx !== -1) {
    messages[idx] = { ...messages[idx], read: true, readAt: new Date().toISOString() };
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }
}

export function markConversationRead(conversationId: string, userId: string): void {
  const data = localStorage.getItem(MESSAGES_KEY);
  const messages: Message[] = data ? JSON.parse(data) : [];
  const now = new Date().toISOString();
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].conversationId === conversationId && messages[i].receiverId === userId && !messages[i].read) {
      messages[i] = { ...messages[i], read: true, readAt: now };
    }
  }
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getConversationsForUser(userId: string): { conversationId: string; otherUserId: string; lastMessage: string; lastAt: string }[] {
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    const messages: Message[] = data ? JSON.parse(data) : [];
    const byConv = new Map<string, { otherUserId: string; last: Message }>();
    for (const m of messages) {
      if (m.senderId !== userId && m.receiverId !== userId) continue;
      const other = m.senderId === userId ? m.receiverId : m.senderId;
      const existing = byConv.get(m.conversationId);
      if (!existing || new Date(m.createdAt) > new Date(existing.last.createdAt)) {
        byConv.set(m.conversationId, { otherUserId: other, last: m });
      }
    }
    return Array.from(byConv.entries()).map(([conversationId, { otherUserId, last }]) => ({
      conversationId,
      otherUserId,
      lastMessage: last.content,
      lastAt: last.createdAt,
    })).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  } catch {
    return [];
  }
}
