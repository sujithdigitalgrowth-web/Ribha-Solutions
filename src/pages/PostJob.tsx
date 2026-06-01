import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveJob } from '@/utils/jobsStorage';
import { getTemplateById, saveTemplate } from '@/utils/jobTemplatesStorage';
import { getNDATemplates } from '@/utils/ndaTemplatesStorage';
import { JOB_CATEGORIES, PROJECT_TAGS, RESPONSE_TIME_OPTIONS } from '@/config/categories';

const STEPS = [
  { id: 1, title: 'Project overview', short: 'Overview' },
  { id: 2, title: 'Budget & payment', short: 'Budget' },
  { id: 3, title: 'Category & skills', short: 'Skills' },
  { id: 4, title: 'Timeline & deadline', short: 'Timeline' },
  { id: 5, title: 'Experience & scope', short: 'Scope' },
  { id: 6, title: 'Deliverables & requirements', short: 'Deliverables' },
  { id: 7, title: 'Company & contact', short: 'Contact' },
  { id: 8, title: 'Review & submit', short: 'Review' },
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

const MIN_CHARS_TITLE = 15;
const MIN_CHARS_DESCRIPTION = 100;

export function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [projectType, setProjectType] = useState<'fixed' | 'hourly'>('fixed');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [timeline, setTimeline] = useState('');
  const [deadline, setDeadline] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'intermediate' | 'expert'>('intermediate');
  const [projectSize, setProjectSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [deliverables, setDeliverables] = useState('');
  const [requirements, setRequirements] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [requireNDA, setRequireNDA] = useState(false);
  const [ndaTemplateId, setNdaTemplateId] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');

  useEffect(() => {
    if (templateId && user?.id) {
      const t = getTemplateById(templateId);
      if (t) {
        setTitle(t.title);
        setDescription(t.description);
        setBudget(t.budget);
        setProjectType(t.projectType);
        setCategory(t.category);
        setSkills(t.skills);
        setTimeline(t.timeline || '');
        setDeliverables(t.deliverables || '');
        setRequirements(t.requirements || '');
      }
    }
  }, [templateId, user?.id]);

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

  const canProceed = () => {
    if (step === 1) return title.trim().length >= MIN_CHARS_TITLE && description.trim().length >= MIN_CHARS_DESCRIPTION;
    if (step === 2) return budget.trim().length >= 3 && paymentTerms.trim().length >= 20;
    if (step === 3) return category && skills.length >= 3;
    if (step === 4) return timeline.trim().length >= 5 && !!deadline;
    if (step === 5) return true;
    if (step === 6) return deliverables.trim().length >= 50 && requirements.trim().length >= 30;
    if (step === 7) return companyName.trim().length >= 2 && contactEmail.trim().length >= 5;
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step < 8) setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user?.id) {
      setError('Please log in to post a job');
      return;
    }
    if (title.trim().length < MIN_CHARS_TITLE) {
      setError(`Job title must be at least ${MIN_CHARS_TITLE} characters`);
      return;
    }
    if (description.trim().length < MIN_CHARS_DESCRIPTION) {
      setError(`Description must be at least ${MIN_CHARS_DESCRIPTION} characters`);
      return;
    }
    if (skills.length < 3) {
      setError('Please add at least 3 skills');
      return;
    }
    setLoading(true);
    try {
      await saveJob({
        clientId: user.id,
        title: title.trim(),
        description: description.trim(),
        budget: budget.trim() || 'To be discussed',
        projectType,
        skills,
        category: category || 'General',
        timeline: timeline.trim() || undefined,
        deadline: deadline.trim() || undefined,
        experienceLevel,
        projectSize,
        deliverables: deliverables.trim() || undefined,
        requirements: requirements.trim() || undefined,
        companyName: companyName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        paymentTerms: paymentTerms.trim() || undefined,
        requireNDA,
        ndaTemplateId: requireNDA && ndaTemplateId ? ndaTemplateId : undefined,
        responseTime: responseTime || undefined,
        projectTags: projectTags.length > 0 ? projectTags : undefined,
        featured,
        urgent,
      });
      if (saveAsTemplate) {
        saveTemplate({
          clientId: user.id,
          name: title.trim().slice(0, 50),
          title: title.trim(),
          description: description.trim(),
          budget: budget.trim() || 'To be discussed',
          projectType,
          skills,
          category: category || 'General',
          timeline: timeline.trim() || undefined,
          deliverables: deliverables.trim() || undefined,
          requirements: requirements.trim() || undefined,
        });
      }
      navigate('/my-jobs');
    } catch {
      setError('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post a project</h1>
          <p className="text-slate-600 mb-6">
            Provide detailed information to attract the best freelancers. All fields are required to ensure quality matches.
          </p>

          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    step >= s.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-0.5 mx-0.5 ${step > s.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">Step {step} of 8: {STEPS[step - 1].title}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project title * (min {MIN_CHARS_TITLE} characters)</label>
                <input
                  type="text"
                  placeholder="e.g. Website redesign for landing page with SEO optimization"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">{title.length} / {MIN_CHARS_TITLE} characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detailed description * (min {MIN_CHARS_DESCRIPTION} characters)</label>
                <textarea
                  placeholder="Describe your project in detail: goals, scope, background, what you expect from the freelancer, and any constraints..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{description.length} / {MIN_CHARS_DESCRIPTION} characters</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="projectType" value="fixed" checked={projectType === 'fixed'} onChange={() => setProjectType('fixed')} className="text-indigo-600" />
                    <span>Fixed price</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="projectType" value="hourly" checked={projectType === 'hourly'} onChange={() => setProjectType('hourly')} className="text-indigo-600" />
                    <span>Hourly</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget * (min 3 characters)</label>
                <input
                  type="text"
                  placeholder={projectType === 'fixed' ? 'e.g. ₹50,000 - ₹1,00,000' : 'e.g. ₹2,000/hr - ₹5,000/hr'}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment terms * (min 20 characters)</label>
                <textarea
                  placeholder="Describe when and how you will pay: milestones, upfront deposit, etc."
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{paymentTerms.length} / 20 characters minimum</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="">Select a category</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project tags</label>
                <p className="text-xs text-slate-500 mb-2">e.g. Startup, Enterprise – helps freelancers find relevant projects</p>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setProjectTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        projectTags.includes(tag)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {projectTags.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">Selected: {projectTags.join(', ')}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills required * (minimum 3)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium">
                    Add
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-2">Or click to add from suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.filter((s) => !skills.includes(s)).map((s) => (
                    <button key={s} type="button" onClick={() => setSkills([...skills, s])} className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-sm">
                      + {s}
                    </button>
                  ))}
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-indigo-900">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1">{skills.length} / 3 required</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected response time</label>
                <p className="text-xs text-slate-500 mb-2">How quickly will you respond to proposals?</p>
                <select
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="">Select response time</option>
                  {RESPONSE_TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project timeline * (min 5 characters)</label>
                <input
                  type="text"
                  placeholder="e.g. 4-6 weeks, estimated 80-120 hours"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred start date / deadline *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Experience level required</label>
                <div className="space-y-2">
                  {(['entry', 'intermediate', 'expert'] as const).map((l) => (
                    <label key={l} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:border-indigo-300">
                      <input type="radio" name="exp" value={l} checked={experienceLevel === l} onChange={() => setExperienceLevel(l)} className="text-indigo-600" />
                      <span className="capitalize">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project size</label>
                <div className="space-y-2">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:border-indigo-300">
                      <input type="radio" name="size" value={s} checked={projectSize === s} onChange={() => setProjectSize(s)} className="text-indigo-600" />
                      <span className="capitalize">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deliverables * (min 50 characters)</label>
                <textarea
                  placeholder="List exactly what you expect to receive: e.g. Source code, design files, documentation, deployment guide..."
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{deliverables.length} / 50 characters minimum</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional requirements * (min 30 characters)</label>
                <textarea
                  placeholder="Any other requirements: communication preferences, tools, certifications, etc."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{requirements.length} / 30 characters minimum</p>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / organization name *</label>
                <input
                  type="text"
                  placeholder="Your company or business name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact email *</label>
                <input
                  type="email"
                  placeholder="Contact email for project-related communication"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={requireNDA} onChange={(e) => setRequireNDA(e.target.checked)} className="text-indigo-600 rounded" />
                  <span>Require NDA (Non-Disclosure Agreement) before project start</span>
                </label>
              </div>
              {requireNDA && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NDA template</label>
                  <select
                    value={ndaTemplateId}
                    onChange={(e) => setNdaTemplateId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">Select a template</option>
                    {getNDATemplates().map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    <Link to="/nda-templates" className="text-indigo-600 hover:underline">View all NDA templates</Link>
                  </p>
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="text-indigo-600 rounded" />
                  <span>Feature this job (highlight on Find Work)</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="text-indigo-600 rounded" />
                  <span>Mark as urgent (show "Urgent" badge)</span>
                </label>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 mb-4">Review your project</h3>
              <div className="space-y-4 text-sm">
                <div><p className="text-slate-500 mb-0.5">Title</p><p className="font-medium text-slate-900">{title || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Description</p><p className="text-slate-700 whitespace-pre-wrap line-clamp-4">{description || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Type & budget</p><p className="font-medium text-slate-900">{projectType === 'fixed' ? 'Fixed price' : 'Hourly'} • {budget || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Payment terms</p><p className="text-slate-700 line-clamp-2">{paymentTerms || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Category</p><p className="font-medium text-slate-900">{category || '—'}</p></div>
                {projectTags.length > 0 && <div><p className="text-slate-500 mb-0.5">Project tags</p><p className="font-medium text-slate-900">{projectTags.join(', ')}</p></div>}
                <div><p className="text-slate-500 mb-0.5">Skills</p><p className="font-medium text-slate-900">{skills.join(', ') || '—'}</p></div>
                {responseTime && <div><p className="text-slate-500 mb-0.5">Response time</p><p className="font-medium text-slate-900">{RESPONSE_TIME_OPTIONS.find((o) => o.value === responseTime)?.label || responseTime}</p></div>}
                <div><p className="text-slate-500 mb-0.5">Timeline</p><p className="font-medium text-slate-900">{timeline || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Deadline</p><p className="font-medium text-slate-900">{deadline || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Experience</p><p className="font-medium text-slate-900 capitalize">{experienceLevel}</p></div>
                <div><p className="text-slate-500 mb-0.5">Project size</p><p className="font-medium text-slate-900 capitalize">{projectSize}</p></div>
                <div><p className="text-slate-500 mb-0.5">Deliverables</p><p className="text-slate-700 line-clamp-2">{deliverables || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Requirements</p><p className="text-slate-700 line-clamp-2">{requirements || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Company</p><p className="font-medium text-slate-900">{companyName || '—'}</p></div>
                <div><p className="text-slate-500 mb-0.5">Contact</p><p className="font-medium text-slate-900">{contactEmail || '—'}</p></div>
                {requireNDA && <p className="text-amber-600 font-medium">NDA required{ndaTemplateId ? ` (${getNDATemplates().find((t) => t.id === ndaTemplateId)?.name || 'template'})` : ''}</p>}
                {featured && <p className="text-indigo-600 font-medium">Featured job</p>}
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)} className="text-indigo-600 rounded" />
                  <span>Save as template for future jobs</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                Back
              </button>
            ) : (
              <button type="button" onClick={() => navigate('/find-talent')} className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                Cancel
              </button>
            )}
            <div className="flex-1" />
            {step < 8 ? (
              <button type="button" onClick={handleNext} disabled={!canProceed()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg">
                Next
              </button>
            ) : (
              <button type="submit" disabled={loading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg">
                {loading ? 'Posting...' : 'Post project'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
