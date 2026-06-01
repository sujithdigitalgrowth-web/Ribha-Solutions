import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { hasCompletedOnboarding } from '@/utils/freelancerOnboardingStorage';
import { ClientDashboard } from './ClientDashboard';
import { FreelancerDashboard } from './FreelancerDashboard';

export function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'freelancer' && !hasCompletedOnboarding(user.id)) {
    return <Navigate to="/freelancer-onboarding" replace />;
  }

  if (user.role === 'client') {
    return <ClientDashboard />;
  }

  return <FreelancerDashboard />;
}
