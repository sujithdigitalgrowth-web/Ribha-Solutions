import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

const CLIENT_STEPS = [
  {
    step: 1,
    title: 'Post a job',
    desc: 'Create a job post with your requirements — budget, skills, timeline. Posting is always free. You can write your own or use a saved template.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Get proposals',
    desc: 'Receive proposals from qualified freelancers within hours. Review profiles, portfolios, and rates before you commit to anyone.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Hire with confidence',
    desc: 'Message candidates, invite specific freelancers, or book a consultation. Hire when you\'re ready — no pressure.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: 'Pay when work is done',
    desc: 'Release payments by milestone or on completion. Funds are held in escrow until you approve the work. You\'re always protected.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const FREELANCER_STEPS = [
  {
    step: 1,
    title: 'Build your profile',
    desc: 'Showcase your skills, portfolio, hourly rate, and availability. A complete profile gets 3× more views than an incomplete one.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Find the right projects',
    desc: 'Browse open jobs, save searches, and set alerts for roles that match your skills. Get recommended jobs based on your profile.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Submit a proposal',
    desc: 'Write a targeted cover letter, propose your rate, and outline your approach. Use templates to save time on repeat applications.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: 'Get paid on time',
    desc: 'Work on milestones, track time on hourly contracts, and receive payments securely. No chasing invoices.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const PROTECTIONS = [
  {
    title: 'Escrow protection',
    desc: 'Client funds are held securely before work begins. Payment is released only when you approve — never before.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Dispute resolution',
    desc: 'If something goes wrong, our support team steps in to mediate and help reach a fair resolution for both sides.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    title: 'Verified identities',
    desc: 'Freelancers go through email, phone, and ID verification. Skill badges confirm expertise before you hire.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
  },
  {
    title: 'NDA & contracts',
    desc: 'Every engagement includes a signed NDA and contract. Your project details stay confidential from day one.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Milestone tracking',
    desc: 'Break projects into milestones with clear deliverables. Both sides agree on scope before any work begins.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Time tracking',
    desc: 'For hourly contracts, freelancers log time and clients review work diaries. Billing is always transparent.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: 'Is it free to post a job?',
    a: 'Yes. Posting a job is always free. There are no subscription fees for clients. You only pay when you hire and release a payment.',
  },
  {
    q: 'How does the service fee work?',
    a: 'A small service fee is deducted from the freelancer\'s payout when a payment is released. There is no fee charged to the client on top of the agreed project amount.',
  },
  {
    q: 'Can I hire someone without posting a job?',
    a: 'Yes. Browse freelancer profiles directly, view their portfolio and rates, and send an invite or message. You can hire without a public job post.',
  },
  {
    q: 'What if I\'m not happy with the work?',
    a: 'Do not release the milestone payment. Contact the freelancer to discuss revisions. If you cannot reach an agreement, raise a dispute and our team will assist with mediation.',
  },
  {
    q: 'How long does it take to find a freelancer?',
    a: 'Most job posts receive their first proposal within a few hours. For common skills like web development and design, you can typically hire within 24–48 hours.',
  },
];

export function HowItWorks() {
  useSeo({
    title: 'How It Works - Post Jobs & Hire Freelancers | Ribha Solutions',
    description: 'Learn how Ribha Solutions works for clients and freelancers. Post a job, receive proposals, review profiles, hire with confidence using milestone-based escrow payments.',
    path: '/how-it-works',
  });
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            How it works
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Whether you're hiring or looking for work, we make it simple to connect, collaborate, and get paid.
          </p>
        </div>
      </section>

      {/* ── For Clients ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              For Clients
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Hire the right talent, fast</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CLIENT_STEPS.map((item, idx) => (
              <div key={item.step} className="relative bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                <div className="p-6">
                  {/* Step badge + icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
                {/* Connector arrow (not on last card) */}
                {idx < CLIENT_STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center">
                    <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/find-talent"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Start hiring
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── For Freelancers ── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <span className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              For Freelancers
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Find work you actually want</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FREELANCER_STEPS.map((item, idx) => (
              <div key={item.step} className="relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-800" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
                {idx < FREELANCER_STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/find-work"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Find work
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Protections ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Built-in protections for everyone
            </h2>
            <p className="text-slate-500 max-w-xl">
              Every engagement on the platform comes with layers of protection — for clients and freelancers alike.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROTECTIONS.map((p) => (
              <div key={p.title} className="flex gap-4 p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{p.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-10">Common questions</h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-500">
            More questions?{' '}
            <Link to="/faq" className="text-indigo-600 font-medium hover:underline">Visit our full FAQ</Link>
            {' '}or{' '}
            <Link to="/contact-support" className="text-indigo-600 font-medium hover:underline">contact support</Link>.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-indigo-200 mb-8">
            Join 800,000+ clients and freelancers. It takes less than 2 minutes to create an account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="px-7 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm">
              Create free account
            </Link>
            <Link to="/pricing" className="px-7 py-3 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-lg transition-colors text-sm">
              View pricing
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
