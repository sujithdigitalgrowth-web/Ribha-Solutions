import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPortfolioItems, addPortfolioItem, removePortfolioItem } from '@/utils/portfolioStorage';

export function ManagePortfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<ReturnType<typeof getPortfolioItems>>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    if (user?.id) setItems(getPortfolioItems(user.id));
  }, [user?.id]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !title.trim() || !description.trim()) return;
    addPortfolioItem({
      freelancerId: user.id,
      title: title.trim(),
      description: description.trim(),
      imageUrl: '', // Placeholder - in real app would upload
      skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      projectUrl: projectUrl.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setProjectUrl('');
    setSkills('');
    setShowForm(false);
    setItems(getPortfolioItems(user.id));
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Portfolio is for freelancers</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Portfolio</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Showcase your best work to attract clients
        </p>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="mb-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
        >
          {showForm ? 'Cancel' : '+ Add project'}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <input type="text" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
            <input type="url" placeholder="Project URL" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
            <input type="text" placeholder="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800" />
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
          </form>
        )}

        {items.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No portfolio items yet</p>
            <p className="text-slate-500 text-sm">Add projects to showcase your work</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{item.description}</p>
                  {item.projectUrl && <a href={item.projectUrl} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm">View project</a>}
                </div>
                <button type="button" onClick={() => { removePortfolioItem(item.id); setItems(getPortfolioItems(user.id)); }} className="text-red-600 dark:text-red-400 text-sm">Remove</button>
              </div>
            ))}
          </div>
        )}

        <Link to="/profile/edit" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Edit profile
        </Link>
      </div>
    </div>
  );
}
