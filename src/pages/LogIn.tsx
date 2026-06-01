import { useEffect, useState } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasCompletedOnboarding } from '@/utils/freelancerOnboardingStorage';
import { API_ENABLED } from '@/config/api';
import { syncOnboardingForUser } from '@/services/dynamicDataApi';

export function LogIn() {
  useSeo({
    title: 'Log In | Ribha Solutions',
    description: 'Log in to your Ribha Solutions account to manage jobs, proposals, contracts, and payments. New here? Sign up free.',
    path: '/login',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    let redirectTo = '/';
    if (user.role === 'admin') redirectTo = '/admin';
    else if (user.role === 'client') redirectTo = '/find-talent';
    else if (!hasCompletedOnboarding(user.id)) redirectTo = '/freelancer-onboarding';
    else redirectTo = '/dashboard';
    navigate(redirectTo, { replace: true });
  }, [isAuthenticated, user?.id, user?.role, navigate]);

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    if (result.success && result.user) {
      // Ensure API-backed gating data is synced before we decide where to send the user.
      if (API_ENABLED && result.user.role === 'freelancer') {
        await syncOnboardingForUser(result.user.id);
      }
      setLoading(false);
      let redirectTo = '/';
      if (result.user.role === 'admin') redirectTo = '/admin';
      else if (result.user.role === 'client') redirectTo = '/find-talent';
      else if (!hasCompletedOnboarding(result.user.id)) redirectTo = '/freelancer-onboarding';
      else redirectTo = '/dashboard';
      const target =
        from === '/' || from === '/login'
          ? redirectTo
          : result.user.role === 'admin'
            ? redirectTo
            : result.user.role === 'freelancer' && !hasCompletedOnboarding(result.user.id)
              ? redirectTo
              : from;
      navigate(target, { replace: true });
    } else {
      setLoading(false);
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Log in</h1>
        <p className="text-slate-600 mb-8">Welcome back</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
