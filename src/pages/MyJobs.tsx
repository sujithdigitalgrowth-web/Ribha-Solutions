import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs, type Job } from '@/utils/jobsStorage';

export function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (user?.id) {
      setJobs(getJobs(user.id));
    }
  }, [user?.id]);

  const statusLabel = (status: Job['status']) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In progress';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const statusColor = (status: Job['status']) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'closed': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My projects</h1>
            <p className="text-slate-600">View and manage your posted projects</p>
          </div>
          <Link
            to="/post-job"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            + Post a project
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-6">You haven't posted any projects yet.</p>
            <p className="text-slate-500 text-sm mb-6">
              Post a project to receive proposals from skilled freelancers.
            </p>
            <Link
              to="/post-job"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              Post your first project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">{job.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {job.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">
                      {job.budget} • {job.projectType === 'fixed' ? 'Fixed' : 'Hourly'} • {job.category}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${statusColor(job.status)}`}
                  >
                    {statusLabel(job.status)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                  <Link
                    to={`/my-jobs/${job.id}`}
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    View proposals
                  </Link>
                  <Link
                    to={`/my-jobs/${job.id}/edit`}
                    className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
