import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSavedSearches,
  addSavedSearch,
  removeSavedSearch,
  updateSavedSearchMatchCount,
  type SavedSearch,
} from '@/utils/savedSearchesStorage';
import { getJobs } from '@/utils/jobsStorage';
import { useToast } from '@/contexts/ToastContext';

function countMatchingJobs(search: SavedSearch): number {
  const jobs = getJobs().filter((j) => j.status === 'open');
  return jobs.filter((job) => {
    const matchSearch = !search.searchQuery.trim() ||
      job.title.toLowerCase().includes(search.searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.searchQuery.toLowerCase()));
    const matchCategory = search.category === 'all' || (job.category || '').toLowerCase().includes(search.category.toLowerCase());
    const matchType = search.projectType === 'all' || job.projectType === search.projectType;
    const matchPosted = search.postedWithin === 'all' || (() => {
      const age = Date.now() - new Date(job.createdAt).getTime();
      if (search.postedWithin === '24h') return age < 24 * 60 * 60 * 1000;
      if (search.postedWithin === '7d') return age < 7 * 24 * 60 * 60 * 1000;
      return true;
    })();
    const matchUrgent = !search.urgentOnly || job.urgent;
    return matchSearch && matchCategory && matchType && matchPosted && matchUrgent;
  }).length;
}

export function SavedSearches() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [projectType, setProjectType] = useState<'all' | 'fixed' | 'hourly'>('all');
  const [postedWithin, setPostedWithin] = useState<'all' | '24h' | '7d'>('all');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [notifyOnMatch, setNotifyOnMatch] = useState(true);

  useEffect(() => {
    if (user?.id) setSearches(getSavedSearches(user.id));
  }, [user?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !name.trim()) return;
    addSavedSearch({
      userId: user.id,
      name: name.trim(),
      searchQuery,
      category,
      projectType,
      skills: [],
      postedWithin,
      urgentOnly,
      notifyOnMatch,
    });
    setSearches(getSavedSearches(user.id));
    setName('');
    setSearchQuery('');
    setShowForm(false);
    addToast('Search saved successfully', 'success');
  };

  const handleRemove = (id: string) => {
    removeSavedSearch(id);
    if (user?.id) setSearches(getSavedSearches(user.id));
    addToast('Search removed', 'info');
  };

  const handleRefreshCount = (s: SavedSearch) => {
    const count = countMatchingJobs(s);
    updateSavedSearchMatchCount(s.id, count);
    setSearches(getSavedSearches(user?.id || ''));
  };

  if (!user || user.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">Please log in as a freelancer to use saved searches.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 inline-block">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Searches</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Save your search filters and get notified when new jobs match</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
          >
            {showForm ? 'Cancel' : '+ New search'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Save a search</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. React jobs"
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Search query</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keywords..."
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="all">All</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="writing">Writing</option>
                  </select>
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
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={postedWithin}
                  onChange={(e) => setPostedWithin(e.target.value as 'all' | '24h' | '7d')}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="all">Any time</option>
                  <option value="24h">24h</option>
                  <option value="7d">7 days</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} className="rounded" />
                  <span className="text-sm">Urgent only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={notifyOnMatch} onChange={(e) => setNotifyOnMatch(e.target.checked)} className="rounded" />
                  <span className="text-sm">Notify when jobs match</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        {searches.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">No saved searches yet</p>
            <p className="text-sm text-slate-500 mt-1">Save a search from Find Work or create one above</p>
            <Link to="/find-work" className="text-indigo-600 dark:text-indigo-400 font-medium mt-4 inline-block">Browse jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((s) => {
              const matchCount = countMatchingJobs(s);
              return (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {s.searchQuery || 'Any'} • {s.category} • {s.projectType}
                      {s.urgentOnly && ' • Urgent'}
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                      {matchCount} matching job{matchCount !== 1 ? 's' : ''} now
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/find-work?q=${encodeURIComponent(s.searchQuery)}&type=${s.projectType}&cat=${s.category}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm"
                    >
                      Search
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRefreshCount(s)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(s.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
