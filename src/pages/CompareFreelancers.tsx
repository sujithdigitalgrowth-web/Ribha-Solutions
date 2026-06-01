import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUsersByRole } from '@/utils/usersStorage';
import { getProfile } from '@/utils/profilesStorage';
import { getAverageRating } from '@/utils/reviewsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { getIndustryBadges, getBadgeLabel } from '@/utils/industryBadges';
import { getTitleFromSkills } from '@/config/categories';

function getJobSuccessScore(freelancerId: string): number {
  const contracts = getContracts({ freelancerId });
  const completed = contracts.filter((c) => c.status === 'completed').length;
  return contracts.length ? Math.round((completed / contracts.length) * 100) : 0;
}

export function CompareFreelancers() {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<ReturnType<typeof getUsersByRole>>([]);

  useEffect(() => {
    setFreelancers(getUsersByRole('freelancer'));
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const selected = selectedIds.map((id) => freelancers.find((f) => f.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Compare freelancers</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Select up to 3 freelancers to compare
        </p>

        <div className="grid lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => {
            const f = selected[i];
            if (!f) {
              return (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 min-h-[250px] flex flex-col items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Select a freelancer</p>
                  <select
                    onChange={(e) => { const id = e.target.value; if (id) toggleSelect(id); e.target.value = ''; }}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                  >
                    <option value="">Choose...</option>
                    {freelancers.filter((x) => !selectedIds.includes(x.id)).map((x) => (
                      <option key={x.id} value={x.id}>{x.name}</option>
                    ))}
                  </select>
                </div>
              );
            }
            const profile = getProfile(f.id);
            const rating = getAverageRating(f.id);
            const badges = getIndustryBadges(f.id);
            const successScore = getJobSuccessScore(f.id);
            return (
              <div key={f.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{f.name}</h3>
                  <button type="button" onClick={() => toggleSelect(f.id)} className="text-slate-500 text-sm hover:underline">Remove</button>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{getTitleFromSkills(profile?.skills || []) || profile?.title || 'Freelancer'}</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{profile?.hourlyRate || '—'}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {badges.map((b) => (
                    <span key={b} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded">
                      {getBadgeLabel(b)}
                    </span>
                  ))}
                </div>
                <p className="text-slate-500 text-sm mb-4">★ {Math.round(rating * 10) / 10} • {successScore}% success</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(profile?.skills || []).slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-xs rounded">{s}</span>
                  ))}
                </div>
                {user?.role === 'client' && (
                  <Link to={`/freelancer/${f.id}`} className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                    View profile
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <Link to="/find-talent" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Find Talent
        </Link>
      </div>
    </div>
  );
}
