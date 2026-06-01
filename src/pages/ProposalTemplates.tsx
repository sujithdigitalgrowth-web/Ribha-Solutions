import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProposalTemplates, addProposalTemplate, removeProposalTemplate, type ProposalTemplate } from '@/utils/proposalTemplatesStorage';

export function ProposalTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [timeline, setTimeline] = useState('');

  useEffect(() => {
    if (user?.id) setTemplates(getProposalTemplates(user.id));
  }, [user?.id]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !name.trim() || !coverLetter.trim()) return;
    addProposalTemplate({
      userId: user.id,
      name: name.trim(),
      coverLetter: coverLetter.trim(),
      proposedRate: proposedRate.trim(),
      timeline: timeline.trim(),
    });
    setName('');
    setCoverLetter('');
    setProposedRate('');
    setTimeline('');
    setShowForm(false);
    setTemplates(getProposalTemplates(user.id));
  };

  const handleRemove = (id: string) => {
    removeProposalTemplate(id);
    if (user?.id) setTemplates(getProposalTemplates(user.id));
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Proposal templates are for freelancers</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Proposal Templates</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Save reusable cover letters and rates for faster applying
        </p>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
        >
          {showForm ? 'Cancel' : '+ New template'}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Web dev projects"
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover letter</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Your default cover letter..."
                required
                rows={6}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default rate</label>
              <input
                type="text"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                placeholder="e.g. ₹500/hr"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 2-3 weeks"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save template</button>
          </form>
        )}

        {templates.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No templates yet</p>
            <p className="text-slate-500 text-sm mb-4">Create a template to apply faster</p>
            <Link to="/find-work" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Find work</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t.name}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemove(t.id)}
                    className="text-red-600 dark:text-red-400 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{t.coverLetter}</p>
                <p className="text-slate-500 text-sm mt-2">{t.proposedRate} • {t.timeline || '—'}</p>
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
