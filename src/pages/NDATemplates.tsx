import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getNDATemplates, addNDATemplate, type NDATemplate } from '@/utils/ndaTemplatesStorage';

export function NDATemplates() {
  const [templates, setTemplates] = useState<NDATemplate[]>(() => getNDATemplates());
  const refresh = useCallback(() => setTemplates(getNDATemplates()), []);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim() || !content.trim()) return;
    addNDATemplate(name.trim(), content.trim());
    setName('');
    setContent('');
    setShowAdd(false);
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">NDA Templates</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Use or customize NDA templates for your projects. Select one when posting a job.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/post-job" className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
              Post a job
            </Link>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
            >
              {showAdd ? 'Cancel' : 'Add custom template'}
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Add custom NDA template</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Custom NDA for SaaS"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your NDA terms..."
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 resize-none"
                />
              </div>
              <button onClick={handleAdd} disabled={!name.trim() || !content.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium">
                Save template
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{t.name}</span>
                <span className="text-slate-500 dark:text-slate-400">{expandedId === t.id ? '▼' : '▶'}</span>
              </button>
              {expandedId === t.id && (
                <div className="px-6 pb-6 pt-0 border-t border-slate-200 dark:border-slate-700">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans mt-4">
                    {t.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
