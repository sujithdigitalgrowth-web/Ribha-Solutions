import { useEffect, useState } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, Gender } from '@/contexts/AuthContext';
import { JOB_CATEGORIES } from '@/config/categories';
import { hasCompletedOnboarding } from '@/utils/freelancerOnboardingStorage';
import { emailExists } from '@/utils/usersStorage';
import { createPendingVerification, verifyOTP } from '@/utils/emailVerificationStorage';
import { API_ENABLED, api } from '@/config/api';
import { isStaticAdminEmail } from '@/config/admin';

export function SignUp() {
  useSeo({
    title: 'Sign Up Free - Join as a Freelancer or Client | Ribha Solutions',
    description: 'Create your free Ribha Solutions account. Join as a freelancer to find remote work, or sign up as a client to hire skilled talent. Get started in minutes.',
    path: '/signup',
  });
  const navigate = useNavigate();
  const { signup, completeRegistrationFromVerify, isAuthenticated, user } = useAuth();

  const [step, setStep] = useState<'role' | 'client_form' | 'freelancer_form' | 'verify_email'>('role');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [submittedAsRole, setSubmittedAsRole] = useState<'client' | 'freelancer' | null>(null);
  /** Same account type and API role as Hire talent (`client`); used only for copy on the form. */
  const [clientSignupIntent, setClientSignupIntent] = useState<'hire' | 'reseller'>('hire');

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (user.role === 'client') {
      navigate('/find-talent', { replace: true });
    } else if (hasCompletedOnboarding(user.id)) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/freelancer-onboarding', { replace: true });
    }
  }, [isAuthenticated, user?.id, user?.role, navigate]);

  const handleRoleSelect = (r: UserRole) => {
    setError('');
    if (r === 'client') {
      setClientSignupIntent('hire');
      setStep('client_form');
    } else {
      setStep('freelancer_form');
    }
  };

  const handleResellerSelect = () => {
    setError('');
    setClientSignupIntent('reseller');
    setStep('client_form');
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isStaticAdminEmail(email.trim())) {
      setError('This email is reserved for admin. Use Log in instead.');
      setLoading(false);
      return;
    }
    if (emailExists(email.trim())) {
      setError('An account with this email already exists');
      setLoading(false);
      return;
    }
    if (API_ENABLED && api.sendOtp) {
      try {
        const res = await fetch(api.sendOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            signupData: {
              name: name.trim(),
              password,
              role: 'client',
              mobile: mobile.trim() || undefined,
              options: { companyName: companyName.trim() || undefined, primaryCategory: primaryCategory || undefined, gender: gender || undefined },
            },
          }),
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          setSubmittedAsRole('client');
          setStep('verify_email');
        } else {
          setError(data.error || 'Failed to send verification code');
        }
      } catch {
        setLoading(false);
        setError('Unable to connect to server');
      }
      return;
    }
    const { otp } = createPendingVerification(email.trim(), {
      name: name.trim(),
      password,
      role: 'client',
      mobile: mobile.trim() || undefined,
      options: { companyName: companyName.trim() || undefined, primaryCategory: primaryCategory || undefined, gender: gender || undefined },
    });
    setDemoCode(otp);
    setSubmittedAsRole('client');
    setStep('verify_email');
    setLoading(false);
  };

  const handleFreelancerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isStaticAdminEmail(email.trim())) {
      setError('This email is reserved for admin. Use Log in instead.');
      setLoading(false);
      return;
    }
    if (emailExists(email.trim())) {
      setError('An account with this email already exists');
      setLoading(false);
      return;
    }
    if (API_ENABLED && api.sendOtp) {
      try {
        const res = await fetch(api.sendOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            signupData: {
              name: name.trim(),
              password,
              role: 'freelancer',
              mobile: mobile.trim() || undefined,
              options: { gender: gender || undefined },
            },
          }),
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          setSubmittedAsRole('freelancer');
          setStep('verify_email');
        } else {
          setError(data.error || 'Failed to send verification code');
        }
      } catch {
        setLoading(false);
        setError('Unable to connect to server');
      }
      return;
    }
    const { otp } = createPendingVerification(email.trim(), {
      name: name.trim(),
      password,
      role: 'freelancer',
      mobile: mobile.trim() || undefined,
      options: { gender: gender || undefined },
    });
    setDemoCode(otp);
    setSubmittedAsRole('freelancer');
    setStep('verify_email');
    setLoading(false);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (API_ENABLED && api.verifyRegister) {
      try {
        const res = await fetch(api.verifyRegister, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
        });
        const data = await res.json();
        setLoading(false);
        if (data.success && data.user) {
          const role = submittedAsRole || 'freelancer';
          const options = role === 'client'
            ? { companyName: companyName.trim() || undefined, primaryCategory: primaryCategory || undefined, gender: gender || undefined }
            : { gender: gender || undefined };
          completeRegistrationFromVerify(data.user, password, role, options as Parameters<typeof completeRegistrationFromVerify>[3]);
          navigate(role === 'client' ? '/find-talent' : '/freelancer-onboarding', { replace: true });
        } else {
          setError(data.error || 'Invalid or expired verification code');
        }
      } catch {
        setLoading(false);
        setError('Unable to connect to server');
      }
      return;
    }
    const pending = verifyOTP(email.trim(), otp);
    if (!pending) {
      setLoading(false);
      setError('Invalid or expired verification code. Please try again.');
      return;
    }
    const options = { ...pending.signupData.options, mobile: pending.signupData.mobile } as Parameters<typeof signup>[4];
    const result = await signup(
      pending.signupData.name,
      pending.email,
      pending.signupData.password,
      pending.signupData.role,
      options
    );
    setLoading(false);
    if (result.success) {
      if (pending.signupData.role === 'client') {
        navigate('/find-talent', { replace: true });
      } else {
        navigate('/freelancer-onboarding', { replace: true });
      }
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
      <div className={`w-full mx-auto ${step === 'role' ? 'max-w-5xl' : 'max-w-lg'}`}>
        {step === 'role' && (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Choose how you want to use Ribha Solutions</p>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('client')}
                className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition-colors"
              >
                <span className="text-3xl block mb-2">👔</span>
                <span className="font-semibold text-slate-900 dark:text-white">Hire talent</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Post projects and find freelancers</p>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('freelancer')}
                className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition-colors"
              >
                <span className="text-3xl block mb-2">💼</span>
                <span className="font-semibold text-slate-900 dark:text-white">Looking for work</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Looking for work — complete your profile after email verification</p>
              </button>
              <button
                type="button"
                onClick={handleResellerSelect}
                className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition-colors sm:col-span-2 lg:col-span-1"
              >
                <span className="text-3xl block mb-2">🤝</span>
                <span className="font-semibold text-slate-900 dark:text-white">Join as reseller</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Same client signup — post projects and manage talent like Hire talent</p>
              </button>
            </div>
          </>
        )}

        {step === 'client_form' && (
          <>
            <button
              type="button"
              onClick={() => {
                setStep('role');
                setClientSignupIntent('hire');
              }}
              className="text-slate-500 hover:text-indigo-600 mb-4 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {clientSignupIntent === 'reseller'
                ? "You're joining as a reseller — same account type as hiring clients"
                : "You're signing up as a client"}
            </p>
            <form onSubmit={handleClientSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company or organization name</label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary hiring category</label>
                <select
                  value={primaryCategory}
                  onChange={(e) => setPrimaryCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                >
                  <option value="">Select a category</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          </>
        )}

        {step === 'freelancer_form' && (
          <>
            <button type="button" onClick={() => setStep('role')} className="text-slate-500 hover:text-indigo-600 mb-4 text-sm">
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">You're signing up as a freelancer looking for work. After email verification, you'll complete your profile (individual or organisation) to continue.</p>
            <form onSubmit={handleFreelancerSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | '')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          </>
        )}

        {step === 'verify_email' && (
          <>
            <button
              type="button"
              onClick={() => { setStep(submittedAsRole === 'client' ? 'client_form' : 'freelancer_form'); setOtp(''); setError(''); }}
              className="text-slate-500 hover:text-indigo-600 mb-4 text-sm"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verify your email</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We've sent a 6-digit verification code to <strong className="text-slate-900 dark:text-white">{email}</strong>. Enter it below to complete your signup.
            </p>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Verification code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none bg-white dark:bg-slate-800 text-center text-lg tracking-[0.5em]"
                />
              </div>
              {!API_ENABLED && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  Demo mode: In production, this code would be sent to your email. For now, use: <strong className="text-indigo-600 dark:text-indigo-400">{demoCode}</strong>
                </p>
              )}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & create account'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
