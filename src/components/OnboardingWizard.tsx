import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getOnboardingState, completeOnboardingStep, dismissOnboarding } from '@/utils/onboardingStorage';

const STEPS = [
  { id: 'profile', title: 'Complete your profile', link: '/profile/edit', role: 'freelancer' as const },
  { id: 'post_job', title: 'Post your first job', link: '/post-job', role: 'client' as const },
  { id: 'browse', title: 'Browse jobs or talent', link: '/find-work', role: 'freelancer' as const },
  { id: 'apply', title: 'Apply to a job', link: '/find-work', role: 'freelancer' as const },
  { id: 'hire', title: 'Hire a freelancer', link: '/find-talent', role: 'client' as const },
];

export function OnboardingWizard() {
  const { user } = useAuth();
  const [state, setState] = useState<ReturnType<typeof getOnboardingState>>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.id) setState(getOnboardingState(user.id));
  }, [user?.id]);

  if (!user || dismissed || (state?.dismissed)) return null;

  const stepsForRole = STEPS.filter((s) => s.role === user.role);
  const completed = state?.completedSteps || [];
  const pending = stepsForRole.filter((s) => !completed.includes(s.id));

  if (pending.length === 0) return null;

  const handleDismiss = () => {
    if (user?.id) dismissOnboarding(user.id);
    setDismissed(true);
  };

  const handleComplete = (stepId: string) => {
    if (user?.id) completeOnboardingStep(user.id, stepId);
    setState(getOnboardingState(user.id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">Get started</h3>
        <button type="button" onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          ×
        </button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Complete these steps to get the most out of Ribha Solutions:</p>
      <ul className="space-y-2">
        {pending.slice(0, 3).map((step) => (
          <li key={step.id} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs">○</span>
            <Link
              to={step.link}
              onClick={() => handleComplete(step.id)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {step.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
