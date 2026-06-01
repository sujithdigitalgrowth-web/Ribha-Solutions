import { Link } from 'react-router-dom';
import { BRAND } from '@/config/brand';
import { JOB_CATEGORIES } from '@/config/categories';
import { useSeo } from '@/hooks/useSeo';

const STATS = [
  { value: '18,000+', label: 'Verified freelancers' },
  { value: '92,000+', label: 'Projects completed' },
  { value: '97%', label: 'Client satisfaction' },
  { value: '₹45Cr+', label: 'Paid to talent' },
];

const CATEGORY_COUNTS: Record<string, string> = {
  ai: '2.4K', development: '18K', design: '9.2K', marketing: '5.8K',
  writing: '4.1K', admin: '3.2K', finance: '1.9K', legal: '1.2K',
};

const TESTIMONIALS = [
  {
    quote: "Ribha Solutions transformed how we scale our engineering team. We've hired 15 developers in 6 months with zero compromise on quality.",
    author: 'Maria L.',
    role: 'CTO, TechScale',
    initials: 'ML',
  },
  {
    quote: "I went from side projects to full-time freelance in 90 days. The platform's milestone system gave clients the confidence to hire me.",
    author: 'James K.',
    role: 'Full Stack Developer',
    initials: 'JK',
  },
  {
    quote: "As a design agency, we use Ribha Solutions for overflow work. The talent pool is vetted, responsive, and the contract management is seamless.",
    author: 'Priya S.',
    role: 'Founder, Design Studio',
    initials: 'PS',
  },
];

