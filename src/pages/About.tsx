import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

const TEAM = [
  {
    name: 'Arjun Nair',
    role: 'Co-Founder & CEO',
    bio: 'Previously led engineering at a Series B SaaS company. Started Ribha after spending years struggling to find reliable freelance talent for fast-moving product teams.',
    initials: 'AN',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    name: 'Sneha Krishnamurthy',
    role: 'Co-Founder & CTO',
    bio: '10 years building marketplace platforms. Passionate about using technology to give independent professionals a fairer, more transparent way to work.',
    initials: 'SK',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    name: 'Rohit Mehta',
    role: 'Head of Operations',
    bio: 'Runs day-to-day operations and the support team. Focused on keeping response times fast and every client and freelancer experience smooth.',
    initials: 'RM',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Divya Sharma',
    role: 'Head of Growth',
    bio: 'Former growth lead at two funded startups. Brings deep expertise in building communities around marketplace products.',
    initials: 'DS',
    color: 'bg-amber-100 text-amber-700',
  },
];

const VALUES = [
  {
    title: 'Quality over volume',
    desc: 'We would rather have fewer, excellent freelancers than a bloated directory. Every profile is verified before it appears in search.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Transparent fees',
    desc: 'No hidden charges. No surprise invoices. Our fee structure is published openly and decreases as you build longer client relationships.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    title: 'Fair for both sides',
    desc: 'We built protections for clients and freelancers equally. Escrow, dispute resolution, and NDA templates exist to protect everyone at the table.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    title: 'Local-first',
    desc: 'Built for the Indian market — INR payments, India-based support, and a freelancer pool that understands the context of working with Indian businesses.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const MILESTONES = [
  { year: '2020', event: 'Founded in Bangalore with a small beta of 200 freelancers and 30 client companies.' },
  { year: '2021', event: 'Launched skill verification and escrow payments. Reached ₹1Cr in total payments processed.' },
  { year: '2022', event: 'Expanded to 8 cities. Passed 5,000 active freelancers and 10,000 completed projects.' },
  { year: '2023', event: 'Introduced milestone tracking, NDA templates, and the dispute resolution system.' },
  { year: '2024', event: 'Crossed ₹45Cr in total payments. Reached 18,000+ verified freelancers on the platform.' },
];

export function About() {
  useSeo({
    title: 'About Ribha Solutions - India\'s Trusted Freelance Marketplace',
    description: 'Learn about Ribha Solutions — built to connect businesses with India\'s best freelance talent. Our story, mission, and the team behind the platform.',
    path: '/about',
  });
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">About Us</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-3 mb-5 leading-tight">
              We built the platform<br />we wished existed
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              Ribha Solutions started in 2020 when two engineers in Bangalore kept running into the same problem — finding reliable freelance talent was inconsistent, opaque, and slow. Payment was worse. We decided to fix it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '18,000+', label: 'Verified freelancers' },
              { value: '92,000+', label: 'Projects completed' },
              { value: '₹45Cr+', label: 'Paid to freelancers' },
              { value: '4 years', label: 'In operation' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-indigo-600 mb-1">{s.value}</p>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Our story</h2>
              <div className="space-y-4 text-slate-500 text-sm leading-relaxed">
                <p>
                  Arjun and Sneha met while working at a fast-growing SaaS company in Bangalore. Their product team regularly needed specialist help — a React developer for a sprint, a designer for a launch, a technical writer for docs. Every hire through existing platforms felt like a gamble. Quality was inconsistent, payment protection was weak, and disputes had no real resolution process.
                </p>
                <p>
                  They launched Ribha Solutions in late 2020 with a simple belief: both sides of the marketplace deserve more respect. Clients deserve to know exactly who they're hiring before they pay. Freelancers deserve fair, on-time payment without having to chase invoices.
                </p>
                <p>
                  Four years later, Ribha Solutions has processed over ₹45 crore in payments, has 18,000+ verified freelancers, and runs a dispute resolution team that responds in under 24 hours. We're still a small company. We plan to stay focused.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-5">Timeline</h2>
              <div className="space-y-5">
                {MILESTONES.map((m, i) => (
                  <div key={m.year} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      {i < MILESTONES.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-5">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{m.year}</span>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-10">What we believe</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-xl border border-slate-200 p-6 flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{v.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">The team</h2>
            <p className="text-slate-500">A small team. Everyone ships.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mb-4 ${member.color}`}>
                  {member.initials}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{member.name}</h3>
                <p className="text-indigo-600 text-xs font-medium mb-2">{member.role}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Office ── */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-semibold text-slate-900 mb-1">Where we work</h2>
              <p className="text-slate-500 text-sm">Koramangala, Bangalore, Karnataka 560034</p>
              <p className="text-slate-400 text-sm mt-0.5">hello@ribhasolutions.com · +91 80 4567 8900</p>
            </div>
            <div className="flex gap-3">
              <Link to="/contact-support" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors">
                Get in touch
              </Link>
              <Link to="/find-talent" className="px-5 py-2.5 border border-slate-200 hover:bg-white text-slate-700 font-semibold rounded-lg text-sm transition-colors">
                Explore the platform
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
