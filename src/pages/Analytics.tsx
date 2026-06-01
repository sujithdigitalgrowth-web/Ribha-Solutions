import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileViews, getJobViews } from '@/utils/analyticsStorage';
import { getProposals } from '@/utils/proposalsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { getInvoices } from '@/utils/invoicesStorage';
import { getJobs } from '@/utils/jobsStorage';

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Analytics() {
  const { user } = useAuth();
  const [profileViews, setProfileViews] = useState<ReturnType<typeof getProfileViews>>([]);
  const [jobViews, setJobViews] = useState<ReturnType<typeof getJobViews>>([]);

  useEffect(() => {
    if (user?.id) {
      if (user.role === 'freelancer') {
        setProfileViews(getProfileViews(user.id));
      } else {
        const clientJobs = getJobs(user.id).map((j) => j.id);
        const allViews = clientJobs.flatMap((jobId) => getJobViews(jobId));
        setJobViews(allViews);
      }
    }
  }, [user?.id, user?.role]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">Please log in to view analytics.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 inline-block">Log in</Link>
        </div>
      </div>
    );
  }

  const proposals = user?.id ? getProposals({ freelancerId: user.id }) : [];
  const contracts = user?.id ? getContracts({ freelancerId: user.id }) : [];
  const invoices = user?.id ? getInvoices({ freelancerId: user.id }) : [];
  const totalEarnings = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat((i.total || '0').replace(/[^0-9.]/g, '')) || 0, 0);
  const proposalRate = proposals.length > 0 ? Math.round((contracts.length / proposals.length) * 100) : 0;

  const isFreelancer = user.role === 'freelancer';
  const views = isFreelancer ? profileViews : jobViews;
  const viewsThisWeek = views.filter((v) => Date.now() - new Date(v.viewedAt).getTime() < 7 * 24 * 60 * 60 * 1000);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Track your profile performance and engagement</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{isFreelancer ? 'Profile views' : 'Job views'}</p>
            <p className="text-3xl font-bold text-indigo-600">{views.length}</p>
            <p className="text-xs text-slate-500 mt-1">{viewsThisWeek.length} this week</p>
          </div>
          {isFreelancer && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Proposals sent</p>
                <p className="text-3xl font-bold text-amber-600">{proposals.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Hire rate</p>
                <p className="text-3xl font-bold text-green-600">{proposalRate}%</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total earnings</p>
                <p className="text-3xl font-bold text-emerald-600">${totalEarnings.toFixed(0)}</p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent views</h2>
          </div>
          {views.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No views yet. {isFreelancer ? 'Complete your profile and apply to jobs to get discovered.' : 'Post jobs to see who views them.'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {views.slice(0, 20).map((v) => (
                <div key={v.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {isFreelancer ? 'Someone viewed your profile' : 'Job viewed'}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(v.viewedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