const ENTERPRISE_FEATURES = [
  {
    title: 'Secure payments',
    desc: 'Milestone-based escrow payments for fixed-price projects. Funds are released only when you approve the work.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Verified talent',
    desc: 'Every freelancer goes through identity verification and skill assessments before appearing in search results.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: '24/7 support',
    desc: 'Dedicated support team available around the clock for clients and freelancers alike — disputes, payments, and more.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Global reach',
    desc: 'Connect with skilled talent across 180+ countries and time zones. Build distributed teams without borders.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];


function HeroPlatformPreview() {
  return (
    <div className="relative h-[460px]">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          backgroundImage: 'radial-gradient(#c7d2fe 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Gradient blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100/70 via-violet-50/50 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-50/80 to-transparent rounded-full blur-2xl" />

      {/* Freelancer card — top right */}
      <div className="absolute top-4 right-2 w-[17rem] bg-white rounded-2xl p-5 z-10 animate-fade-right delay-200"
        style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            PS
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm leading-tight">Priya Sharma</p>
            <p className="text-xs text-slate-400 truncate">Full Stack Developer · Mumbai</p>
          </div>
          <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        </div>
        <div className="flex items-center gap-0.5 mb-3">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs font-bold text-slate-700 ml-1">4.9</span>
          <span className="text-xs text-slate-400 ml-0.5">(124 reviews)</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {['React', 'Node.js', 'TypeScript', 'AWS'].map((s) => (
            <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">{s}</span>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className="font-bold text-slate-900 text-sm">₹3,500<span className="text-slate-400 font-normal text-xs">/hr</span></span>
          <button type="button" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
            View Profile
          </button>
        </div>
      </div>

      {/* Payment pill — mid left */}
      <div className="absolute top-44 left-4 bg-white rounded-xl p-3 flex items-center gap-2.5 z-20 animate-fade-up delay-300"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium leading-none mb-0.5">Milestone approved</p>
          <p className="text-sm font-bold text-slate-900">₹42,000 released</p>
        </div>
      </div>

      {/* Job card — bottom */}
      <div className="absolute bottom-6 left-8 right-8 bg-white rounded-2xl p-4 z-20 animate-fade-up delay-400"
        style={{ boxShadow: '0 8px 28px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="text-xs text-slate-400 font-medium">New project · 8 min ago</span>
            </div>
            <p className="font-semibold text-slate-900 text-sm leading-snug">E-commerce Platform Redesign</p>
            <p className="text-xs text-slate-400 mt-0.5">Fixed price · UI/UX Design</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-indigo-600 text-sm">₹85,000</p>
            <p className="text-xs text-slate-400 mt-0.5">14 proposals</p>
          </div>
        </div>
      </div>

      {/* Active jobs badge — top left */}
      <div className="absolute top-6 left-6 bg-indigo-600 text-white rounded-xl px-3 py-2 z-20 animate-fade-up delay-100"
        style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
        <p className="text-xs font-semibold leading-none mb-0.5">Active now</p>
        <p className="text-sm font-bold">63 open projects</p>
      </div>
    </div>
  );
}

export function Home() {
  useSeo({
    title: 'Ribha Solutions - Hire Skilled Freelancers | Freelance Marketplace India',
    description: 'Hire verified freelancers for web development, design, marketing, writing, AI, and more. Post jobs free. Secure milestone payments. 18,000+ skilled freelancers on India\'s trusted freelance marketplace.',
    path: '/',
  });
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                18,000+ verified freelancers across India
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-5">
                Find skilled freelancers
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  for any project
                </span>
              </h1>
              <p className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed">
                Post your project free. Get proposals from verified Indian freelancers within hours. Milestone payments mean you only pay for work you approve.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  to="/post-job"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                  style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.30)' }}
                >
                  Post a project free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  to="/find-work"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Find work
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 items-center mb-5">
                <span className="text-xs text-slate-400 font-medium">Popular:</span>
                {['Web Development', 'UI/UX Design', 'React', 'Data Analysis', 'Content Writing'].map((tag) => (
                  <Link
                    key={tag}
                    to="/find-talent"
                    className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors bg-white"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                No registration fee · Cancel anytime · 97% client satisfaction
              </p>
            </div>

            {/* Right preview */}
            <div className="hidden lg:block">
              <HeroPlatformPreview />
            </div>
          </div>
        </div>

      </section>

      {/* ── Stats ── */}
      <section className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-slate-100">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 mb-1">{stat.value}</p>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-10 lg:py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Talent for every type of work
              </h2>
              <p className="text-slate-500 max-w-xl">
                From one-off tasks to ongoing projects, find skilled professionals across 12+ categories.
              </p>
            </div>
            <Link
              to="/find-talent"
              className="shrink-0 inline-flex items-center gap-1.5 text-sm text-indigo-600 font-semibold hover:underline"
            >
              Browse all categories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {JOB_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className="group p-5 lg:p-6 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all duration-200 hover:shadow-sm"
              >
                <span className="text-3xl mb-3 block">{cat.icon}</span>
                <span className="font-semibold text-slate-800 group-hover:text-indigo-700 block text-sm mb-0.5">
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400">{CATEGORY_COUNTS[cat.id] || '—'} professionals</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              How {BRAND.name} works
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Get started in minutes. No long-term contracts. Pay only for work delivered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* For clients */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">For Clients</span>
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Post a job', desc: 'Describe your project, set your budget, and define milestones.' },
                  { step: '2', title: 'Review proposals', desc: 'Compare freelancers, portfolios, and rates. Interview top candidates.' },
                  { step: '3', title: 'Hire & collaborate', desc: 'Add funds, work together, and release payment when satisfied.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {item.step}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/find-talent" className="inline-flex items-center gap-1.5 mt-8 text-indigo-600 font-semibold text-sm hover:underline">
                Start hiring →
              </Link>
            </div>

            {/* For freelancers */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-full uppercase tracking-wider">For Freelancers</span>
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Create your profile', desc: 'Showcase your skills, portfolio, and availability.' },
                  { step: '2', title: 'Find projects', desc: 'Browse jobs that match your expertise. Save searches and set alerts.' },
                  { step: '3', title: 'Get paid securely', desc: 'Work on milestones, track time, and receive payments on schedule.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {item.step}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/find-work" className="inline-flex items-center gap-1.5 mt-8 text-slate-700 font-semibold text-sm hover:underline">
                Find work →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Enterprise Features ── */}
      <section className="py-20 lg:py-28 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Built for serious work
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Enterprise-grade security, compliance, and support for teams of all sizes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ENTERPRISE_FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Trusted by thousands
              </h2>
              <p className="text-slate-500">
                See what clients and freelancers say about {BRAND.name}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/success-stories" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                Success stories
              </Link>
              <Link to="/leaderboard" className="text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg transition-colors">
                Top freelancers
              </Link>
              <Link to="/budget-calculator" className="text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg transition-colors">
                Budget calculator
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.author}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto">
            Join 18,000+ freelancers and businesses already using Ribha Solutions. No setup fees. No long-term contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Create free account
            </Link>
            <Link
              to="/find-talent"
              className="inline-flex items-center justify-center px-7 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Browse talent
            </Link>
          </div>
          <p className="text-slate-600 text-xs mt-5">No credit card required · Free to sign up</p>
        </div>
      </section>

    </div>
  );
}
