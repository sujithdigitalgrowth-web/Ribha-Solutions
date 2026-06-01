import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getFavorites, removeFavorite } from '@/utils/favoriteFreelancersStorage';
import { getProfile } from '@/utils/profilesStorage';
import { getUserById } from '@/utils/usersStorage';
import { getIndustryBadges, getBadgeLabel } from '@/utils/industryBadges';
import { getTitleFromSkills } from '@/config/categories';

export function FavoriteFreelancers() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ReturnType<typeof getFavorites>>([]);

  useEffect(() => {
    if (user?.id) setEntries(getFavorites(user.id));
  }, [user?.id]);

  const handleRemove = (freelancerId: string) => {
    if (!user?.id) return;
    removeFavorite(user.id, freelancerId);
    setEntries(getFavorites(user.id));
  };

  if (user?.role !== 'client') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Favorites are for clients</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Favorite Freelancers</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Freelancers you've favorited for quick access
        </p>

        {entries.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No favorites yet</p>
            <p className="text-slate-500 text-sm mb-4">Browse talent and click the heart icon on profiles you like</p>
            <Link to="/find-talent" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Find talent</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {entries.map((e) => {
              const profile = getProfile(e.freelancerId);
              const userData = getUserById(e.freelancerId);
              const badges = getIndustryBadges(e.freelancerId);
              return (
                <div key={e.freelancerId} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xl font-bold text-slate-600 dark:text-slate-300 shrink-0">
                      {userData?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{userData?.name || 'Freelancer'}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{getTitleFromSkills(profile?.skills || []) || profile?.title || 'Freelancer'}</p>
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">{profile?.hourlyRate || '—'}</p>
                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {badges.map((b) => (
                            <span key={b} className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded">
                              {getBadgeLabel(b)}
                            </span>
                          ))}
                        </div>
                      )}
                      {e.notes && <p className="text-slate-500 text-sm mt-2 italic">Note: {e.notes}</p>}
                      <div className="flex gap-2 mt-3">
                        <Link
                          to={`/freelancer/${e.freelancerId}`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                        >
                          View profile
                        </Link>
                        <Link
                          to={`/freelancer/${e.freelancerId}/invite`}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Invite to job
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(e.freelancerId)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link to="/find-talent" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Back to Find Talent
        </Link>
      </div>
    </div>
  );
}
