const REVIEWS_KEY = 'talentforge_reviews';

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  role: 'client' | 'freelancer';
  createdAt: string;
}

export function getReviews(revieweeId?: string): Review[] {
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    const all: Review[] = data ? JSON.parse(data) : [];
    const filtered = revieweeId ? all.filter((r) => r.revieweeId === revieweeId) : all;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function getAverageRating(revieweeId: string): number {
  const reviews = getReviews(revieweeId);
  if (reviews.length === 0) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export function addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
  const data = localStorage.getItem(REVIEWS_KEY);
  const all: Review[] = data ? JSON.parse(data) : [];
  const r: Review = { ...review, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(r);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  return r;
}
