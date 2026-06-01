import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs } from '@/utils/jobsStorage';
import { getSavedJobs, getSavedJobIds, toggleSavedJob, updateSavedJobNote, getSavedJobsByFolder, moveSavedJobToFolder } from '@/utils/savedJobsStorage';
import { getFolders, addFolder, type SavedJobFolder } from '@/utils/savedJobFoldersStorage';
import { getApplicantCount } from '@/utils/proposalsStorage';

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function SavedJobs() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [editingNoteJobId, setEditingNoteJobId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [folders, setFolders] = useState<SavedJobFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | '_all' | '_none'>('_all');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setSavedIds(getSavedJobIds(user.id));
      setFolders(getFolders(user.id));
    }
  }, [user?.id]);

  const savedEntries = user?.id ? getSavedJobs(user.id) : [];
  const byFolder = user?.id ? getSavedJobsByFolder(user.id) : {};
  const jobs = getJobs().filter((j) => j.status === 'open' && savedIds.includes(j.id));
  const entriesToShow = selectedFolderId === '_all'
    ? savedEntries
    : selectedFolderId === '_none'
    ? (byFolder['_none'] || [])
    : (byFolder[selectedFolderId] || []);
  const jobIdsToShow = new Set(entriesToShow.map((e) => e.jobId));
  const jobsToShow = jobs.filter((j) => jobIdsToShow.has(j.id));

  const handleAddFolder = () => {
    if (!user?.id || !newFolderName.trim()) return;
    addFolder(user.id, newFolderName.trim());
    setFolders(getFolders(user.id));
    setNewFolderName('');
    setShowNewFolder(false);
  };

  const handleUnsave = (jobId: string) => {
    if (!user?.id) return;
    toggleSavedJob(jobId, user.id);
    setSavedIds(getSavedJobIds(user.id));
  };

  const getNotesForJob = (jobId: string) => savedEntries.find((e) => e.jobId === jobId)?.notes;

  const handleSaveNote = (jobId: string) => {
    if (!user?.id) return;
    updateSavedJobNote(user.id, jobId, noteDraft);
    setEditingNoteJobId(null);
    setNoteDraft('');
  };

  const handleMoveToFolder = (jobId: string, folderId: string | null) => {
    if (!user?.id) return;
    moveSavedJobToFolder(user.id, jobId, folderId);
    setSavedIds(getSavedJobIds(user.id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Saved Jobs</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">Jobs you've bookmarked for later</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedFolderId('_all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFolderId === '_all' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            All ({savedEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFolderId('_none')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFolderId === '_none' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            Unfiled ({(byFolder['_none'] || []).length})
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFolderId(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedFolderId === f.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
            >
              {f.name} ({(byFolder[f.id] || []).length})
            </button>
          ))}
          {showNewFolder ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
              />
              <button type="button" onClick={handleAddFolder} className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg">Add</button>
              <button type="button" onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="px-3 py-2 text-slate-500 text-sm">Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowNewFolder(true)} className="px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-500">
              + New folder
            </button>
          )}
        </div>

        {jobsToShow.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-4">No saved jobs</p>
            <Link to="/find-work" className="text-indigo-600 font-semibold hover:underline">Browse jobs</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobsToShow.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{job.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{job.companyName || 'Client'}</p>
                  {editingNoteJobId === job.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                      />
                      <button type="button" onClick={() => handleSaveNote(job.id)} className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg">Save</button>
                      <button type="button" onClick={() => { setEditingNoteJobId(null); setNoteDraft(''); }} className="px-3 py-2 text-slate-500 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      {getNotesForJob(job.id) && <p className="text-slate-500 dark:text-slate-500 text-sm italic">Note: {getNotesForJob(job.id)}</p>}
                      <button type="button" onClick={() => { setEditingNoteJobId(job.id); setNoteDraft(getNotesForJob(job.id) || ''); }} className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:underline">
                        {getNotesForJob(job.id) ? 'Edit note' : 'Add note'}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {job.skills.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{job.budget} • {getApplicantCount(job.id)} applicants • {formatTimeAgo(job.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Link to={`/apply/${job.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
                    Apply
                  </Link>
                  <select
                    value={savedEntries.find((e) => e.jobId === job.id)?.folderId || ''}
                    onChange={(e) => handleMoveToFolder(job.id, e.target.value ? e.target.value : null)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                  >
                    <option value="">Unfiled</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleUnsave(job.id)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
