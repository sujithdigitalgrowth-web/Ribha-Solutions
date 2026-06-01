import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs } from '@/utils/jobsStorage';
import { getProposals } from '@/utils/proposalsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { getOrCreateWallet } from '@/utils/walletStorage';
import { CURRENCY_SYMBOL } from '@/config/brand';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function ClientDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ReturnType<typeof getJobs>>([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, totalProposals: 0 });

  useEffect(() => {
    if (user?.id) {
      const j = getJobs(user.id);
      setJobs(j);
      let totalProposals = 0;
      for (const job of j) {
        totalProposals += getProposals({ jobId: job.id }).length;
      }
      setStats({
        open: j.filter((x) => x.status === 'open').length,
        inProgress: j.filter((x) => x.status === 'in_progress').length,
        totalProposals,
      });
    }
  }, [user?.id]);

  const recentJobs = jobs.slice(0, 5);
  const contracts = user?.id ? getContracts({ clientId: user.id }) : [];

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600 mb-8">Welcome back, {user?.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/wallet" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Balance</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {CURRENCY_SYMBOL}{(user?.id ? getOrCreateWallet(user.id).balance : 0).toFixed(2)}
            </p>
            <span className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 inline-block">View balance →</span>
          </Link>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Open Jobs</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.open}</p>
            <Link to="/my-jobs" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">View all</Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">In Progress</p>
            <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
            <Link to="/my-jobs" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">View all</Link>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Proposals</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalProposals}</p>
            <Link to="/my-jobs" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">View all</Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Recent Jobs</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {recentJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No jobs yet</p>
                  <Link to="/post-job" className="text-indigo-600 font-medium mt-2 inline-block">Post your first job</Link>
                </div>
              ) : (
                recentJobs.map((job) => (
                  <Link key={job.id} to={`/my-jobs/${job.id}`} className="block p-4 hover:bg-slate-50">
                    <p className="font-medium text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">{job.status} • {getProposals({ jobId: job.id }).length} proposals</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Active Contracts</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {contracts.filter((c) => c.status === 'active').length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No active contracts</p>
                  <p className="text-sm mt-1">Hire a freelancer from your job proposals</p>
                </div>
              ) : (
                contracts.filter((c) => c.status === 'active').map((c) => (
                  <div key={c.id} className="p-4">
                    <p className="font-medium text-slate-900">{c.freelancerName}</p>
                    <p className="text-sm text-slate-500">Hired {formatTimeAgo(c.hiredAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
