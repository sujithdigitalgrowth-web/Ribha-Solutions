/**
 * Seeds localStorage with sample projects and freelancers from JSON files.
 * Runs once on app load when storage is empty.
 */

const SEEDED_KEY = 'talentforge_seeded';
const SEED_VERSION = 'v8'; // Realistic bios, cover letters, job descriptions
const MIN_FREELANCERS = 100;
const MIN_PROJECTS = 100;

const USERS_KEY = 'talentforge_users';
const PROFILES_KEY = 'talentforge_freelancer_profiles';
const JOBS_KEY = 'talentforge_jobs';
const REVIEWS_KEY = 'talentforge_reviews';
const PROPOSALS_KEY = 'talentforge_proposals';
const CONTRACTS_KEY = 'talentforge_contracts';

interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'client' | 'freelancer';
  gender?: string;
}

interface SeedProfile {
  userId: string;
  title: string;
  bio: string;
  hourlyRate: string;
  skills: string[];
  availability: string;
  experience: string;
  updatedAt: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idVerified?: boolean;
  location?: string;
  skillBadges?: Array<{ skillId: string; skillName: string; score: number; passed: boolean; passedAt: string }>;
}

interface SeedJob {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: string;
  projectType: 'fixed' | 'hourly';
  skills: string[];
  category: string;
  createdAt: string;
  status: string;
  [key: string]: unknown;
}

interface SeedReview {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  role: 'client' | 'freelancer';
  createdAt: string;
}

interface SeedProposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancerName?: string;
  coverLetter: string;
  proposedRate: string;
  timeline: string;
  ndaSigned: boolean;
  createdAt: string;
  status?: string;
}

interface SeedFreelancer {
  user: SeedUser;
  profile: SeedProfile;
}

