import { useState } from 'react';
import { useSeo } from '@/hooks/useSeo';

const FAQ_ITEMS = [
  {
    q: 'How do I post a job?',
    a: 'Sign up as a client, then click "Post a Job" in the navigation. Complete the multi-step form with your project details, budget, skills required, and timeline. Once submitted, your job will be visible to freelancers.',
  },
  {
    q: 'How do I apply for a job?',
    a: 'Browse jobs on the Find Work page, click "Apply Now" on any job that matches your skills. You will need to submit a cover letter, proposed rate, timeline, and sign the NDA agreement before your application is sent.',
  },
  {
    q: 'What is the NDA and why do I need to sign it?',
    a: 'The Non-Disclosure Agreement protects confidential project information. When applying for jobs, you must read the disclosure text, draw your signature, provide your address, and accept the terms. This ensures both parties are legally protected.',
  },
  {
    q: 'How does the hiring process work?',
    a: 'Clients post jobs and receive proposals from freelancers. They can review proposals, view freelancer profiles, and invite specific freelancers. When ready, the client clicks "Hire" on a proposal to start the contract.',
  },
  {
    q: 'Can I save jobs to apply later?',
    a: 'Yes! On the Find Work page, click the bookmark icon on any job to save it. View all saved jobs in the "Saved Jobs" section from your dashboard or navigation.',
  },
  {
    q: 'How do I message a freelancer or client?',
    a: 'Go to the Messages page from the navigation. You can start conversations from job proposals or freelancer profiles. All messages are stored and you can continue conversations at any time.',
  },
  {
    q: 'What are job templates?',
    a: 'Job templates let you save a job post as a template and reuse it for similar projects. When posting a new job, you can start from a template to save time.',
  },
  {
    q: 'How do reviews work?',
    a: 'After a project is completed, both clients and freelancers can leave reviews and ratings. These help build trust and appear on profiles for future opportunities.',
  },
];

export function FAQ() {
  useSeo({
    title: 'Frequently Asked Questions | Ribha Solutions',
    description: 'Got questions about Ribha Solutions? Find answers on how to post jobs, apply for work, make payments, sign NDAs, use milestone payments, and more.',
    path: '/faq',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-slate-600 mb-12">Find answers to common questions about Ribha Solutions</p>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50"
              >
                <span className="font-semibold text-slate-900">{item.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-slate-600">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
