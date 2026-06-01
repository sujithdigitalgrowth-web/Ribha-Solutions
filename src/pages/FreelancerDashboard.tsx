import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProposals } from '@/utils/proposalsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { getInvites } from '@/utils/invitesStorage';
import { getJobs } from '@/utils/jobsStorage';
import { getProfile } from '@/utils/profilesStorage';
import { getActivity } from '@/utils/activityStorage';
import { getOrCreateWallet } from '@/utils/walletStorage';
import { CURRENCY_SYMBOL } from '@/config/brand';
import { API_ENABLED } from '@/config/api';
import { fetchAllMilestones, fetchContracts } from '@/services/dynamicDataApi';

type ApiMilestone = { id?: string; contractId?: string; amount?: string; status?: string };

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function FreelancerDashboard() {
  const { user } = useAuth();
  const [myProposals, setMyProposals] = useState<ReturnType<typeof getProposals>>([]);
  const [contracts, setContracts] = useState<ReturnType<typeof getContracts>>([]);
  const [invites, setInvites] = useState<ReturnType<typeof getInvites>>([]);
  const [activity, setActivity] = useState<ReturnType<typeof getActivity>>([]);
  const [apiEarnings, setApiEarnings] = useState<{ paid: number; pending: number }>({ paid: 0, pending: 0 });

  useEffect(() => {
    if (user?.id) {
      setMyProposals(getProposals({ freelancerId: user.id }));
      setContracts(getContracts({ freelancerId: user.id }));
      setInvites(getInvites({ freelancerId: user.id }));
      setActivity(getActivity(user.id, 10));
    }
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadEarnings() {
      if (!API_ENABLED || !user?.id || user.role !== 'freelancer') return;
      try {
        const apiContracts = (await fetchContracts({ freelancerId: user.id })) as { id?: string }[];
        const contractIds = new Set(apiContracts.map((c) => c.id).filter(Boolean) as string[]);
        const allMilestones = (await fetchAllMilestones()) as ApiMilestone[];
        let paid = 0;
        let pending = 0;
        for (const m of allMilestones) {
          if (!m.contractId || !contractIds.has(m.contractId)) continue;
          const amt = parseFloat(String(m.amount ?? '0').replace(/[^0-9.]/g, '')) || 0;
          if (m.status === 'paid') paid += amt;
          else if (m.status === 'completed' || m.status === 'submitted' || m.status === 'pending' || m.status === 'in_progress') pending += amt;
        }
        if (!cancelled) setApiEarnings({ paid: Math.round(paid * 100) / 100, pending: Math.round(pending * 100) / 100 });
      } catch {
        // ignore; fallback to local wallet
      }
    }
    loadEarnings();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  const recentProposals = myProposals.slice(0, 5);
  const activeContracts = contracts.filter((c) => c.status === 'active');
  const profile = user?.id ? getProfile(user.id) : null;
  const profileFields = profile ? [profile.title, profile.bio, profile.hourlyRate, profile.skills.length, profile.availability, profile.experience, profile.portfolioUrl] : [];
  const completedFields = profileFields.filter(Boolean).length;
  const profileProgress = profileFields.length ? Math.round((completedFields / profileFields.length) * 100) : 0;
  const walletBalance = user?.id ? getOrCreateWallet(user.id).balance : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Welcome back, {user?.name}</p>

        {profile?.skillBadges && profile.skillBadges.length > 0 && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Your skill badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skillBadges.map((b) => (
                <span key={b.skillId} className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-green-600 dark:text-green-400 font-bold">{b.score}%</span>
                  <span className="text-slate-700 dark:text-slate-300">{b.skillName}</span>
                </span>
              ))}
            </div>
            <Link to={`/freelancer/${user?.id}`} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-2 inline-block hover:underline">
              View on your profile →
            </Link>
          </div>
        )}

        {profileProgress < 100 && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile completion</span>
              <span className="text-sm text-slate-500">
                {profileProgress}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${profileProgress}%` }} />
            </div>
            <Link to="/profile/edit" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-2 inline-block hover:underline">
              Complete your profile →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/wallet" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Balance</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {CURRENCY_SYMBOL}{walletBalance.toFixed(2)}
            </p>
            {API_ENABLED ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Earnings paid: {CURRENCY_SYMBOL}{apiEarnings.paid.toFixed(2)} • Pending: {CURRENCY_SYMBOL}{apiEarnings.pending.toFixed(2)}
              </p>
            ) : null}
            <span className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 inline-block">View balance →</span>
          </Link>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">My Proposals</p>
            <p className="text-3xl font-bold text-indigo-600">{myProposals.length}</p>
            <Link to="/find-work" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Browse jobs</Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Invites</p>
            <p className="text-3xl font-bold text-amber-600">{invites.length}</p>
            <Link to="/find-work" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">View jobs</Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Active Contracts</p>
            <p className="text-3xl font-bold text-green-600">{activeContracts.length}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Proposals</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentProposals.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No proposals yet</p>
                  <Link to="/find-work" className="text-indigo-600 font-medium mt-2 inline-block">Find work</Link>
                </div>
              ) : (
                recentProposals.map((p) => {
                  const job = getJobs().find((j) => j.id === p.jobId);
                  return (
                    <Link key={p.id} to={`/apply/${p.jobId}`} className="block p-4 hover:bg-slate-50">
                      <p className="font-medium text-slate-900">{job?.title || 'Job'}</p>
                      <p className="text-sm text-slate-500">Applied {formatTimeAgo(p.createdAt)}</p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Activity feed</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {activity.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No recent activity
                </div>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="p-4">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{a.title}</p>
                    {a.description && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{a.description}</p>}
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{formatTimeAgo(a.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Job Invites</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {invites.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No invites yet</p>
                  <p className="text-sm mt-1">Complete your profile to get discovered</p>
                </div>
              ) : (
                invites.slice(0, 5).map((inv) => {
                  const job = getJobs().find((j) => j.id === inv.jobId);
                  return (
                    <Link key={inv.id} to={`/apply/${inv.jobId}`} className="block p-4 hover:bg-slate-50">
                      <p className="font-medium text-slate-900">{job?.title || 'Job'}</p>
                      <p className="text-sm text-slate-500">Invited {formatTimeAgo(inv.createdAt)}</p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
