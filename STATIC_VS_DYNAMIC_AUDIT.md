# TalentForge – Static vs Dynamic Flow Audit

This document lists what is **dynamic** (API-backed or synced) vs **static** (hardcoded or localStorage-only) in the app.

---

## ✅ Already dynamic (API-backed)

| Area | Storage / API | Notes |
|------|----------------|--------|
| **Auth** | `login.php`, `register.php`, `send-otp.php`, `verify-register.php`, `update-profile.php` | Login, register, OTP, profile update use API when `VITE_API_URL` is set. |
| **Jobs** | `jobs.php` (GET/POST) + `jobsStorage` (merge with API) | Jobs sync on load; create posts to API. |
| **Proposals** | `proposals.php` (GET/POST) + `proposalsStorage` | Proposals sync; submit posts to API. |
| **Contracts** | `contracts.php` (GET/POST) + `contractsStorage` | Hire flow posts to API; list synced. |
| **Milestones** | `milestones.php` (GET/POST/PATCH) + `milestonesStorage` | Milestones per contract; status updates to API. |
| **Exam definitions** | `exam_definitions.php` (GET) | TakeExam loads from API; fallback to static `SKILL_TESTS` if empty. |
| **Exam attempts / scores** | `exam_attempts.php` (GET/POST) + `examAttemptsStorage` | Scores stored in API; “already passed” from API on login. |
| **Freelancer onboarding** | `onboarding.php` (GET/POST) + `freelancerOnboardingStorage` | Profile completion (tech, resume, bank) saved to API; synced on login. |

---

## ⚠️ Static / hardcoded (no API)

### 1. Config – categories and options

| File | What's static | Used in |
|------|----------------|--------|
| `config/categories.ts` | **JOB_CATEGORIES** (8 categories: AI, Development, Design, etc.) | FindTalent, FindWork, PostJob, JobView, JobDetail, Home, SignUp |
| `config/categories.ts` | **CATEGORY_SKILLS_MAP** (category → skills list) | FindTalent filtering, getTitleFromSkills |
| `config/categories.ts` | **PROJECT_TAGS** (Startup, Enterprise, SMB, …) | PostJob |
| `config/categories.ts` | **RESPONSE_TIME_OPTIONS** | PostJob, JobView, JobDetail, FindWork |
| `config/categories.ts` | **SKILL_TITLE_MAP** + **getTitleFromSkills** | FreelancerProfile, FindTalent, TalentShortlist, FavoriteFreelancers, CompareFreelancers |

**Possible change:** Categories/tags/options could be driven by an API (e.g. `categories.php` or `config.php`) and loaded on app init.

---

### 2. Config – skill tests (exam)

| File | What's static | Used in |
|------|----------------|--------|
| `config/skillTests.ts` | **SKILL_TESTS** (full list of exams + questions) | TakeExam (fallback when API returns empty), FreelancerOnboarding (technology dropdown) |

**Current behavior:** Exam definitions are loaded from **API** first (`exam_definitions.php`); `SKILL_TESTS` is only used as fallback. FreelancerOnboarding still uses **SKILL_TESTS** for the “Select technology” dropdown only.

**Possible change:** Technology list for onboarding could come from the same exam definitions API or a dedicated “technologies” endpoint.

---

### 3. Config – brand

| File | What's static | Used in |
|------|----------------|--------|
| `config/brand.ts` | **BRAND** (name, tagline), **COLORS**, **PLATFORM_FEE** | App-wide |

Usually kept as static config unless you need multi-tenant or CMS-driven branding.

---

### 4. Seed data (initial fill)

