import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { syncExamAttemptsForUser, syncOnboardingForUser } from '@/services/dynamicDataApi';

/**
 * When a freelancer is logged in, sync exam attempts and onboarding from API for badges and profile state.
 */
export function SyncFreelancerExamAttempts() {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === 'freelancer' && user?.id) {
      syncExamAttemptsForUser(user.id);
      syncOnboardingForUser(user.id);
    }
  }, [user?.id, user?.role]);
  return null;
}
