import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getReferrals, createReferral, getReferralCode } from '@/utils/referralsStorage';

export function Referrals() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [referrals, setReferrals] = useState<ReturnType<typeof getReferrals>>([]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !email.trim()) return;
    createReferral(user.id, email.trim());
    setReferrals(getReferrals(user.id));
    setEmail('');
    setSent(true);
  };

  const referralLink = user?.id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${getReferralCode(user.id)}` : '';
  const referralCode = user?.id ? getReferralCode(user.id) : '';

  if (!user) {
    return (
      <div className="min-h-[60vh] py-16 px-4 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to use referrals.</p>
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Log in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Refer & Earn</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Invite friends to Ribha Solutions. When they sign up and complete a project, you both earn credits (mock).
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your referral link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm"
            />
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium"
            >
              Copy
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-2">Code: {referralCode}</p>
        </div>

        <form onSubmit={handleInvite} className="mb-8">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Invite by email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
              Send invite
            </button>
          </div>
          {sent && <p className="text-green-600 dark:text-green-400 text-sm mt-2">Invite sent!</p>}
        </form>

        {referrals.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Invites sent</h2>
            <div className="space-y-2">
              {referrals.map((r) => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">{r.referredEmail}</span>
                  <span className={`text-sm ${r.signedUp ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                    {r.signedUp ? 'Signed up' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/dashboard" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
