import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, saveProfile } from '@/utils/profilesStorage';

const SKILL_OPTIONS = ['React', 'Node.js', 'TypeScript', 'Python', 'Figma', 'Design', 'SEO', 'Content Writing', 'Marketing', 'Data Analysis'];

export function EditProfile() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [location, setLocation] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const profile = user?.id ? getProfile(user.id) : null;

  useEffect(() => {
    if (user?.id) {
      const p = getProfile(user.id);
      if (p) {
        setTitle(p.title);
        setBio(p.bio);
        setHourlyRate(p.hourlyRate);
        setSkills(p.skills);
        setAvailability(p.availability);
        setExperience(p.experience);
        setPortfolioUrl(p.portfolioUrl || '');
        setLocation(p.location || '');
        setEmailVerified(p.emailVerified ?? false);
        setPhoneVerified(p.phoneVerified ?? false);
        setIdVerified(p.idVerified ?? false);
        setAvailabilityStatus(p.availabilityStatus || '');
      }
    }
  }, [user?.id]);

  const handleAddSkill = (s: string) => {
    if (!skills.includes(s)) setSkills([...skills, s]);
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter((x) => x !== s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const existing = getProfile(user.id);
    saveProfile({
      userId: user.id,
      title: title.trim() || 'Freelancer',
      bio: bio.trim() || '',
      hourlyRate: hourlyRate.trim() || '',
      skills,
      availability: availability.trim() || '',
      experience: experience.trim() || '',
      portfolioUrl: portfolioUrl.trim() || undefined,
      location: location.trim() || undefined,
      emailVerified,
      phoneVerified,
      idVerified,
      availabilityStatus: (availabilityStatus || undefined) as 'available_now' | 'available_soon' | 'part_time' | 'full_time' | 'not_available' | undefined,
      skillBadges: existing?.skillBadges,
    });
    setSaved(true);
  };

  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">Only freelancers can edit their profile</p>
          <Link to="/" className="text-indigo-600 font-semibold hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Link to="/find-work" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">← Back</Link>
          <Link to="/portfolio" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Manage portfolio →</Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit your profile</h1>
        <p className="text-slate-600 mb-8">Stand out to clients with a complete profile</p>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            Profile saved successfully!
          </div>
        )}

        {profile?.skillBadges && profile.skillBadges.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Your skill badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skillBadges.map((b) => (
                <span key={b.skillId} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800 text-sm">
                  <span className="font-bold text-green-600 dark:text-green-400">{b.score}%</span>
                  <span className="text-slate-700 dark:text-slate-300">{b.skillName}</span>
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">These are visible on your public profile to clients.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Professional title</label>
            <input
              type="text"
              placeholder="e.g. Full Stack Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              placeholder="Tell clients about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hourly rate</label>
            <input
              type="text"
              placeholder="e.g. ₹2,000/hr"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SKILL_OPTIONS.filter((s) => !skills.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => handleAddSkill(s)} className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 rounded text-sm">
                  + {s}
                </button>
              ))}
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                    {s} <button type="button" onClick={() => handleRemoveSkill(s)} className="ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
            <input
              type="text"
              placeholder="e.g. 20 hrs/week"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Availability badge</label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="">None</option>
              <option value="available_now">Available now</option>
              <option value="available_soon">Available soon</option>
              <option value="part_time">Part-time</option>
              <option value="full_time">Full-time</option>
              <option value="not_available">Not available</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
            <textarea
              placeholder="Describe your experience..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Verification badges</label>
            <p className="text-xs text-slate-500 mb-2">Toggle to display verification badges on your profile (mock)</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={emailVerified} onChange={(e) => setEmailVerified(e.target.checked)} className="text-indigo-600 rounded" />
                <span>Email verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={phoneVerified} onChange={(e) => setPhoneVerified(e.target.checked)} className="text-indigo-600 rounded" />
                <span>Phone verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={idVerified} onChange={(e) => setIdVerified(e.target.checked)} className="text-indigo-600 rounded" />
                <span>ID verified</span>
              </label>
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
