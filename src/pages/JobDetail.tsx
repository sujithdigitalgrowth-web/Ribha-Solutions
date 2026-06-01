import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById, updateJob, type Job } from '@/utils/jobsStorage';
import { JOB_CATEGORIES, RESPONSE_TIME_OPTIONS } from '@/config/categories';
import { SkeletonCard } from '@/components/Skeleton';
import { getProposals, updateProposalStatus } from '@/utils/proposalsStorage';
import { hireFreelancer, getContracts } from '@/utils/contractsStorage';
import { addNotification } from '@/utils/notificationsStorage';
import { syncProposalsForJob } from '@/services/dynamicDataApi';

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalsVersion, setProposalsVersion] = useState(0);

  useEffect(() => {
    if (id) setJob(getJobById(id));
    setLoading(false);
  }, [id]);

  // When client opens this job, fetch latest bids from API so all proposals are dynamic
  useEffect(() => {
    if (id && job?.id && user?.id && job.clientId === user.id) {
      syncProposalsForJob(job.id).then(() => setProposalsVersion((v) => v + 1));
    }
  }, [id, job?.id, user?.id, job?.clientId]);

  const proposals = useMemo(
    () => (job?.id ? getProposals({ jobId: job.id }) : []),
    [job?.id, proposalsVersion]
  );

  const handleHire = async (freelancerId: string, freelancerName: string) => {
    if (!id || !user?.id) return;
    await hireFreelancer(id, user.id, freelancerId, freelancerName);
    updateJob(id, { status: 'in_progress' });
    setJob(getJobById(id));
    addNotification({
      userId: freelancerId,
      type: 'hire',
      title: 'You were hired!',
      body: `You were hired for "${job?.title}"`,
      link: `/messages`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Project not found</p>
          <Link to="/my-jobs" className="text-indigo-600 font-semibold hover:underline">
            Back to My projects
          </Link>
        </div>
      </div>
    );
  }

  if (job.clientId !== user?.id) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">You don't have access to this project</p>
          <Link to="/my-jobs" className="text-indigo-600 font-semibold hover:underline">
            Back to My projects
          </Link>
        </div>
      </div>
    );
  }

  const statusLabel = job.status === 'open' ? 'Open' : job.status === 'in_progress' ? 'In progress' : 'Closed';
  const statusColor = job.status === 'open' ? 'bg-green-100 text-green-800' : job.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600';

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/my-jobs" className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 mb-6">← Back to My projects</Link>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-slate-600 mb-4 whitespace-pre-wrap">{job.description}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {job.projectTags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                {tag}
              </span>
            ))}
            {job.skills.map((s) => (
              <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                {s}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {job.budget} • {job.projectType === 'fixed' ? 'Fixed' : 'Hourly'}
            {job.category && ` • ${JOB_CATEGORIES.find((c) => c.name === job.category)?.icon || ''} ${job.category}`}
            {job.responseTime && ` • ${RESPONSE_TIME_OPTIONS.find((o) => o.value === job.responseTime)?.label || job.responseTime}`}
          </p>
          <Link
            to={`/my-jobs/${job.id}/edit`}
            className="inline-block mt-4 text-indigo-600 font-medium hover:underline"
          >
            Edit project
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Hiring pipeline
          </h2>
          {(() => {
            const byStatus = {
              new: proposals.filter((p) => !p.status || p.status === 'new'),
              shortlisted: proposals.filter((p) => p.status === 'shortlisted'),
              declined: proposals.filter((p) => p.status === 'declined'),
            };
            if (proposals.length === 0) {
              return (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600">No proposals yet</p>
                  <p className="text-slate-500 text-sm mt-1">Proposals will appear here when freelancers apply</p>
                </div>
              );
            }
            const renderProposal = (p: (typeof proposals)[0]) => (
              <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{p.freelancerName || 'Freelancer'}</h3>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{p.proposedRate}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{p.coverLetter}</p>
                <p className="text-xs text-slate-500 mb-1">{formatTimeAgo(p.createdAt)}</p>
                {p.ndaSigned && (
                  <div className="text-xs text-green-600 dark:text-green-400 mb-2">
                    <p>NDA signed</p>
                    {p.ndaSignatureDataUrl && (
                      <div className="mt-1">
                        <p className="text-slate-500 mb-0.5">Signature:</p>
                        <img src={p.ndaSignatureDataUrl} alt="Signature" className="h-12 border border-slate-200 dark:border-slate-600 rounded" />
                      </div>
                    )}
                    {p.ndaAddress && <p className="text-slate-500 mt-0.5">Address: {p.ndaAddress}</p>}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                      {(() => {
                        const c = getContracts({ jobId: job.id }).find((x) => x.freelancerId === p.freelancerId);
                        return c ? (
                          <>
                            <Link
                              to={`/contract/${c.id}`}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                            >
                              View contract
                            </Link>
                            <span className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">Hired</span>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleHire(p.freelancerId, p.freelancerName || 'Freelancer')}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                          >
                            Hire
                          </button>
                        );
                      })()}
                      <Link to={`/messages?with=${p.freelancerId}`} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                        Message
                      </Link>
                      {p.status !== 'shortlisted' && (
                        <button type="button" onClick={() => { updateProposalStatus(p.id, 'shortlisted'); setJob(getJobById(id!)); }} className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium">
                          Shortlist
                        </button>
                      )}
                      {p.status !== 'declined' && (
                        <button type="button" onClick={() => { updateProposalStatus(p.id, 'declined'); setJob(getJobById(id!)); }} className="px-4 py-2 text-red-600 dark:text-red-400 text-sm font-medium">
                          Decline
                        </button>
                      )}
                    </div>
                  </div>
                );

            return (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">New ({byStatus.new.length})</h3>
                  <div className="space-y-4">{byStatus.new.map(renderProposal)}</div>
                </div>
                {byStatus.shortlisted.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Shortlisted ({byStatus.shortlisted.length})</h3>
                    <div className="space-y-4">{byStatus.shortlisted.map(renderProposal)}</div>
                  </div>
                )}
                {byStatus.declined.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Declined ({byStatus.declined.length})</h3>
                    <div className="space-y-4 opacity-75">{byStatus.declined.map(renderProposal)}</div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
