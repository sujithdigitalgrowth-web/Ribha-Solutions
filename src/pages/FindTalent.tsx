import { useState, useEffect } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUsersByRole } from '@/utils/usersStorage';
import { getProfile } from '@/utils/profilesStorage';
import { getAverageRating } from '@/utils/reviewsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { getIndustryBadges, getBadgeLabel } from '@/utils/industryBadges';
import { JOB_CATEGORIES, CATEGORY_SKILLS_MAP, getTitleFromSkills } from '@/config/categories';
import { SkeletonList } from '@/components/Skeleton';

const TALENT_PER_PAGE = 12;

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function parseRateToNumber(rate: string): number {
  if (!rate || rate === '—') return 0;
  return parseFloat(rate.replace(/[^0-9.]/g, '')) || 0;
}

function getJobSuccessScore(freelancerId: string): number {
  const contracts = getContracts({ freelancerId });
  const completed = contracts.filter((c) => c.status === 'completed').length;
  const total = contracts.length;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-semibold text-slate-700 ml-0.5">{rating > 0 ? rating.toFixed(1) : '—'}</span>
    </div>
  );
}

export function FindTalent() {
  useSeo({
    title: 'Find Freelancers - Hire Verified Talent for Any Project | Ribha Solutions',
    description: 'Browse 18,000+ verified freelancers in web development, design, marketing, writing, AI, finance, and more. Filter by skills, rate, availability, and ratings. Hire the best freelancers in India.',
    path: '/find-talent',
  });
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isClient = user?.role === 'client';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [rateFilter, setRateFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    title: string;
    rate: string;
    skills: string[];
    rating: number;
    jobsCompleted: number;
    successScore: number;
    availability: string;
    location?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    idVerified?: boolean;
    skillBadges?: Array<{ skillId: string; skillName: string; score: number }>;
  }>>([]);

  useEffect(() => {
    setCategory(searchParams.get('cat') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const users = getUsersByRole('freelancer');
    const list = users.map((u) => {
      const profile = getProfile(u.id);
      const rating = getAverageRating(u.id);
      const contracts = getContracts({ freelancerId: u.id });
      const completed = contracts.filter((c) => c.status === 'completed').length;
      const skills = profile?.skills || [];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        title: getTitleFromSkills(skills) || profile?.title || 'Freelancer',
        rate: profile?.hourlyRate || '—',
        skills,
        rating: Math.round(rating * 10) / 10,
        jobsCompleted: completed,
        successScore: getJobSuccessScore(u.id),
        availability: profile?.availability || '',
        location: profile?.location,
        emailVerified: profile?.emailVerified,
        phoneVerified: profile?.phoneVerified,
        idVerified: profile?.idVerified,
        skillBadges: profile?.skillBadges,
      };
    });
    setFreelancers(list);
    setLoading(false);
  }, []);

  const filtered = freelancers.filter((f) => {
    const matchSearch = !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const categorySkills = category !== 'all' ? (CATEGORY_SKILLS_MAP[category] || []) : [];
    const matchCategory = category === 'all' || categorySkills.some((skill) =>
      f.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
    );
    const rateNum = parseRateToNumber(f.rate);
    const matchRate = rateFilter === 'all' || (rateFilter === 'under5k' && rateNum < 5000) ||
      (rateFilter === '5k-10k' && rateNum >= 5000 && rateNum <= 10000) ||
      (rateFilter === 'over10k' && rateNum > 10000);
    const matchRating = ratingFilter === 'all' || (ratingFilter === '4plus' && f.rating >= 4) || (ratingFilter === '4.5plus' && f.rating >= 4.5);
    const matchAvailability = availabilityFilter === 'all' || (availabilityFilter === 'available' && f.availability.toLowerCase().includes('available')) ||
      (availabilityFilter === 'part' && f.availability.toLowerCase().includes('part')) ||
      (availabilityFilter === 'full' && f.availability.toLowerCase().includes('full'));
    return matchSearch && matchCategory && matchRate && matchRating && matchAvailability;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / TALENT_PER_PAGE));
  const pageFreelancers = filtered.slice((currentPage - 1) * TALENT_PER_PAGE, currentPage * TALENT_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, rateFilter, ratingFilter, availabilityFilter]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Find Freelancers</h1>
              <p className="text-slate-500 text-sm mt-1">Browse verified talent or post a project to get proposals</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {isClient && (
                <Link to="/compare-freelancers" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Compare
                </Link>
              )}
              {isClient && (
                <Link to="/talent-shortlist" className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  My shortlist
                </Link>
              )}
              <Link to="/post-job" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                + Post a project
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by skill, keyword, or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Categories</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={rateFilter}
              onChange={(e) => setRateFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Any rate</option>
              <option value="under5k">Under ₹5,000/hr</option>
              <option value="5k-10k">₹5,000 – ₹10,000/hr</option>
              <option value="over10k">Over ₹10,000/hr</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Any rating</option>
              <option value="4plus">4.0+ stars</option>
              <option value="4.5plus">4.5+ stars</option>
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Any availability</option>
              <option value="available">Available now</option>
              <option value="part">Part-time</option>
              <option value="full">Full-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <SkeletonList count={6} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-medium text-slate-700 mb-1">No freelancers found</p>
            <p className="text-slate-400 text-sm">
              {freelancers.length === 0
                ? 'No freelancers have signed up yet.'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-5">
              Showing <span className="font-medium text-slate-600">{(currentPage - 1) * TALENT_PER_PAGE + 1}–{Math.min(currentPage * TALENT_PER_PAGE, filtered.length)}</span> of <span className="font-medium text-slate-600">{filtered.length}</span> freelancers
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pageFreelancers.map((f) => {
                const isVerified = f.emailVerified || f.phoneVerified || f.idVerified;
                return (
                  <div
                    key={f.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex-1">
                      {/* Top row */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${getAvatarColor(f.name)}`}>
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-semibold text-slate-900 text-sm">{f.name}</h3>
                            {isVerified && (
                              <span title="Verified">
                                <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">{f.title}</p>
                          {f.location && (
                            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {f.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-slate-900">{f.rate}</span>
                          {f.rate !== '—' && <span className="text-xs text-slate-400 block">/hr</span>}
                        </div>
                      </div>

                      {/* Rating & stats */}
                      <div className="flex items-center gap-3 mb-3">
                        <StarRating rating={f.rating} />
                        {f.jobsCompleted > 0 && (
                          <span className="text-xs text-slate-400">{f.jobsCompleted} job{f.jobsCompleted !== 1 ? 's' : ''}</span>
                        )}
                        {f.successScore > 0 && (
                          <span className="text-xs text-emerald-600 font-medium">{f.successScore}% success</span>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {f.skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                            {s}
                          </span>
                        ))}
                        {f.skills.length > 4 && (
                          <span className="px-2 py-0.5 text-xs text-slate-400">+{f.skills.length - 4} more</span>
                        )}
                      </div>

                      {/* Skill badges */}
                      {f.skillBadges && f.skillBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {f.skillBadges.slice(0, 2).map((b) => (
                            <span key={b.skillId} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200 flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              {b.skillName}
                            </span>
                          ))}
                          {getIndustryBadges(f.id).slice(0, 1).map((b) => (
                            <span key={b} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200">
                              {getBadgeLabel(b)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-5">
                      <Link
                        to={`/freelancer/${f.id}`}
                        className="block w-full py-2.5 text-center text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-800">{currentPage}</span> of <span className="font-semibold text-slate-800">{totalPages}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
