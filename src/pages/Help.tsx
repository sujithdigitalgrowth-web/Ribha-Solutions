import { useState } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { Link } from 'react-router-dom';

const ARTICLES: Array<{
  id: string;
  topic: string;
  title: string;
  content: string;
}> = [
  {
    id: 'getting-started',
    topic: 'Getting Started',
    title: 'How do I create an account?',
    content: 'Click Sign Up in the top right corner. Choose whether you want to hire (client) or find work (freelancer). Enter your name, email, and password. You can switch your role later from your profile settings.',
  },
  {
    id: 'post-job',
    topic: 'For Clients',
    title: 'How do I post a job?',
    content: 'Log in as a client, go to Post a Job, and fill in the job title, description, budget, skills required, and project type (fixed or hourly). You can use job templates to save time. Once posted, freelancers can submit proposals.',
  },
  {
    id: 'apply-job',
    topic: 'For Freelancers',
    title: 'How do I apply for a job?',
    content: 'Browse Find Work to see open jobs. Click Apply Now on any job that matches your skills. Write a cover letter, propose your rate and timeline, and submit. If the job requires an NDA, you will need to sign it before applying.',
  },
  {
    id: 'hire',
    topic: 'For Clients',
    title: 'How do I hire a freelancer?',
    content: 'Go to My Jobs and open the job with proposals. Review each proposal, message freelancers if needed, then click Hire on the proposal you choose. The freelancer will be notified and the contract will start.',
  },
  {
    id: 'milestones',
    topic: 'Projects',
    title: 'What are milestones?',
    content: 'Milestones break a project into phases. Each milestone has a title, description, amount, and due date. The client can mark milestones complete and release payment when satisfied. This protects both parties.',
  },
  {
    id: 'disputes',
    topic: 'Support',
    title: 'How do I report a dispute?',
    content: 'From your active contract or job detail page, click Report Dispute. Describe the issue and submit. Our team will review and may add notes. Status flows from Open → In Review → Resolved. We encourage direct communication first.',
  },
  {
    id: 'payments',
    topic: 'Billing',
    title: 'How do payments work?',
    content: 'For fixed-price projects, add funds for milestones. When a milestone is completed, the client releases payment. For hourly work, you agree on terms and invoice at the end. Ribha Solutions may charge a service fee as shown in Pricing.',
  },
  {
    id: 'profile',
    topic: 'For Freelancers',
    title: 'How do I improve my profile?',
    content: 'Go to Edit Profile and add a professional title, bio, hourly rate, skills, availability, and portfolio URL. Complete your profile to increase visibility. Verification badges (email, phone, ID) build trust with clients.',
  },
];

const TOPICS = ['All', ...Array.from(new Set(ARTICLES.map((a) => a.topic)))];

export function Help() {
  useSeo({
    title: 'Help Center | Ribha Solutions',
    description: 'Browse the Ribha Solutions Help Center for guides on getting started, posting jobs, applying for work, managing contracts, payments, and more.',
    path: '/help',
  });
  const [topic, setTopic] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ARTICLES.filter((a) => {
    const matchTopic = topic === 'All' || a.topic === topic;
    const matchSearch = !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.topic.toLowerCase().includes(search.toLowerCase());
    return matchTopic && matchSearch;
  });

  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Find answers and get assistance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 mb-12">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{a.topic}</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform ${expandedId === a.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedId === a.id && (
                <div className="px-6 pb-4 text-slate-600 dark:text-slate-300 text-sm">
                  {a.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">No articles match your search.</p>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <p className="text-slate-600 dark:text-slate-400 mb-2">Still need help?</p>
          <Link
            to="/contact-support"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
