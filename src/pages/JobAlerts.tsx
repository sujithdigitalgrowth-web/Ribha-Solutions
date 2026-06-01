import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobAlerts, addJobAlert, removeJobAlert, type JobAlert } from '@/utils/jobAlertsStorage';
import { getJobs } from '@/utils/jobsStorage';

export function JobAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectType, setProjectType] = useState<'all' | 'fixed' | 'hourly'>('all');

  useEffect(() => {
    if (user?.id) setAlerts(getJobAlerts(user.id));
  }, [user?.id]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !name.trim()) return;
    addJobAlert({
      userId: user.id,
      name: name.trim(),
      searchQuery: searchQuery.trim(),
      category: 'all',
      projectType,
      skills: [],
    });
    setName('');
    setSearchQuery('');
    setShowForm(false);
    setAlerts(getJobAlerts(user.id));
  };

  const handleRemove = (id: string) => {
    removeJobAlert(id);
    if (user?.id) setAlerts(getJobAlerts(user.id));
  };

  const getMatchingCount = (alert: JobAlert) => {
    const jobs = getJobs().filter((j) => j.status === 'open');
    return jobs.filter((j) => {
      const matchSearch = !alert.searchQuery || j.title.toLowerCase().includes(alert.searchQuery.toLowerCase()) ||
        j.skills.some((s) => s.toLowerCase().includes(alert.searchQuery.toLowerCase()));
      const matchType = alert.projectType === 'all' || j.projectType === alert.projectType;
      return matchSearch && matchType;
    }).length;
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Job alerts are for freelancers</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Job Alerts</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Save searches and get notified when new jobs match (mock - check Find Work for matches)
        </p>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
        >
          {showForm ? 'Cancel' : '+ Create alert'}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alert name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React jobs under ₹50,000"
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search keyword</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. React, Node"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as 'all' | 'fixed' | 'hourly')}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="all">All</option>
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save alert</button>
          </form>
        )}

        {alerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No job alerts yet</p>
            <p className="text-slate-500 text-sm mb-4">Create an alert to save your search and see matching jobs</p>
            <Link to="/find-work" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Browse jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{alert.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    {alert.searchQuery || 'Any'} • {alert.projectType === 'all' ? 'All types' : alert.projectType}
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">{getMatchingCount(alert)} matching jobs</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/find-work?q=${encodeURIComponent(alert.searchQuery)}&type=${alert.projectType}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                  >
                    View jobs
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(alert.id)}
                    className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link to="/find-work" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Back to Find Work
        </Link>
      </div>
    </div>
  );
}
