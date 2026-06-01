import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

const CLIENT_FEATURES = [
  'Post unlimited jobs for free',
  'Browse verified freelancer profiles',
  'Invite freelancers to your jobs',
  'Escrow-protected milestone payments',
  'NDA & contract management',
  'Dispute resolution support',
  'Real-time messaging',
  'Talent shortlisting & comparison',
];

const FREELANCER_TIERS = [
  {
    label: 'New',
    threshold: 'First ₹50,000 earned',
    fee: '10%',
    desc: 'Applies to your first ₹50,000 in lifetime earnings with each client.',
    highlight: false,
  },
  {
    label: 'Regular',
    threshold: '₹50,000 – ₹5,00,000',
    fee: '7%',
    desc: 'Your fee reduces once you reach ₹50,000 in total earnings with a client.',
    highlight: true,
  },
  {
    label: 'Top Earner',
    threshold: 'Over ₹5,00,000',
    fee: '5%',
    desc: 'Long-term client relationships are rewarded. Keep more of what you earn.',
    highlight: false,
  },
];

const FAQS = [
  {
    q: 'Who pays the service fee — the client or the freelancer?',
    a: 'The service fee is deducted from the freelancer\'s payout. Clients pay only the agreed project amount. There are no hidden fees on the client side.',
  },
  {
    q: 'When is the service fee charged?',
    a: 'The fee is applied when a client releases a milestone payment or approves a payment. It is automatically deducted before the funds reach the freelancer\'s wallet.',
  },
  {
    q: 'How do I qualify for a lower fee tier?',
    a: 'Your fee tier is calculated per client relationship. Once your lifetime earnings with a specific client cross the threshold, your rate drops automatically for future payments from that client.',
  },
  {
    q: 'Are there any fees for posting jobs or applying?',
    a: 'No. Clients post jobs for free. Freelancers apply and submit proposals for free. Fees only apply when a payment is released.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Payments are processed via the platform wallet. Clients can fund projects using UPI, net banking, or card. Freelancers withdraw earnings to their bank account.',
  },
];

export function Pricing() {
  useSeo({
    title: 'Pricing - Free to Post Jobs & Hire Freelancers | Ribha Solutions',
    description: 'Post jobs for free and hire freelancers with zero upfront cost. Ribha Solutions charges a small platform fee only when you pay a freelancer. Transparent, no hidden fees.',
    path: '/pricing',
  });
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Free for clients. A small service fee for freelancers that decreases as you build long-term relationships.
          </p>
        </div>
      </section>

      {/* ── Client pricing ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">For Clients</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-4">
                Hire top talent — for free
              </h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Posting jobs, browsing profiles, and managing contracts costs nothing. You only pay the agreed amount to your freelancer.
              </p>
              <div className="inline-flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-indigo-600">₹0</span>
                <span className="text-slate-500 font-medium">platform fee for clients</span>
              </div>
              <Link
                to="/signup"
                className="block sm:inline-block text-center px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Post a job free
              </Link>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-7">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">What's included</p>
              <ul className="space-y-3">
                {CLIENT_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Freelancer pricing ── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase">For Freelancers</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-3">
              Your fee decreases as you grow
            </h2>
            <p className="text-slate-500 max-w-xl">
              We reward long-term client relationships. The more you earn with a client, the less you pay.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FREELANCER_TIERS.map((tier) => (
              <div
                key={tier.label}
                className={`rounded-xl border p-7 relative ${
                  tier.highlight
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-400 text-slate-900 text-xs font-bold rounded-full whitespace-nowrap">
                    Most common
                  </span>
                )}
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tier.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {tier.label}
                </p>
                <p className={`text-sm font-medium mb-4 ${tier.highlight ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {tier.threshold}
                </p>
                <div className={`text-5xl font-black mb-4 ${tier.highlight ? 'text-white' : 'text-indigo-600'}`}>
                  {tier.fee}
                </div>
                <p className={`text-sm leading-relaxed ${tier.highlight ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Thresholds are per client relationship, not total lifetime earnings. Fees are calculated on the payment amount before the fee is applied.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-10">Pricing FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            No subscription. No setup fee. No surprises.
          </h2>
          <p className="text-slate-400 mb-8">
            Create your free account in under 2 minutes and start hiring or finding work today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-sm">
              Get started free
            </Link>
            <Link to="/how-it-works" className="px-7 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-lg transition-colors text-sm">
              How it works
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
