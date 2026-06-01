# Sign-Up & Onboarding Enhancement Proposal

## Overview

This document proposes a more comprehensive, multi-step sign-up and onboarding flow for **TalentForge**, tailored for both **Clients (Hire Talent)** and **Freelancers (Find Work)**. The goal is to collect meaningful profile data early, improve match quality, and reduce drop-off from incomplete profiles.

---

## Current State

- **Single-page sign-up**: Name, email, password, role (client/freelancer)
- **No role-specific onboarding** after sign-up
- **Minimal profile data** collected at registration

---

## Proposed Architecture

### Option A: Multi-Step Sign-Up (All Before Account Creation)
User completes all steps, then account is created at the end.

### Option B: Quick Sign-Up + Onboarding Wizard (Recommended)
1. **Step 1**: Create account (email, password, name, role) — quick win
2. **Step 2**: Redirect to role-specific onboarding wizard
3. User can skip onboarding but is prompted to complete profile later

**Recommendation**: Option B for clients — lower friction. **Option C for freelancers** — skill test required before registration completes (see below).

---

## Freelancer Skill Test (Required Before Registration)

Freelancers choosing **Find work** must pass a skill assessment **before** their account is created. This ensures only qualified talent joins the platform and earns a badge from day one.

### Flow Overview

```
1. User selects role: "Find work"
2. User selects primary skill (from available tests)
3. User takes the skill exam
4. If PASS → Account creation form unlocks → User completes signup → Badge awarded
5. If FAIL → User can retry (with cooldown) or choose a different skill
```

### Step-by-Step Flow

| Step | Action | Details |
|------|--------|---------|
| 1 | **Select skill** | Dropdown or card grid of available skill tests (e.g. React, Node.js, Figma, Python, SEO) |
| 2 | **Take exam** | Multiple-choice quiz, 10–15 questions, timed (e.g. 15 min) |
| 3 | **Pass threshold** | e.g. 70% or 80% correct to pass |
| 4 | **On pass** | Show success + "Complete your registration" → Name, email, password form |
| 5 | **On fail** | Show score, "Retry in X minutes" or "Try a different skill" |
| 6 | **Badge** | Badge stored on profile: `{ skillId, passedAt, score }` — visible on freelancer card and profile |

### Skill Test Configuration (Per Skill)

| Field | Description |
|-------|-------------|
| `skillId` | e.g. `react`, `nodejs`, `figma` |
| `skillName` | Display name |
| `questions` | Array of { question, options[], correctIndex } |
| `passingScore` | e.g. 70 (%) |
| `timeLimitMinutes` | e.g. 15 |
| `maxAttemptsPerDay` | e.g. 3 (optional, to limit retries) |

### Badge Display

- **Profile**: "✓ React — Passed (85%)" with badge icon
- **Find Talent cards**: Small badge next to freelancer name
- **Job applications**: Badge shown when freelancer applies

### Retry Policy

| Scenario | Behavior |
|----------|----------|
| First fail | Can retry immediately or switch skill |
| Multiple fails | Optional: cooldown (e.g. 24h) before retrying same skill |
| Switch skill | Can select different skill and take that test instead |

### Data Model

```ts
interface SkillTestResult {
  skillId: string;
  skillName: string;
  score: number;        // 0-100
  passed: boolean;
  passedAt: string;     // ISO date
  attemptNumber: number;
}

// On User or Profile
skillBadges: SkillTestResult[];  // Only passed tests
```

### Available Skills (Initial Set)

Start with 5–8 skills that map to JOB_CATEGORIES:

- React / Frontend
- Node.js / Backend
- Python
- Figma / Design
- SEO / Marketing
- Content Writing
- Data Entry

---

## Client (Hire Talent) Onboarding Flow

### Step 1: Account Basics *(existing, keep minimal)*
- Full name
- Email
- Password (min 8 chars, strength indicator)
- Role: **Hire talent**

### Step 2: Company / Project Context
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Company or organization name | Text | Yes | Shows on job posts |
| Company size | Select | No | Startup, SMB, Enterprise, Agency, etc. |
| Industry | Select | No | Tech, Finance, Healthcare, etc. |
| Primary hiring need | Multi-select | Yes | Categories (Dev, Design, Marketing, etc.) |
| Typical project budget | Select | No | Under $500, $500–2K, $2K–10K, $10K+ |

### Step 3: Verification & Trust
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Phone number | Tel | Optional | SMS verification (future) |
| Email verification | — | Yes | Send verification link (mock for now) |
| Accept Terms & Privacy | Checkbox | Yes | Legal compliance |

### Step 4: First Action Prompt
- **CTA**: "Post your first job" or "Browse talent"
- Optional: "What's your first project about?" (free text) — pre-fills Post Job form

---

## Freelancer (Find Work) Onboarding Flow

