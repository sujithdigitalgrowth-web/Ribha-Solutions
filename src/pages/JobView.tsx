import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById, type Job } from '@/utils/jobsStorage';
import { getApplicantCount, hasApplied } from '@/utils/proposalsStorage';
import { toggleSavedJob, isJobSaved } from '@/utils/savedJobsStorage';
import { getUserById } from '@/utils/usersStorage';
import { getClientProfile } from '@/utils/clientProfilesStorage';
import { getReviews, getAverageRating } from '@/utils/reviewsStorage';
import { JOB_CATEGORIES, RESPONSE_TIME_OPTIONS } from '@/config/categories';
import { SkeletonCard } from '@/components/Skeleton';
import { PLATFORM_FEE } from '@/config/brand';

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

function daysUntil(deadlineStr: string | undefined): number | null {
  if (!deadlineStr) return null;
  const end = new Date(deadlineStr).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
  return diffDays > 0 ? diffDays : 0;
}

export function JobView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) setJob(getJobById(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id && user?.id) setSaved(isJobSaved(id, user.id));
  }, [id, user?.id]);

  const client = job ? getUserById(job.clientId) : null;
  const clientProfile = job ? getClientProfile(job.clientId) : null;
  const applicantCount = id ? getApplicantCount(id) : 0;
  const userApplied = id && user?.id ? hasApplied(id, user.id) : false;
  const deadlineDays = job?.deadline ? daysUntil(job.deadline) : null;
  const clientReviews = job ? getReviews(job.clientId) : [];
  const clientRating = job ? getAverageRating(job.clientId) : 0;

  const handleToggleSaved = () => {
    if (!id || !user?.id) return;
    toggleSavedJob(id, user.id);
    setSaved(isJobSaved(id, user.id));
  };

  const seoJobDesc = job?.description ? job.description.slice(0, 130).trimEnd() + (job.description.length > 130 ? '…' : '') : '';
  useSeo({
    title: job
      ? `${job.title} - Freelance ${job.category ? job.category.charAt(0).toUpperCase() + job.category.slice(1) : 'Project'} Job | Ribha Solutions`
      : 'Freelance Job Details | Ribha Solutions',
    description: job
      ? `${seoJobDesc} Budget: ${job.budget}. Apply now on Ribha Solutions.`
      : 'View freelance job details and apply on Ribha Solutions.',
    path: id ? `/job/${id}` : '/find-work',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Project not found</p>
          <Link to="/find-work" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            ← Back to Find Work
          </Link>
        </div>
      </div>
    );
  }

  const isOpen = job.status === 'open' && !(job.deadline && new Date(job.deadline).getTime() < Date.now());

  const clientName = client?.name ?? 'Client';
  const clientCompany = job.companyName ?? clientProfile?.companyName ?? '—';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/find-work" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          ← Back to Find Work
        </Link>

        {/* Header: Title, status, bids, actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {job.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isOpen ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  job.status === 'closed' ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' :
                  job.status === 'in_progress' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {isOpen ? 'Open' : job.status === 'closed' ? 'Completed' : job.status === 'in_progress' ? 'In progress' : 'Expired'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-600 dark:text-slate-400">
                <span className="text-sm font-medium">
                  Proposals {applicantCount}
                </span>
                <span className="text-sm">
                  {job.budget} • {job.projectType === 'fixed' ? 'Fixed price' : 'Hourly'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {user?.id && (
                <>
                  <button
                    type="button"
                    onClick={handleToggleSaved}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title={saved ? 'Saved' : 'Save job'}
                  >
                    <svg className={`w-5 h-5 ${saved ? 'fill-indigo-600 text-indigo-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                    title="Share"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Project details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project details</h2>
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 font-medium">{job.budget}</p>
                {deadlineDays !== null && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Bidding ends in {deadlineDays} day{deadlineDays !== 1 ? 's' : ''}
                  </p>
                )}
                {job.description && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Project overview</h3>
                      <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{job.description}</p>
                    </div>
                  </>
                )}
                {job.deliverables && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Key responsibilities / Deliverables</h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{job.deliverables}</p>
                  </div>
                )}
                {job.requirements && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Requirements</h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
                {job.skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((s) => (
                        <span key={s} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.projectTags?.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {job.category && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                      {JOB_CATEGORIES.find((c) => c.name === job.category)?.icon} {job.category}
                    </span>
                  )}
                  {job.responseTime && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {RESPONSE_TIME_OPTIONS.find((o) => o.value === job.responseTime)?.label ?? job.responseTime}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Place a bid / Apply section - only when job is open and not expired */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Place a bid on this project</h2>
              {!isOpen ? (
                <p className="text-slate-600 dark:text-slate-400">
                  This project is no longer accepting proposals. You can still view the details above.
                </p>
              ) : !user ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Log in or sign up to submit a proposal.</p>
                  <div className="flex gap-3">
                    <Link to={`/login?redirect=/job/${id}`} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                      Log in
                    </Link>
                    <Link to={`/signup?redirect=/job/${id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
                      Sign up
                    </Link>
                  </div>
                </div>
              ) : userApplied ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-300 font-medium">You have already applied for this project.</p>
                  <Link to="/application-history" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">
                    View application history →
                  </Link>
                </div>
              ) : user.role !== 'freelancer' ? (
                <p className="text-slate-600 dark:text-slate-400">Only freelancers can submit proposals.</p>
              ) : (
                <Link
                  to={`/apply/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Apply for this job
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              )}
              {isOpen && user?.role === 'freelancer' && !userApplied && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  You’ll enter your bid amount, delivery time, and cover letter on the next page. A {(PLATFORM_FEE * 100).toFixed(0)}% platform fee applies to earnings.
                </p>
              )}
            </div>
          </div>

          {/* Right: About the client */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About the client</h2>
              <p className="font-medium text-slate-900 dark:text-white">{clientName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{clientCompany}</p>
              <div className="flex items-center gap-1.5 mt-2 text-sm">
                {clientReviews.length > 0 ? (
                  <>
                    <span className="text-amber-500 dark:text-amber-400 font-medium">
                      ★ {clientRating.toFixed(1)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      ({clientReviews.length} review{clientReviews.length !== 1 ? 's' : ''})
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">No reviews yet</span>
                )}
              </div>
              {clientReviews.length > 0 && clientReviews.slice(0, 2).map((r) => (
                <p key={r.id} className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 border-l-2 border-slate-200 dark:border-slate-600 pl-2">
                  "{r.comment}"
                </p>
              ))}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Posted {formatTimeAgo(job.createdAt)}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Client engagement</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-slate-400">Proposals received</span>
                    <span className="font-medium text-slate-900 dark:text-white">{applicantCount}</span>
                  </li>
                  <li>Completed projects: —</li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Verification</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span> Identity verified
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span> Payment verified
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span> Email verified
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
