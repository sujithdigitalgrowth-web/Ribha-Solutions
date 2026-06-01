import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const PAYMENT_METHODS_KEY = 'talentforge_payment_methods';

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  addedAt: string;
}

function getMethods(userId: string): PaymentMethod[] {
  try {
    const data = localStorage.getItem(PAYMENT_METHODS_KEY);
    const raw = data ? JSON.parse(data) : {};
    return (raw[userId] || []).sort((a: PaymentMethod, b: PaymentMethod) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  } catch {
    return [];
  }
}

function addMethod(userId: string, last4: string, brand: string): void {
  const data = localStorage.getItem(PAYMENT_METHODS_KEY);
  const raw: Record<string, PaymentMethod[]> = data ? JSON.parse(data) : {};
  const list = raw[userId] || [];
  list.push({
    id: crypto.randomUUID(),
    type: 'card',
    last4,
    brand,
    addedAt: new Date().toISOString(),
  });
  raw[userId] = list;
  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(raw));
}

export function PaymentMethods() {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    if (user?.id) setMethods(getMethods(user.id));
  }, [user?.id]);

  const handleAdd = () => {
    if (!user?.id) return;
    const digits = cardNumber.replace(/\D/g, '').slice(-4);
    const last4 = digits.length >= 4 ? digits : '4242';
    addMethod(user.id, last4, 'Visa');
    setMethods(getMethods(user.id));
    setShowAdd(false);
    setCardNumber('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">Please log in.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 inline-block">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment methods</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Mock cards for demo. No real charges.</p>

        {methods.length === 0 && !showAdd ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No payment methods yet</p>
            <button type="button" onClick={() => setShowAdd(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
              Add card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {methods.map((m) => (
              <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{m.brand} •••• {m.last4}</p>
                    <p className="text-xs text-slate-500">Added {new Date(m.addedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Mock</span>
              </div>
            ))}
            {showAdd && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Add card (mock)</h3>
                <input
                  type="text"
                  placeholder="Card number (e.g. 4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg mb-4 bg-white dark:bg-slate-900"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={handleAdd} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                    Add
                  </button>
                  <button type="button" onClick={() => { setShowAdd(false); setCardNumber(''); }} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {!showAdd && (
              <button type="button" onClick={() => setShowAdd(true)} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 hover:border-indigo-500 hover:text-indigo-600 font-medium">
                + Add another card
              </button>
            )}
          </div>
        )}

        <Link to="/wallet" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          ← Balance
        </Link>
      </div>
    </div>
  );
}
