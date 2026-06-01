import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENABLED } from '@/config/api';
import {
  fetchPublicUsers,
  fetchAllOnboardingRecords,
  syncAllDynamicDataFromApi,
  type PublicUserRecord,
  type OnboardingRecord,
} from '@/services/dynamicDataApi';
import { getJobs, type Job } from '@/utils/jobsStorage';
import { getProposals } from '@/utils/proposalsStorage';
import { getContracts, type Contract } from '@/utils/contractsStorage';
import { getAllMilestones, type Milestone } from '@/utils/milestonesStorage';

/** Server signups only — matches `users.json` / GET users.php (no local seed data). */
function normalizeSignupRow(row: PublicUserRecord): PublicUserRecord | null {
  const role = row.role === 'freelancer' || row.role === 'client' ? row.role : null;
  if (!role || !row.id || !row.email) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    mobile: row.mobile ?? null,
    gender: row.gender ?? null,
  };
}

function milestoneProgressSummary(ms: Milestone[]): string {
  if (ms.length === 0) return 'No milestones';
  const done = ms.filter((m) => m.status === 'paid' || m.status === 'completed').length;
  const pending = ms.filter((m) => m.status === 'pending' || m.status === 'in_progress').length;
  const submitted = ms.filter((m) => m.status === 'submitted').length;
  return `${done}/${ms.length} done · ${pending} active · ${submitted} awaiting approval`;
}

/** Show onboarding details without exposing PAN / bank / GSTIN on screen. */
function formatOnboardingExtra(o: OnboardingRecord): string {
  const parts: string[] = [];
  parts.push(`Type: ${o.type}`);
  if (o.technology) parts.push(`Tech: ${o.technology}`);
  if (o.type === 'organisation' && o.organisationName) parts.push(`Org: ${o.organisationName}`);
  if (o.type === 'organisation' && o.cin) parts.push(`CIN: ${o.cin}`);
  if (o.resumeFileName) parts.push(`Resume: ${o.resumeFileName}`);
  if (o.companyProfileFileName) parts.push(`Company profile: ${o.companyProfileFileName}`);
  return parts.join(' · ');
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<PublicUserRecord[]>([]);
  const [onboardingByUserId, setOnboardingByUserId] = useState<Record<string, OnboardingRecord>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      await syncAllDynamicDataFromApi();
      if (!API_ENABLED) {
        setSignups([]);
        setOnboardingByUserId({});
        setApiError('Could not load data.');
        return;
      }
      const apiUsers = await fetchPublicUsers();
      const normalized = apiUsers.map(normalizeSignupRow).filter((u): u is PublicUserRecord => u !== null);
      setSignups(normalized);

      const onboardList = await fetchAllOnboardingRecords();
      const map: Record<string, OnboardingRecord> = {};
      for (const r of onboardList) {
        if (r?.userId) map[r.userId] = r;
      }
      setOnboardingByUserId(map);
    } catch (e) {
      setApiError('Could not load data.');
      setSignups([]);
      setOnboardingByUserId({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, refreshKey]);

  const signupIds = useMemo(() => new Set(signups.map((u) => u.id)), [signups]);

  const jobsByClientId = useMemo(() => {
    const all = getJobs();
    const relevant = all.filter((j) => signupIds.has(j.clientId));
    const map = new Map<string, Job[]>();
    for (const j of relevant) {
      const list = map.get(j.clientId) ?? [];
      list.push(j);
      map.set(j.clientId, list);
    }
    return map;
  }, [signupIds, refreshKey, loading]);

  const jobsWithProgress = useMemo(() => {
    const jobs = getJobs().filter((j) => signupIds.has(j.clientId));
    const proposals = getProposals();
    const contracts = getContracts();
    const allMilestones = getAllMilestones();

    return jobs.map((job: Job) => {
      const props = proposals.filter((p) => p.jobId === job.id);
      const contract = contracts.find((c: Contract) => c.jobId === job.id) ?? null;
      const ms = allMilestones.filter((m) => m.jobId === job.id);
      const client = signups.find((u) => u.id === job.clientId);
      return {
        job,
        proposalCount: props.length,
        contract,
        milestones: ms,
        clientName: client?.name ?? job.clientId,
        clientEmail: client?.email,
      };
    });
  }, [signupIds, jobsByClientId, signups, refreshKey, loading]);

  const extraForUser = (u: PublicUserRecord): string => {
    if (u.role === 'freelancer') {
      const o = onboardingByUserId[u.id];
      return o ? formatOnboardingExtra(o) : '—';
    }
    const jobs = jobsByClientId.get(u.id) ?? [];
    const company = jobs.find((j) => j.companyName)?.companyName;
    if (company) return `Company: ${company}`;
    return '—';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Access denied.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Refreshing…' : 'Refresh data'}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
              }}
              className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium hover:opacity-90"
            >
              Log out
            </button>
          </div>
        </div>

        {apiError && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 mb-8 text-sm text-red-800 dark:text-red-200">
            {apiError}
          </div>
        )}

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Signups ({signups.length})</h2>
          {loading && signups.length === 0 && !apiError ? (
            <p className="text-slate-500">Loading…</p>
          ) : signups.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No signups yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 text-left text-slate-500 dark:text-slate-400">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium">Mobile</th>
                    <th className="p-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700/80">
                      <td className="p-3 text-slate-900 dark:text-white font-medium">{u.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="p-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{u.mobile ?? '—'}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-xs max-w-md">{extraForUser(u)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Projects & progress ({jobsWithProgress.length})</h2>
          {jobsWithProgress.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No projects yet.</p>
          ) : (
            <div className="space-y-4">
              {jobsWithProgress.map(
                ({ job, proposalCount, contract, milestones, clientName, clientEmail }) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Client: {clientName}
                          {clientEmail ? ` (${clientEmail})` : ''} · Budget: {job.budget} · Status:{' '}
                          <strong>{job.status}</strong>
                        </p>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 lg:text-right">
                        <div>Proposals: {proposalCount}</div>
                        {contract ? (
                          <div>
                            Contract: <span className="font-medium text-indigo-600 dark:text-indigo-400">{contract.status}</span> with{' '}
                            {contract.freelancerName}
                          </div>
                        ) : (
                          <div className="text-slate-400">No hire / contract yet</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Milestones: </span>
                      {milestoneProgressSummary(milestones)}
                    </div>
                    {milestones.length > 0 && (
                      <ul className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        {milestones.slice(0, 8).map((m) => (
                          <li key={m.id}>
                            {m.title}: <span className="text-slate-700 dark:text-slate-300">{m.status}</span>
                            {m.amount ? ` · ${m.amount}` : ''}
                          </li>
                        ))}
                        {milestones.length > 8 && <li>…and {milestones.length - 8} more</li>}
                      </ul>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
