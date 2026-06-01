import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById } from '@/utils/usersStorage';
import { getProfile } from '@/utils/profilesStorage';
import { getReviews, getAverageRating } from '@/utils/reviewsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { recordProfileView } from '@/utils/analyticsStorage';
import { addToShortlist, isShortlisted, removeFromShortlistByFreelancer } from '@/utils/talentShortlistStorage';
import { toggleFavorite, isFavorite } from '@/utils/favoriteFreelancersStorage';
import { getPortfolioItems } from '@/utils/portfolioStorage';
import { getIndustryBadges, getBadgeLabel } from '@/utils/industryBadges';
import { getTitleFromSkills } from '@/config/categories';

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];
function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm font-semibold text-slate-700">{rating > 0 ? (Math.round(rating * 10) / 10).toFixed(1) : '—'}</span>
      <span className="text-sm text-slate-400">({count} review{count !== 1 ? 's' : ''})</span>
    </div>
  );
}

function getJobSuccessScore(freelancerId: string): number {
  const contracts = getContracts({ freelancerId });
  const completed = contracts.filter((c) => c.status === 'completed').length;
  const total = contracts.length;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function FreelancerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setShortlistKey] = useState(0);
  const [, setFavoritesKey] = useState(0);

  const freelancerUser = id ? getUserById(id) : null;
  const profile = id ? getProfile(id) : null;
  const isFreelancer = freelancerUser?.role === 'freelancer';

  const seoFreelancerName = (freelancerUser && isFreelancer) ? freelancerUser.name : null;
  const seoFreelancerTitle = getTitleFromSkills(profile?.skills ?? []);
  const seoSkillsList = (profile?.skills ?? []).slice(0, 3).join(', ');
  useSeo({
    title: seoFreelancerName
      ? `${seoFreelancerName} - ${seoFreelancerTitle || 'Freelancer'} | Ribha Solutions`
      : 'Freelancer Profile | Ribha Solutions',
    description: seoFreelancerName
      ? `Hire ${seoFreelancerName}, a verified ${seoFreelancerTitle || 'freelancer'} on Ribha Solutions.${seoSkillsList ? ` Expert in ${seoSkillsList}.` : ''} View portfolio, reviews, and contact to get started.`
      : 'View freelancer profile, portfolio, and reviews on Ribha Solutions.',
    path: id ? `/freelancer/${id}` : '/find-talent',
    type: 'profile',
  });

  if (user?.id && id) recordProfileView(id, user.id);

  const handleInviteToJob = () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'client') { navigate('/find-talent'); return; }
    navigate(`/freelancer/${id}/invite`);
  };

  if (!freelancerUser || !isFreelancer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Freelancer not found</p>
          <Link to="/find-talent" className="text-indigo-600 font-semibold hover:underline">
            ← Back to Find Freelancers
          </Link>
        </div>
      </div>
    );
  }

  const rating = getAverageRating(id!);
  const reviews = getReviews(id!);
  const contracts = getContracts({ freelancerId: id! });
  const jobsCompleted = contracts.filter((c) => c.status === 'completed').length;
  const successScore = getJobSuccessScore(id!);
  const portfolioItems = getPortfolioItems(id!);
  const industryBadges = getIndustryBadges(id!);
  const isVerified = profile?.emailVerified || profile?.phoneVerified || profile?.idVerified;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link to="/find-talent" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Find Freelancers
        </Link>

        {/* ── Main profile card ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-5">
          <div className="p-7">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">

              {/* Avatar */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${getAvatarColor(freelancerUser.name)}`}>
                {freelancerUser.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + badges */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">{freelancerUser.name}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {industryBadges.map((b) => (
                    <span key={b} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                      {getBadgeLabel(b)}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <p className="text-slate-500 text-sm mb-3">{getTitleFromSkills(profile?.skills || []) || profile?.title || 'Freelancer'}</p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-5 mb-4">
                  <StarRating rating={rating} count={reviews.length} />
                  {jobsCompleted > 0 && (
                    <span className="text-sm text-slate-500">{jobsCompleted} job{jobsCompleted !== 1 ? 's' : ''} completed</span>
                  )}
                  {successScore > 0 && (
                    <span className="text-sm font-semibold text-emerald-600">{successScore}% success</span>
                  )}
                  {profile?.hourlyRate && (
                    <span className="text-sm font-bold text-indigo-700">{profile.hourlyRate}/hr</span>
                  )}
                  {profile?.location && (
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile?.availabilityStatus && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      profile.availabilityStatus === 'available_now' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      profile.availabilityStatus === 'available_soon' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {profile.availabilityStatus === 'available_now' ? 'Available now' :
                       profile.availabilityStatus === 'available_soon' ? 'Available soon' :
                       profile.availabilityStatus === 'part_time' ? 'Part-time' :
                       profile.availabilityStatus === 'full_time' ? 'Full-time' : 'Not available'}
                    </span>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(profile?.skills || []).map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Skill badges */}
                {profile?.skillBadges && profile.skillBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skillBadges.map((b) => (
                      <span key={b.skillId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {b.skillName} ({b.score}%)
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{profile.bio}</p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleInviteToJob}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    Invite to Job
                  </button>
                  <Link
                    to={`/messages?with=${id}`}
                    className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
                  >
                    Message
                  </Link>
                  {user?.role === 'client' && (
                    <>
                      {(() => {
                        const shortlisted = isShortlisted(user.id, id!);
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (shortlisted) removeFromShortlistByFreelancer(user.id, id!);
                              else addToShortlist({ clientId: user.id, freelancerId: id!, freelancerName: freelancerUser.name });
                              setShortlistKey((k) => k + 1);
                            }}
                            className={`px-5 py-2.5 border rounded-lg font-semibold text-sm transition-colors ${
                              shortlisted
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {shortlisted ? '✓ In shortlist' : '+ Shortlist'}
                          </button>
                        );
                      })()}
                      {(() => {
                        const fav = isFavorite(id!, user.id);
                        return (
                          <button
                            type="button"
                            onClick={() => { toggleFavorite(user.id, id!); setFavoritesKey((k) => k + 1); }}
                            className={`px-5 py-2.5 border rounded-lg font-semibold text-sm transition-colors ${
                              fav
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {fav ? '♥ Favorited' : '♡ Favorite'}
                          </button>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Portfolio ── */}
        {portfolioItems.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Portfolio</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolioItems.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    {item.imageUrl.startsWith('data:') ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Reviews</h2>
            <div className="space-y-5">
              {reviews.slice(0, 5).map((r) => (
                <div key={r.id} className="pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{r.rating}/5</span>
                    <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