### Step 0: Skill Selection & Test *(required before account creation)*
- User selects **primary skill** from available tests
- User takes **skill exam** (10–15 questions, timed)
- **Pass** → Proceed to account creation; badge awarded on signup
- **Fail** → Retry or choose different skill (see [Freelancer Skill Test](#freelancer-skill-test-required-before-registration) above)

### Step 1: Account Basics *(unlocks after passing skill test)*
- Full name
- Email
- Password
- Role: **Find work**
- Primary skill + badge (pre-filled from test result)

### Step 2: Professional Profile
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Professional title / headline | Text (60 chars) | Yes | e.g. "Senior React Developer" |
| Primary category | Select | Yes | From JOB_CATEGORIES |
| Skills | Multi-select + custom | Yes (min 3) | From SKILL_OPTIONS + add own |
| Hourly rate | Text | Yes | e.g. "$50/hr" or "To be discussed" |
| Experience level | Select | Yes | Entry, Intermediate, Expert |
| Short bio | Textarea (150–500 chars) | Yes | Pitch to clients |

### Step 3: Availability & Location
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Availability | Select | No | Full-time, Part-time, As needed |
| Hours per week | Select | No | 10, 20, 30, 40+ |
| Location / timezone | Text or select | No | For client matching |
| Languages | Multi-select | No | English, Spanish, etc. |

### Step 4: Portfolio & Proof
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Portfolio link(s) | URL(s) | No | Behance, GitHub, personal site |
| LinkedIn URL | URL | No | Professional verification |
| Upload work sample | File (future) | No | Screenshot, PDF |
| Years of experience | Number | No | Credibility |

### Step 5: Verification & Agreements
| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Email verification | — | Yes | Same as client |
| Accept Terms & Privacy | Checkbox | Yes | Legal |
| Accept Freelancer Agreement | Checkbox | Yes | Platform rules |

### Step 6: First Action Prompt
- **CTA**: "Complete your profile" (if skipped) or "Browse jobs" / "Set up job alerts"

---

## Shared Enhancements

### Password Strength
- Min 8 characters (up from 6)
- Require: uppercase, lowercase, number, symbol (optional, can be "recommended")
- Real-time strength indicator (weak / fair / strong)

### Email Verification (Mock for Now)
- After sign-up: "We sent a verification link to your email"
- Show "Verify email" banner in app until "verified"
- Store `emailVerified: boolean` on user/profile

### Progress Indicator
- Step progress bar (e.g. "Step 2 of 4")
- "Save and continue later" for onboarding
- Profile completeness % on dashboard

### Validation Rules
- Trim whitespace, prevent empty submits
- Real-time validation on blur
- Clear error messages per field

---

## Data Model Additions

### Client Profile (new or extend `ClientCompanyProfile`)
```ts
interface ClientOnboarding {
  companyName: string;
  companySize?: 'startup' | 'smb' | 'enterprise' | 'agency' | 'other';
  industry?: string;
  primaryCategories: string[];
  typicalBudget?: string;
  phone?: string;
  emailVerified?: boolean;
  onboardingCompletedAt?: string;
}
```

### Freelancer Profile (extend existing `Profile`)
```ts
// Already has: title, skills, hourlyRate, bio, availability, location
// Add at sign-up:
- onboardingCompletedAt?: string;
- freelancerAgreementAccepted?: boolean;
- skillBadges: SkillTestResult[];  // From required skill test at registration
```

### Skill Test Result
```ts
interface SkillTestResult {
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  passedAt: string;
}
```

---

## UI/UX Recommendations

1. **Stepper component** — Reuse or create a step indicator (like PostJob)
2. **Back button** — Allow going back to edit previous steps
3. **Skip option** — "Skip for now" on non-critical steps, with reminder later
4. **Mobile-first** — Single column, large touch targets
5. **Auto-save** — Save progress to localStorage so refresh doesn't lose data
6. **Exit intent** — "You're almost done! Complete your profile to get better matches."

---

## Implementation Phases

### Phase 1: Multi-Step Sign-Up (Low Effort)
- Split current form into 2 steps: (1) Account basics, (2) Role-specific basics
- Client: company name + primary category
- Freelancer: title + 3 skills + hourly rate
- **Effort**: 1–2 days

### Phase 2: Full Onboarding Wizard (Medium Effort)
- 4–6 step wizard per role
- Persist to profile/company storage
- Progress bar, skip, back navigation
- **Effort**: 3–5 days

### Phase 3: Verification & Polish (Higher Effort)
- Email verification flow (mock or real)
- Password strength meter
- Profile completeness widget
- **Effort**: 2–3 days

### Phase 4: Freelancer Skill Test (Required at Sign-Up)
- Skill selection UI (dropdown or cards)
- Skill test engine (questions, timer, scoring)
- Pass/fail logic + retry/cooldown
- Badge storage and display on profile/cards
- **Effort**: 4–6 days (depends on number of skill tests)

---

## Summary Table

| Feature | Client | Freelancer | Priority |
|---------|--------|------------|----------|
| Multi-step sign-up | ✓ | ✓ | High |
| **Skill test (required before signup)** | — | ✓ | High |
| **Skill badge on profile** | — | ✓ | High |
| Company/org name | ✓ | — | High |
| Primary category | ✓ | ✓ | High |
| Skills (min 3) | — | ✓ | High |
| Hourly rate | — | ✓ | High |
| Professional title | — | ✓ | High |
| Bio / intro | — | ✓ | High |
| Availability | — | ✓ | Medium |
| Portfolio links | — | ✓ | Medium |
| Company size / industry | ✓ | — | Medium |
| Email verification | ✓ | ✓ | Medium |
| Password strength | ✓ | ✓ | Low |
| Phone (future) | ✓ | ✓ | Future |

---

## Next Steps

1. **Review** this proposal and prioritize features
2. **Choose** Phase 1 scope for initial implementation
3. **Design** step-by-step wireframes if needed
4. **Implement** in order: SignUp refactor → Client onboarding → Freelancer onboarding
5. **Phase 4**: Build skill test engine + required test flow for freelancer sign-up
