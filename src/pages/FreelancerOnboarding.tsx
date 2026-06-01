import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasCompletedOnboarding, saveOnboardingData, type OnboardingType } from '@/utils/freelancerOnboardingStorage';
import { saveOnboardingApi } from '@/services/dynamicDataApi';
import { SKILL_TESTS } from '@/config/skillTests';

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['.doc', '.docx', '.pdf'];

function isValidFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) return false;
  if (file.size > MAX_FILE_BYTES) return false;
  return true;
}

export function FreelancerOnboarding() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? '';
  const [type, setType] = useState<OnboardingType | ''>('');
  const [submitted, setSubmitted] = useState(false);

  const [technology, setTechnology] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');

  const [organisationName, setOrganisationName] = useState('');
  const [cin, setCin] = useState('');
  const [companyProfileFile, setCompanyProfileFile] = useState<File | null>(null);
  const [companyProfileError, setCompanyProfileError] = useState('');

  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [nameAsPerBank, setNameAsPerBank] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: '/freelancer-onboarding' }, replace: true });
      return;
    }
    if (user.role !== 'freelancer') {
      navigate('/find-talent', { replace: true });
      return;
    }
    if (hasCompletedOnboarding(user.id) && !submitted) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.id, user?.role, submitted, navigate]);

  // While redirecting (or auth not ready), avoid accessing user fields.
  if (!isAuthenticated || !user) return null;

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError('');
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (!isValidFile(file)) {
      setResumeError(`Please upload Word or PDF only, max ${MAX_FILE_MB} MB`);
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
  };

  const handleCompanyProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCompanyProfileError('');
    if (!file) {
      setCompanyProfileFile(null);
      return;
    }
    if (!isValidFile(file)) {
      setCompanyProfileError(`Please upload Word or PDF only, max ${MAX_FILE_MB} MB`);
      setCompanyProfileFile(null);
      return;
    }
    setCompanyProfileFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!type) {
      setError('Please select Individual or Organisation');
      setLoading(false);
      return;
    }

    if (type === 'individual') {
      if (!technology) {
        setError('Please select a technology');
        setLoading(false);
        return;
      }
      if (!resumeFile) {
        setResumeError('Please upload your resume');
        setLoading(false);
        return;
      }
    } else {
      if (!organisationName.trim()) {
        setError('Please enter organisation name');
        setLoading(false);
        return;
      }
      if (!cin.trim()) {
        setError('Please enter CIN');
        setLoading(false);
        return;
      }
      if (!technology) {
        setError('Please select a technology');
        setLoading(false);
        return;
      }
      if (!companyProfileFile) {
        setCompanyProfileError('Please upload company profile');
        setLoading(false);
        return;
      }
    }

    if (!pan.trim() || !nameAsPerBank.trim() || !ifsc.trim() || !accountNumber.trim()) {
      setError('Please fill all required bank details');
      setLoading(false);
      return;
    }

    const payload = {
      userId,
      type: type as OnboardingType,
      pan: pan.trim(),
      gstin: gstin.trim() || undefined,
      nameAsPerBank: nameAsPerBank.trim(),
      ifsc: ifsc.trim(),
      accountNumber: accountNumber.trim(),
      technology: technology || undefined,
      resumeFileName: type === 'individual' ? resumeFile?.name : undefined,
      organisationName: type === 'organisation' ? organisationName.trim() : undefined,
      cin: type === 'organisation' ? cin.trim() : undefined,
      companyProfileFileName: type === 'organisation' ? companyProfileFile?.name : undefined,
    };
    await saveOnboardingApi(payload);
    saveOnboardingData({
      ...payload,
      gstin: payload.gstin,
      technology: payload.technology,
      resumeFileName: payload.resumeFileName,
      organisationName: payload.organisationName,
      cin: payload.cin,
      companyProfileFileName: payload.companyProfileFileName,
    });

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-8">
            <span className="text-5xl block mb-4">✓</span>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">We have received your request</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We will verify the details and schedule an assessment session soon.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete your profile to get hired</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Provide your details so we can verify and schedule your assessment session.
        </p>

        {!type ? (
          <div className="space-y-4">
            <p className="font-medium text-slate-700 dark:text-slate-300">Are you an individual or representing an organisation?</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setType('individual')}
                className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition-colors"
              >
                <span className="text-2xl block mb-2">👤</span>
                <span className="font-semibold text-slate-900 dark:text-white">I am an individual</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit resume and bank details</p>
              </button>
              <button
                type="button"
                onClick={() => setType('organisation')}
                className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800 text-left transition-colors"
              >
                <span className="text-2xl block mb-2">🏢</span>
                <span className="font-semibold text-slate-900 dark:text-white">I am representing an organisation</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit company profile and bank details</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <button type="button" onClick={() => setType('')} className="text-slate-500 hover:text-indigo-600 text-sm">
              ← Change selection
            </button>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {type === 'organisation' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organisation name *</label>
                  <input
                    type="text"
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    placeholder="Enter organisation name"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CIN *</label>
                  <input
                    type="text"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    placeholder="Corporate Identification Number"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select technology *</label>
              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              >
                <option value="">Select technology</option>
                {SKILL_TESTS.map((t) => (
                  <option key={t.skillId} value={t.skillName}>{t.icon} {t.skillName}</option>
                ))}
              </select>
            </div>

            {type === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Submit resume * (Word, PDF only, max {MAX_FILE_MB} MB)</label>
                <input
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={handleResumeChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-600"
                />
                {resumeFile && <p className="text-sm text-green-600 dark:text-green-400 mt-1">Selected: {resumeFile.name}</p>}
                {resumeError && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{resumeError}</p>}
              </div>
            )}

            {type === 'organisation' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Submit company profile * (Word, PDF only, max {MAX_FILE_MB} MB)</label>
                <input
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={handleCompanyProfileChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-600"
                />
                {companyProfileFile && <p className="text-sm text-green-600 dark:text-green-400 mt-1">Selected: {companyProfileFile.name}</p>}
                {companyProfileError && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{companyProfileError}</p>}
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Bank details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PAN *</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="Permanent Account Number"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN (optional)</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="Goods and Services Tax Identification Number"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name as per bank records *</label>
                  <input
                    type="text"
                    value={nameAsPerBank}
                    onChange={(e) => setNameAsPerBank(e.target.value)}
                    placeholder="Exact name on bank account"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IFSC *</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    placeholder="Indian Financial System Code"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Bank account number"
                    required
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
