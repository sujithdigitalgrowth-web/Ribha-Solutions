import { API_ENABLED } from '@/config/api';
import { createJob as createJobApi, syncJobsFromApi } from '@/services/dynamicDataApi';

const JOBS_KEY = 'talentforge_jobs';

export interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: string;
  projectType: 'fixed' | 'hourly';
  skills: string[];
  category: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'closed';
  // Extended fields for detailed posting
  timeline?: string;
  deadline?: string;
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
  projectSize?: 'small' | 'medium' | 'large';
  deliverables?: string;
  requirements?: string;
  companyName?: string;
  contactEmail?: string;
  paymentTerms?: string;
  requireNDA?: boolean;
  ndaTemplateId?: string;
  featured?: boolean;
  promoted?: boolean;
  urgent?: boolean;
  attachments?: Array<{ id: string; name: string; url: string; size?: number }>;
  responseTime?: string; // e.g. "Usually responds within 24 hours"
  projectTags?: string[]; // e.g. ["Startup", "Enterprise"]
}

/** Call on app load to merge API jobs with seed data. */
export async function syncJobsFromApiIfEnabled(): Promise<void> {
  if (API_ENABLED) await syncJobsFromApi();
}

export function getJobs(clientId?: string): Job[] {
  try {
    const data = localStorage.getItem(JOBS_KEY);
    const jobs: Job[] = data ? JSON.parse(data) : [];
    return clientId ? jobs.filter((j) => j.clientId === clientId) : jobs;
  } catch {
    return [];
  }
}

export function getJobById(id: string): Job | null {
  const jobs = getJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

export function updateJob(id: string, updates: Partial<Omit<Job, 'id' | 'clientId' | 'createdAt'>>): Job | null {
  const jobs = getJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  jobs[idx] = { ...jobs[idx], ...updates };
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return jobs[idx];
}

/** Save job locally and to API when enabled. Returns the saved job (from API if successful). */
export async function saveJob(job: Omit<Job, 'id' | 'createdAt' | 'status'>): Promise<Job> {
  if (API_ENABLED) {
    const payload = {
      clientId: job.clientId,
      title: job.title,
      description: job.description,
      budget: job.budget,
      projectType: job.projectType,
      skills: job.skills,
      category: job.category,
      timeline: job.timeline,
      deadline: job.deadline,
      experienceLevel: job.experienceLevel,
      projectSize: job.projectSize,
      deliverables: job.deliverables,
      requirements: job.requirements,
      companyName: job.companyName,
      contactEmail: job.contactEmail,
      paymentTerms: job.paymentTerms,
      requireNDA: job.requireNDA,
      ndaTemplateId: job.ndaTemplateId,
      featured: job.featured,
      urgent: job.urgent,
      responseTime: job.responseTime,
      projectTags: job.projectTags,
    };
    const res = await createJobApi(payload);
    if (res.success && res.job && typeof res.job === 'object' && 'id' in res.job) {
      const apiJob = res.job as Job;
      const jobs = getJobs();
      jobs.unshift(apiJob);
      localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
      return apiJob;
    }
  }
  const jobs = getJobs();
  const newJob: Job = {
    ...job,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'open',
  };
  jobs.unshift(newJob);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return newJob;
}
