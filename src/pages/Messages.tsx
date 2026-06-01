import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getConversationsForUser, getMessages, sendMessage, getConversationId, markConversationRead } from '@/utils/messagesStorage';

const STORAGE_KEY = 'talentforge_users';
const MOCK_NAMES: Record<string, string> = {
  '1': 'Sarah Chen', '2': 'Marcus Johnson', '3': 'Elena Rodriguez',
  '4': 'David Kim', '5': 'Priya Sharma', '6': 'James Wilson',
};
function getUserName(id: string): string {
  if (MOCK_NAMES[id]) return MOCK_NAMES[id];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const users: Array<{ id: string; name: string }> = data ? JSON.parse(data) : [];
    return users.find((u) => u.id === id)?.name || 'User';
  } catch {
    return 'User';
  }
}

export function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const withUserId = searchParams.get('with');
  const [conversations, setConversations] = useState<ReturnType<typeof getConversationsForUser>>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ReturnType<typeof getMessages>>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) setConversations(getConversationsForUser(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (withUserId && user?.id) {
      const convId = getConversationId(user.id, withUserId);
      const exists = conversations.some((c) => c.conversationId === convId);
      if (!exists) setSelectedConv(convId);
      else setSelectedConv(convId);
    }
  }, [withUserId, user?.id, conversations]);

  useEffect(() => {
    if (selectedConv) {
      if (user?.id) markConversationRead(selectedConv, user.id);
      setMessages(getMessages(selectedConv));
    }
  }, [selectedConv, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user?.id) return;
    const otherId = conv?.otherUserId || withUserId;
    if (!otherId) return;
    const convId = selectedConv || getConversationId(user.id, otherId);
    sendMessage(convId, user.id, otherId, input);
    setSelectedConv(convId);
    setMessages(getMessages(convId));
    setInput('');
    setConversations(getConversationsForUser(user.id));
  };

  const conv = selectedConv ? conversations.find((c) => c.conversationId === selectedConv) : null;
  const otherUserId = conv?.otherUserId || (withUserId && selectedConv ? (getConversationId(user?.id || '', withUserId) === selectedConv ? withUserId : null) : null);
  const otherName = getUserName(otherUserId || '');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to view messages</p>
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex" style={{ minHeight: 500 }}>
          <div className="w-80 border-r border-slate-200 flex flex-col">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start a conversation from a job or freelancer profile</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.conversationId}
                  type="button"
                  onClick={() => setSelectedConv(c.conversationId)}
                  className={`p-4 text-left hover:bg-slate-50 border-b border-slate-100 ${selectedConv === c.conversationId ? 'bg-indigo-50' : ''}`}
                >
                  <p className="font-medium text-slate-900">{getUserName(c.otherUserId)}</p>
                  <p className="text-sm text-slate-500 truncate">{c.lastMessage}</p>
                </button>
              ))
            )}
          </div>
          <div className="flex-1 flex flex-col">
            {(selectedConv || withUserId) ? (
              <>
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <p className="font-semibold text-slate-900">{otherName}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && withUserId && (
                    <p className="text-slate-500 text-sm">Start the conversation by sending a message below.</p>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          m.senderId === user?.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <p className="text-sm">{m.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${m.senderId === user?.id ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </p>
                          {m.senderId !== user?.id && m.read && m.readAt && (
                            <span className="text-xs text-slate-400" title={`Read ${new Date(m.readAt).toLocaleString()}`}>✓ Read</span>
                          )}
                        </div>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {m.attachments.map((a) => (
                              <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs underline truncate max-w-[200px]">
                                📎 {a.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div className="p-4 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder={otherName ? `Message ${otherName}...` : 'Type a message...'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
