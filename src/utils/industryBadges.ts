import { getReviews, getAverageRating } from './reviewsStorage';
import { getContracts } from './contractsStorage';

export type IndustryBadge = 'top_rated' | 'rising_talent' | 'client_favorite';

export function getIndustryBadges(freelancerId: string): IndustryBadge[] {
  const badges: IndustryBadge[] = [];
  const reviews = getReviews(freelancerId);
  const rating = getAverageRating(freelancerId);
  const contracts = getContracts({ freelancerId });
  const completed = contracts.filter((c) => c.status === 'completed').length;

  if (reviews.length >= 5 && rating >= 4.8) badges.push('top_rated');
  if (contracts.length >= 1 && contracts.length <= 5 && completed > 0) badges.push('rising_talent');
  if (reviews.length >= 3 && rating >= 4.5) badges.push('client_favorite');

  return badges;
}

export function getBadgeLabel(badge: IndustryBadge): string {
  switch (badge) {
    case 'top_rated': return 'Top Rated';
    case 'rising_talent': return 'Rising Talent';
    case 'client_favorite': return 'Client Favorite';
    default: return '';
  }
}
