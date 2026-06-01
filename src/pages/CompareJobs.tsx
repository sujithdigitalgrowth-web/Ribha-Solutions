import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById, getJobs } from '@/utils/jobsStorage';
import { getApplicantCount, hasApplied } from '@/utils/proposalsStorage';

export function CompareJobs() {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<ReturnType<typeof getJobs>>([]);

  useEffect(() => {
    setJobs(getJobs().filter((j) => j.status === 'open'));
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const selectedJobs = selectedIds.map((id) => getJobById(id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Compare jobs</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Select up to 3 jobs to compare side by side
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => {
            const job = selectedJobs[i];
            return (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {job ? (
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{job.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{job.companyName || 'Client'}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{job.budget}</p>
                    <p className="text-slate-500 text-sm mb-2">{job.projectType} • {job.category}</p>
                    <p className="text-slate-500 text-sm mb-4">{getApplicantCount(job.id)} applicants</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skills.slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs rounded">{s}</span>
                      ))}
                    </div>
                    {user?.role === 'freelancer' && (
                      hasApplied(job.id, user.id) ? (
                        <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm">Applied</span>
                      ) : (
                        <Link to={`/apply/${job.id}`} className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                          Apply
                        </Link>
                      )
                    )}
                    <button type="button" onClick={() => toggleSelect(job.id)} className="ml-2 text-slate-500 text-sm hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="p-6 min-h-[200px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm mb-2">Select a job</p>
                    <select
                      onChange={(e) => { const id = e.target.value; if (id) toggleSelect(id); e.target.value = ''; }}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                    >
                      <option value="">Choose...</option>
                      {jobs.filter((j) => !selectedIds.includes(j.id)).map((j) => (
                        <option key={j.id} value={j.id}>{j.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Or select from list:</p>
          <div className="flex flex-wrap gap-2">
            {jobs.slice(0, 10).map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => toggleSelect(j.id)}
                disabled={selectedIds.includes(j.id) || (selectedIds.length >= 3 && !selectedIds.includes(j.id))}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedIds.includes(j.id)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {j.title.slice(0, 30)}...
              </button>
            ))}
          </div>
        </div>

        <Link to="/find-work" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Find Work
        </Link>
      </div>
    </div>
  );
}
