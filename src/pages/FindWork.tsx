import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs, type Job } from '@/utils/jobsStorage';
import { getApplicantCount, hasApplied } from '@/utils/proposalsStorage';
import { getSavedJobIds, toggleSavedJob } from '@/utils/savedJobsStorage';
import { getProfile } from '@/utils/profilesStorage';
import { JOB_CATEGORIES, RESPONSE_TIME_OPTIONS } from '@/config/categories';
import { SkeletonList } from '@/components/Skeleton';

const JOBS_PER_PAGE = 12;

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function isJobExpired(job: Job): boolean {
  if (!job.deadline) return false;
  return new Date(job.deadline).getTime() < Date.now();
}

function JobCard({
  job,
  userId,
  savedIds,
  onToggleSaved,
  highlight,
  highlightLabel,
}: {
  job: Job;
  userId?: string;
  savedIds: string[];
  onToggleSaved: (id: string) => void;
  highlight?: 'featured' | 'recommended';
  highlightLabel?: string;
}) {
  const applicantCount = getApplicantCount(job.id);
  const userApplied = userId ? hasApplied(job.id, userId) : false;
  const expired = isJobExpired(job);
  const statusBadge = job.status === 'closed' ? 'Completed' : job.status === 'in_progress' ? 'In progress' : expired ? 'Expired' : null;
  const saved = userId ? savedIds.includes(job.id) : false;

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 p-5 hover:shadow-md ${
        highlight === 'featured'
          ? 'border-amber-200 ring-1 ring-amber-100'
          : highlight === 'recommended'
          ? 'border-indigo-200 ring-1 ring-indigo-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {highlightLabel && (
        <div className="mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            highlight === 'featured'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            {highlightLabel}
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Link
              to={`/job/${job.id}`}
              className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-base leading-snug"
            >
              {job.title}
            </Link>
            {job.urgent && (
              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200 shrink-0">
                Urgent
              </span>
            )}
            {statusBadge && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${
                statusBadge === 'Completed' ? 'bg-slate-100 text-slate-500' :
                statusBadge === 'In progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-400'
              }`}>
                {statusBadge}
              </span>
            )}
          </div>

          {/* Client name */}
          <p className="text-slate-400 text-xs mb-3">{job.companyName || 'Client'}</p>

          {/* Budget + type */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-semibold text-indigo-700 text-sm">{job.budget}</span>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
              {job.projectType === 'fixed' ? 'Fixed price' : 'Hourly'}
            </span>
            {job.category && (
              <span className="text-xs text-slate-400">
                {JOB_CATEGORIES.find((c) => c.name === job.category)?.icon} {job.category}
              </span>
            )}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.projectTags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-md font-medium">
                {tag}
              </span>
            ))}
            {job.skills.slice(0, 5).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                {s}
              </span>
            ))}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>{applicantCount} proposal{applicantCount !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>Posted {formatTimeAgo(job.createdAt)}</span>
            {job.responseTime && (
              <>
                <span>·</span>
                <span>{RESPONSE_TIME_OPTIONS.find((o) => o.value === job.responseTime)?.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {userId && (
            <button
              type="button"
              onClick={() => onToggleSaved(job.id)}
              className={`p-2 rounded-lg transition-colors ${saved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
              title={saved ? 'Saved' : 'Save job'}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
            </button>
          )}
          {userApplied ? (
            <span className="px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-lg">
              Applied
            </span>
          ) : job.status === 'open' && !expired ? (
            <Link
              to={`/job/${job.id}`}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Apply Now
            </Link>
          ) : (
            <Link
              to={`/job/${job.id}`}
              className="px-5 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function FindWork() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [projectTypeInit] = useState(searchParams.get('type') || 'all');
  const [category, setCategory] = useState('all');
  const [projectType, setProjectType] = useState<'all' | 'fixed' | 'hourly'>(
    (projectTypeInit === 'fixed' || projectTypeInit === 'hourly') ? projectTypeInit : 'all'
  );
  const [postedWithin, setPostedWithin] = useState<'all' | '24h' | '7d'>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'closed' | 'expired'>('open');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setJobs(getJobs());
    setLoading(false);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search, category, projectType, postedWithin, urgentOnly]);

  useEffect(() => {
    if (user?.id) setSavedIds(getSavedJobIds(user.id));
  }, [user?.id]);

  const filteredJobs = jobs.filter((job) => {
    const expired = isJobExpired(job);
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' && job.status === 'open' && !expired) ||
      (statusFilter === 'expired' && job.status === 'open' && expired) ||
      (statusFilter === 'in_progress' && job.status === 'in_progress') ||
      (statusFilter === 'closed' && job.status === 'closed');
    const matchSearch = !search.trim() ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      (job.category || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || (job.category || '').toLowerCase() === category.toLowerCase() || (job.category || '').toLowerCase().includes(category.toLowerCase());
    const matchType = projectType === 'all' || job.projectType === projectType;
    const matchPosted = postedWithin === 'all' || (() => {
      const age = Date.now() - new Date(job.createdAt).getTime();
      if (postedWithin === '24h') return age < 24 * 60 * 60 * 1000;
      if (postedWithin === '7d') return age < 7 * 24 * 60 * 60 * 1000;
      return true;
    })();
    const matchUrgent = !urgentOnly || job.urgent;
    return matchStatus && matchSearch && matchCategory && matchType && matchPosted && matchUrgent;
  });

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const pageJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  const featuredJobs = jobs.filter((j) => (j.featured || j.promoted) && j.status === 'open');
  const recommendedJobs = user?.id && user.role === 'freelancer'
    ? (() => {
        const profile = getProfile(user.id);
        const mySkills = (profile?.skills || []).map((s) => s.toLowerCase());
        return jobs
          .filter((j) => j.status === 'open' && !isJobExpired(j) && j.skills.some((s) => mySkills.includes(s.toLowerCase())))
          .slice(0, 5);
      })()
    : [];

  const handleToggleSaved = (jobId: string) => {
    if (!user?.id) return;
    toggleSavedJob(jobId, user.id);
    setSavedIds(getSavedJobIds(user.id));
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Find Work</h1>
              <p className="text-slate-500 text-sm mt-1">Browse projects that match your skills and expertise</p>
            </div>
            {user?.id && (
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link to="/compare-jobs" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Compare jobs
                </Link>
                <Link to="/saved-jobs" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Saved {savedIds.length > 0 && <span className="ml-1 text-indigo-600 font-semibold">({savedIds.length})</span>}
                </Link>
                {user.role === 'freelancer' && (
                  <>
                    <Link to="/job-alerts" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      Alerts
                    </Link>
                    <Link to="/proposal-templates" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      Templates
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search jobs by keyword or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Categories</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as 'all' | 'fixed' | 'hourly')}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly</option>
            </select>
            <select
              value={postedWithin}
              onChange={(e) => setPostedWithin(e.target.value as 'all' | '24h' | '7d')}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="open">Open</option>
              <option value="all">All statuses</option>
              <option value="in_progress">In progress</option>
              <option value="closed">Completed</option>
              <option value="expired">Expired</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <span className="text-sm text-slate-700 font-medium">Urgent only</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Featured */}
        {featuredJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Featured</h2>
            <div className="space-y-3">
              {featuredJobs.slice(0, 3).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  userId={user?.id}
                  savedIds={savedIds}
                  onToggleSaved={handleToggleSaved}
                  highlight="featured"
                  highlightLabel="Featured"
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommended */}
        {recommendedJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Matches your skills</h2>
            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  userId={user?.id}
                  savedIds={savedIds}
                  onToggleSaved={handleToggleSaved}
                  highlight="recommended"
                  highlightLabel="Recommended for you"
                />
              ))}
            </div>
          </div>
        )}

        {/* Main listing */}
        {loading ? (
          <SkeletonList count={6} />
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-700 mb-1">No projects found</p>
            <p className="text-slate-400 text-sm">
              {jobs.length === 0 ? 'No projects posted yet. Check back later.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <>
            {(featuredJobs.length > 0 || recommendedJobs.length > 0) && (
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">All Projects</h2>
            )}
            <p className="text-sm text-slate-400 mb-4">
              Showing <span className="font-medium text-slate-600">{(currentPage - 1) * JOBS_PER_PAGE + 1}–{Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length)}</span> of <span className="font-medium text-slate-600">{filteredJobs.length}</span> project{filteredJobs.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3">
              {pageJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  userId={user?.id}
                  savedIds={savedIds}
                  onToggleSaved={handleToggleSaved}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-800">{currentPage}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
