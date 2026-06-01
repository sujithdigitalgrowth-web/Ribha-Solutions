import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById, updateJob } from '@/utils/jobsStorage';

const CATEGORIES = [
  'Development & IT',
  'Design & Creative',
  'Sales & Marketing',
  'Writing & Translation',
  'Admin & Support',
  'Finance & Accounting',
];

const SKILL_OPTIONS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Figma', 'Adobe XD',
  'SEO', 'Content Writing', 'Data Entry', 'Project Management',
  'AWS', 'Docker', 'Kubernetes', 'Copywriting', 'Analytics',
  'Vue.js', 'Angular', 'PHP', 'Laravel', 'Java', 'Swift', 'Kotlin',
  'Flutter', 'React Native', 'MongoDB', 'PostgreSQL', 'GraphQL',
  'Illustrator', 'Sketch', 'InVision', 'Photoshop', 'Prototyping',
  'Google Ads', 'Social Media', 'Email Marketing', 'Technical Writing',
  'WordPress', 'Shopify', 'REST API', 'CI/CD', 'Testing', 'QA',
];

export function EditJob() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [projectType, setProjectType] = useState<'fixed' | 'hourly'>('fixed');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      const job = getJobById(id);
      if (job && job.clientId === user?.id) {
        setTitle(job.title);
        setDescription(job.description);
        setBudget(job.budget);
        setProjectType(job.projectType);
        setCategory(job.category);
        setSkills(job.skills);
      } else if (job) {
        setNotFound(true);
      } else {
        setNotFound(true);
      }
    }
  }, [id, user?.id]);

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!id || !user?.id) return;
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!description.trim()) {
      setError('Job description is required');
      return;
    }
    setLoading(true);
    try {
      const updated = updateJob(id, {
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim() || 'To be discussed',
        projectType,
        skills,
        category: category || 'General',
      });
      if (updated) {
        navigate(`/my-jobs/${id}`);
      } else {
        setError('Failed to update project');
      }
    } catch {
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">Project not found</p>
          <Link to="/my-jobs" className="text-indigo-600 font-semibold hover:underline">
            Back to My projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link to={id ? `/my-jobs/${id}` : '/my-jobs'} className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 mb-6">← Back</Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit project</h1>
          <p className="text-slate-600">Update your project details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project title *</label>
            <input
              type="text"
              placeholder="e.g. Website redesign for landing page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              placeholder="Describe your project requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectType"
                  value="fixed"
                  checked={projectType === 'fixed'}
                  onChange={() => setProjectType('fixed')}
                  className="text-indigo-600"
                />
                <span>Fixed price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectType"
                  value="hourly"
                  checked={projectType === 'hourly'}
                  onChange={() => setProjectType('hourly')}
                  className="text-indigo-600"
                />
                <span>Hourly</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
            <input
              type="text"
              placeholder={projectType === 'fixed' ? 'e.g. ₹50,000 - ₹1,00,000' : 'e.g. ₹500/hr'}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills required</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.filter((s) => !skills.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkills([...skills, s])}
                  className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-sm"
                >
                  + {s}
                </button>
              ))}
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
            <Link
              to={id ? `/my-jobs/${id}` : '/my-jobs'}
              className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
