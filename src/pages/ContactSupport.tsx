import { useState } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createSupportTicket } from '@/utils/supportTicketsStorage';

const CATEGORIES = ['Account', 'Billing', 'Technical', 'Dispute', 'Other'];

const CONTACT_CHANNELS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email us',
    value: 'support@ribhasolutions.com',
    note: 'Replies within 24 hours',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Call us',
    value: '+91 80 4567 8900',
    note: 'Mon–Fri, 9 AM – 7 PM IST',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Visit us',
    value: 'Koramangala, Bangalore',
    note: 'Karnataka 560034',
  },
];

const QUICK_LINKS = [
  { label: 'Help Center', to: '/help', desc: 'Browse articles and guides' },
  { label: 'FAQs', to: '/faq', desc: 'Answers to common questions' },
  { label: 'How it Works', to: '/how-it-works', desc: 'Platform overview' },
  { label: 'Pricing', to: '/pricing', desc: 'Fee structure explained' },
];

export function ContactSupport() {
  useSeo({
    title: 'Contact Support | Ribha Solutions',
    description: 'Need help? Contact the Ribha Solutions support team for assistance with your account, billing, disputes, or technical issues. We\'re available 24/7.',
    path: '/contact-support',
  });
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Other');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      if (!subject.trim() || !message.trim()) return;
      createSupportTicket({ userId: user.id, subject: subject.trim(), message: message.trim(), category });
    }
    setSubmitted(true);
    setSubject('');
    setMessage('');
    setName('');
    setEmail('');
  };

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Contact Support</h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Our support team is here to help. Send a ticket and we'll respond within 24 hours on business days.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-bold text-slate-900 text-lg mb-1">Ticket received</h2>
                <p className="text-slate-500 text-sm mb-1">
                  {user ? `We'll respond to ${user.email} within 24 hours.` : 'We\'ll reach out to the email you provided within 24 hours.'}
                </p>
                <p className="text-slate-400 text-xs mb-6">Check your inbox — and your spam folder just in case.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-indigo-600 font-semibold hover:underline text-sm"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!user && (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Your name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Priya Sharma"
                          required
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                  {user && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue in detail. Include any relevant order numbers, usernames, or error messages."
                      required
                      rows={6}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    Send Message
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    We aim to respond within 24 hours on business days (Mon–Fri).
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Contact channels */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Other ways to reach us</h3>
              <div className="space-y-3">
                {CONTACT_CHANNELS.map((ch) => (
                  <div key={ch.label} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
                      {ch.icon}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">{ch.label}</p>
                      <p className="text-sm font-semibold text-slate-900">{ch.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{ch.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Self-service</h3>
              <div className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{link.label}</p>
                      <p className="text-xs text-slate-400">{link.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* SLA note */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-xs font-semibold text-indigo-700 mb-1">Response times</p>
              <div className="space-y-1 text-xs text-indigo-600">
                <p>· General enquiries: within 24 hours</p>
                <p>· Billing issues: within 12 hours</p>
                <p>· Active disputes: within 4 hours</p>
                <p>· Platform outages: real-time updates</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