export async function seedIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const alreadySeeded = localStorage.getItem(SEEDED_KEY);
    if (alreadySeeded === SEED_VERSION) return;

    const [projectsRes, freelancersRes, clientsRes, reviewsRes, proposalsRes] = await Promise.all([
      fetch('/data/projects.json'),
      fetch('/data/freelancers.json'),
      fetch('/data/clients.json'),
      fetch('/data/reviews.json'),
      fetch('/data/proposals.json'),
    ]);

    if (!projectsRes.ok || !freelancersRes.ok || !clientsRes.ok || !reviewsRes.ok || !proposalsRes.ok) return;

    let projects: SeedJob[] = await projectsRes.json();
    let freelancers: SeedFreelancer[] = await freelancersRes.json();
    const clients: SeedUser[] = await clientsRes.json();
    const reviews: SeedReview[] = await reviewsRes.json();
    const proposals: SeedProposal[] = await proposalsRes.json();

    // Expand freelancers to at least MIN_FREELANCERS by cloning and varying
    const existingFreelancerEmails = new Set(freelancers.map((f) => f.user.email.toLowerCase()));
    while (freelancers.length < MIN_FREELANCERS && freelancers.length > 0) {
      const template = freelancers[freelancers.length % freelancers.length];
      const n = freelancers.length;
      const newId = crypto.randomUUID();
      const baseName = template.user.name.replace(/\s*\d+$/, '').trim() || 'Freelancer';
      const newName = `${baseName} ${n + 1}`;
      const baseEmail = (template.user.email || '').replace(/\d+@/, '@');
      const newEmail = baseEmail.includes('@') ? `freelancer${n + 1}${baseEmail}` : `freelancer${n + 1}@example.com`;
      if (existingFreelancerEmails.has(newEmail.toLowerCase())) continue;
      existingFreelancerEmails.add(newEmail.toLowerCase());
      const newUser: SeedUser = {
        ...template.user,
        id: newId,
        name: newName,
        email: newEmail,
      };
      const newProfile: SeedProfile = {
        ...template.profile,
        userId: newId,
        updatedAt: new Date().toISOString(),
        skillBadges: template.profile.skillBadges?.map((b) => ({ ...b })) ?? undefined,
      };
      freelancers = [...freelancers, { user: newUser, profile: newProfile }];
    }

    // Expand projects to at least MIN_PROJECTS by cloning and varying
    const existingProjectIds = new Set(projects.map((p) => p.id));
    while (projects.length < MIN_PROJECTS && projects.length > 0 && clients.length > 0) {
      const template = projects[projects.length % projects.length];
      const n = projects.length;
      const newId = crypto.randomUUID();
      const client = clients[n % clients.length];
      const newJob: SeedJob = {
        ...template,
        id: newId,
        clientId: client.id,
        title: template.title,
        createdAt: new Date(Date.now() - (n % 30) * 86400000).toISOString(),
        status: template.status || 'open',
      };
      if (existingProjectIds.has(newJob.id)) continue;
      existingProjectIds.add(newJob.id);
      projects = [...projects, newJob];
    }

    // Merge users (clients + freelancers)
    const existingUsers: SeedUser[] = [];
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        existingUsers.push(...(Array.isArray(parsed) ? parsed : []));
      }
    } catch {
      // ignore
    }

    const existingEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));
    const newUsers = [
      ...clients.filter((c) => !existingEmails.has(c.email.toLowerCase())),
      ...freelancers.map((f) => f.user).filter((u) => !existingEmails.has(u.email.toLowerCase())),
    ];

    if (newUsers.length > 0) {
      const allUsers = [...existingUsers, ...newUsers];
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    }

    // Merge freelancer profiles
    const existingProfiles: Record<string, SeedProfile> = {};
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      if (stored) {
        Object.assign(existingProfiles, JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    for (const f of freelancers) {
      if (!existingProfiles[f.profile.userId]) {
        existingProfiles[f.profile.userId] = f.profile;
      }
    }
    localStorage.setItem(PROFILES_KEY, JSON.stringify(existingProfiles));

    // Merge jobs (only if empty or very few)
    let existingJobs: SeedJob[] = [];
    try {
      const stored = localStorage.getItem(JOBS_KEY);
      if (stored) {
        existingJobs = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    if (existingJobs.length < 10) {
      const existingIds = new Set(existingJobs.map((j) => j.id));
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const newJobs = projects
        .filter((j) => !existingIds.has(j.id))
        .map((j, i) => {
          const status = i % 5 === 0 ? 'closed' : i % 5 === 1 ? 'in_progress' : (j.status || 'open');
          const expiredOpen = status === 'open' && i % 7 === 2;
          return { ...j, status, ...(expiredOpen ? { deadline: pastDate } : {}) };
        });
      const allJobs = [...newJobs, ...existingJobs];
      localStorage.setItem(JOBS_KEY, JSON.stringify(allJobs));
    } else {
      // Ensure some seed projects are closed or in progress (for existing data)
      const seedJobIds = new Set(projects.map((p) => p.id));
      const stored = localStorage.getItem(JOBS_KEY);
      if (stored) {
        const allJobs: SeedJob[] = JSON.parse(stored);
        let changed = false;
        for (const j of allJobs) {
          if (seedJobIds.has(j.id) && j.status === 'open') {
            const h = j.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            j.status = h % 5 === 0 ? 'closed' : h % 5 === 1 ? 'in_progress' : 'open';
            changed = true;
          }
        }
        if (changed) localStorage.setItem(JOBS_KEY, JSON.stringify(allJobs));
      }
    }

    // Seed completed contracts so each freelancer has a random jobs-completed count
    let existingContracts: Array<{ id: string; jobId: string; clientId: string; freelancerId: string; freelancerName: string; status: string; hiredAt: string; completedAt?: string }> = [];
    try {
      const stored = localStorage.getItem(CONTRACTS_KEY);
      if (stored) existingContracts = JSON.parse(stored);
    } catch {
      // ignore
    }
    const existingJobIds = new Set(existingContracts.map((c) => c.jobId));
    const seedContracts: typeof existingContracts = [];
    const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
    for (const job of projects) {
      if (existingJobIds.has(job.id) || freelancers.length === 0) continue;
      const freelancerIndex = Math.abs(hash(job.id)) % freelancers.length;
      const fl = freelancers[freelancerIndex];
      seedContracts.push({
        id: crypto.randomUUID(),
        jobId: job.id,
        clientId: job.clientId,
        freelancerId: fl.user.id,
        freelancerName: fl.user.name,
        status: 'completed',
        hiredAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      });
      existingJobIds.add(job.id);
    }
    if (seedContracts.length > 0) {
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify([...existingContracts, ...seedContracts]));
    }

    // Merge reviews (only if few or none)
    let existingReviews: SeedReview[] = [];
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      if (stored) existingReviews = JSON.parse(stored);
    } catch {
      // ignore
    }
    const existingIds = new Set(existingReviews.map((r) => r.id));
    const newReviews = reviews.filter((r) => !existingIds.has(r.id));
    let allReviews = [...newReviews, ...existingReviews];
    if (existingReviews.length < 50) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    }

    // Add reviews *of* clients (freelancer reviewed client) so "About the client" shows ratings
    const clientReviewComments = [
      'Great client. Clear requirements and quick feedback.',
      'Professional and easy to work with. Paid on time.',
      'Smooth collaboration. Would work with again.',
      'Responsive and fair. Recommended.',
      'Excellent communication throughout the project.',
      'Pleasant to work with. Clear scope and expectations.',
    ];
    const clientIds = new Set(clients.map((c) => c.id));
    const freelancerIds = freelancers.map((f) => f.user.id);
    const reviewsByReviewee = new Map<string, number>();
    for (const r of allReviews) {
      if (r.role === 'client' && clientIds.has(r.revieweeId)) {
        reviewsByReviewee.set(r.revieweeId, (reviewsByReviewee.get(r.revieweeId) ?? 0) + 1);
      }
    }
    const jobsByClient = new Map<string, SeedJob[]>();
    for (const j of projects) {
      if (!jobsByClient.has(j.clientId)) jobsByClient.set(j.clientId, []);
      jobsByClient.get(j.clientId)!.push(j);
    }
    const existingReviewKeys = new Set(allReviews.map((r) => `${r.jobId}-${r.revieweeId}-${r.reviewerId}`));
    let added = 0;
    for (const clientId of clientIds) {
      const hasEnough = (reviewsByReviewee.get(clientId) ?? 0) >= 2;
      if (hasEnough) continue;
      const clientJobs = jobsByClient.get(clientId) ?? [];
      const toReview = clientJobs.slice(0, 4);
      for (const job of toReview) {
        const numReviews = 1 + (clientId.length % 3);
        for (let i = 0; i < numReviews && freelancerIds.length > 0; i++) {
          const reviewerId = freelancerIds[(clientId.length + job.id.length + i) % freelancerIds.length];
          const key = `${job.id}-${clientId}-${reviewerId}`;
          if (existingReviewKeys.has(key)) continue;
          existingReviewKeys.add(key);
          const rating = 4 + (i % 2);
          const comment = clientReviewComments[(clientId.length + job.id.length + i) % clientReviewComments.length];
          allReviews.push({
            id: crypto.randomUUID(),
            jobId: job.id,
            reviewerId,
            revieweeId: clientId,
            rating,
            comment,
            role: 'client',
            createdAt: new Date(Date.now() - (i + 1) * 86400000 * 7).toISOString(),
          });
          added++;
        }
      }
    }
    if (added > 0) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    }

    // Merge proposals (only if few or none)
    let existingProposals: SeedProposal[] = [];
    try {
      const stored = localStorage.getItem(PROPOSALS_KEY);
      if (stored) existingProposals = JSON.parse(stored);
    } catch {
      // ignore
    }
    if (existingProposals.length < 50) {
      const existingIds = new Set(existingProposals.map((p) => p.id));
      const newProposals = proposals.filter((p) => !existingIds.has(p.id));
      const allProposals = [...newProposals, ...existingProposals];
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(allProposals));
    }

    localStorage.setItem(SEEDED_KEY, SEED_VERSION);
  } catch {
    // Silently fail - seed is optional
  }
}