| Source | What's static | When it runs |
|--------|----------------|---------------|
| `utils/seedData.ts` | Reads **public/data/*.json** (projects, freelancers, clients, reviews, proposals) | Once per version (`seedIfNeeded()`) on app load when localStorage is empty |
| `AppInitializer` | Calls `seedIfNeeded()` then `syncAllDynamicDataFromApi()` | Every load |

**Behavior:** Seed fills users, profiles, jobs, contracts, proposals, reviews in **localStorage** for demo. When API is enabled, jobs/proposals/contracts/milestones are then **synced from API** and merged. Seed still adds demo users/jobs if storage was empty.

**Possible change:** In a fully API-first setup, you might skip seed for jobs/proposals/contracts and rely only on API + empty state.

---

### 5. LocalStorage-only (no API)

These flows are **static** in the sense that they are **not** synced with any backend; data exists only in the browser.

| Area | Storage key / module | Notes |
|------|------------------------|--------|
| **Notifications** | `notificationsStorage` | In-app only; no API. |
| **Messages** | `messagesStorage` | Chat threads; no API. |
| **Reviews** | `reviewsStorage` | Job/freelancer reviews; no API. |
| **Freelancer profiles** (bio, skills, badges) | `profilesStorage` | “Has passed exam” uses API when enabled; rest is local (or from update-profile API if you extend it). |
| **Saved jobs** | `savedJobsStorage`, `savedJobFoldersStorage` | Client’s saved list; no API. |
| **Favorites (freelancers)** | `favoriteFreelancersStorage` | Client’s favorites; no API. |
| **Talent shortlist** | `talentShortlistStorage` | Client’s shortlist; no API. |
| **Job alerts** | `jobAlertsStorage` | No API. |
| **Saved searches** | `savedSearchesStorage` | No API. |
| **Proposal templates** | `proposalTemplatesStorage` | No API. |
| **Job templates** | `jobTemplatesStorage` | No API. |
| **NDA templates** | `ndaTemplatesStorage` | No API. |
| **Escrow** | `escrowStorage` | No API. |
| **Wallet / transactions** | `walletStorage`, `transactionsStorage` | No API. |
| **Payment methods** | In-page localStorage in `PaymentMethods.tsx` | No API. |
| **Invoices** | `invoicesStorage` | No API. |
| **Time logs / timer** | `timeLogsStorage` | No API. |
| **Portfolio** | `portfolioStorage` | No API. |
| **Disputes** | `disputesStorage` | No API. |
| **Referrals** | `referralsStorage` | No API. |
| **Interviews** | `interviewsStorage` | No API. |
| **Client company profile** | `clientProfilesStorage` | No API. |
| **Notification preferences** | `notificationPrefsStorage` | No API. |
| **Achievements** | `achievementsStorage` | No API. |
| **Analytics / search history** | `analyticsStorage`, `searchHistoryStorage` | No API. |
| **Activity / support tickets** | `activityStorage`, `supportTicketsStorage` | No API. |
| **Invites** | `invitesStorage` | No API. |
| **Leaderboard** | Custom key in `Leaderboard.tsx` | No API. |

Making any of these “dynamic” would require adding corresponding API endpoints and sync/write logic (similar to jobs, proposals, contracts, exam, onboarding).

---

## Summary

- **Dynamic today:** Auth, jobs, proposals, contracts, milestones, exam (definitions + attempts), freelancer onboarding. All rely on `VITE_API_URL` and the PHP API.
- **Static config:** Categories, project tags, response time options, skill–title mapping, brand. Could be moved to API if you want them editable without a deploy.
- **Static fallback:** Exam definitions fallback to `SKILL_TESTS` when API returns empty; onboarding “technology” dropdown still uses `SKILL_TESTS`.
- **Seed:** One-time seed from `public/data/*.json` into localStorage; sync then merges API data. Can be reduced or removed if you go API-only for core entities.
- **LocalStorage-only (no API):** Notifications, messages, reviews, saved jobs, favorites, shortlist, alerts, templates, escrow, wallet, invoices, time logs, portfolio, disputes, referrals, and the rest of the list above.

If you tell me which area you want to make dynamic first (e.g. categories, notifications, or messages), I can outline the exact API shape and front-end changes.
