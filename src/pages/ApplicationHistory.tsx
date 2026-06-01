import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProposals } from '@/utils/proposalsStorage';
import { getJobById } from '@/utils/jobsStorage';
import { getContracts } from '@/utils/contractsStorage';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function ApplicationHistory() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<ReturnType<typeof getProposals>>([]);

  useEffect(() => {
    if (user?.id) setProposals(getProposals({ freelancerId: user.id }));
  }, [user?.id]);

  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Application history is for freelancers</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Application History</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Track your proposals and their status
        </p>

        {proposals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No applications yet</p>
            <Link to="/find-work" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Find work</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((p) => {
              const job = getJobById(p.jobId);
              const contract = getContracts({ jobId: p.jobId }).find((c) => c.freelancerId === p.freelancerId);
              const statusLabel = contract ? 'Hired' : p.status === 'shortlisted' ? 'Shortlisted' : p.status === 'declined' ? 'Declined' : 'Under review';
              const statusColor = contract ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                p.status === 'shortlisted' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                p.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
              return (
                <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{job?.title || 'Job'}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{p.proposedRate} • {p.timeline?.slice(0, 50) || '—'}</p>
                      <p className="text-slate-500 text-sm mt-1">Applied {formatTimeAgo(p.createdAt)}</p>
                      {contract && (
                        <p className="text-slate-500 text-xs mt-2">
                          Open contract to see milestones and request clearance when work is done.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      {contract ? (
                        <Link to={`/contract/${contract.id}`} className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                          View contract
                        </Link>
                      ) : (
                        <Link to={`/apply/${p.jobId}`} className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link to="/find-work" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Back to Find Work
        </Link>
      </div>
    </div>
  );
}
