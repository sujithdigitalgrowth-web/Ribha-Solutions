import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasCompletedOnboarding } from '@/utils/freelancerOnboardingStorage';

interface RoleGuardProps {
  children: React.ReactNode;
  allowRole: 'client' | 'freelancer';
  requireAuth?: boolean;
}

export function RoleGuard({ children, allowRole, requireAuth = false }: RoleGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAuthenticated || !user) return <>{children}</>;

  if (user.role !== allowRole) {
    let redirectTo = '/';
    if (user.role === 'client') redirectTo = '/find-talent';
    else if (!hasCompletedOnboarding(user.id)) redirectTo = '/freelancer-onboarding';
    else redirectTo = '/find-work';
    return <Navigate to={redirectTo} replace />;
  }

  if (allowRole === 'freelancer' && !hasCompletedOnboarding(user.id)) {
    return <Navigate to="/freelancer-onboarding" replace />;
  }

  return <>{children}</>;
}
