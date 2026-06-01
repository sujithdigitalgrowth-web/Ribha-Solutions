import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTemplates, deleteTemplate } from '@/utils/jobTemplatesStorage';

export function JobTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReturnType<typeof getTemplates>>([]);

  useEffect(() => {
    if (user?.id) setTemplates(getTemplates(user.id));
  }, [user?.id]);

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    if (user?.id) setTemplates(getTemplates(user.id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Templates</h1>
            <p className="text-slate-600">Save and reuse job posts</p>
          </div>
          <Link to="/post-job" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
            + New job
          </Link>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-4">No templates yet</p>
            <p className="text-slate-500 text-sm mb-6">When you post a job, you can save it as a template for future use.</p>
            <Link to="/post-job" className="text-indigo-600 font-semibold hover:underline">Post a job</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-6 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{t.name}</h3>
                  <p className="text-slate-600 text-sm mt-1">{t.title}</p>
                  <p className="text-slate-500 text-sm mt-2">{t.budget} • {t.projectType} • {t.skills.slice(0, 3).join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/post-job?template=${t.id}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                  >
                    Use
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    Delete
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
