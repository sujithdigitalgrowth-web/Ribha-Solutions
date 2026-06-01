import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getClientProfile, saveClientProfile, type ClientProfile } from '@/utils/clientProfilesStorage';
import { useToast } from '@/contexts/ToastContext';

export function ClientCompanyProfile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [, setProfile] = useState<ClientProfile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (user?.id) {
      const p = getClientProfile(user.id);
      setProfile(p ?? null);
      if (p) {
        setCompanyName(p.companyName);
        setDescription(p.description);
        setWebsite(p.website || '');
        setIndustry(p.industry || '');
        setLogoUrl(p.logoUrl || '');
      }
    }
  }, [user?.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    saveClientProfile({
      userId: user.id,
      companyName: companyName.trim(),
      description: description.trim(),
      website: website.trim() || undefined,
      industry: industry.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });
    setProfile(getClientProfile(user.id));
    addToast('Company profile saved', 'success');
  };

  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">Company profiles are for clients only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Company Profile</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Showcase your company to attract top talent</p>

        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
              required
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology, Healthcare"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">About your company</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your company, mission, and what you're looking for..."
              rows={5}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="Logo preview" className="h-16 w-16 object-contain rounded border border-slate-200 dark:border-slate-600" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
          <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
