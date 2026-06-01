import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

const STORIES = [
  {
    id: '1',
    title: 'From Idea to Launch in 6 Weeks',
    quote: 'Ribha Solutions connected us with a brilliant full-stack developer. We went from concept to live product in record time.',
    author: 'Sarah M.',
    role: 'Startup Founder',
    outcome: 'E-commerce platform launched',
    metrics: '40% faster than expected',
  },
  {
    id: '2',
    title: 'Scaling Our Design Team',
    quote: 'We needed top-tier UI/UX talent without the overhead of full-time hires. Ribha Solutions delivered three amazing designers.',
    author: 'James K.',
    role: 'Product Lead',
    outcome: '3 designers hired',
    metrics: 'Design cycle cut by 50%',
  },
  {
    id: '3',
    title: 'My First ₹10L Month as a Freelancer',
    quote: 'I landed four projects in my first month. The milestone system and reviews gave clients confidence to hire me.',
    author: 'Priya S.',
    role: 'UI/UX Designer',
    outcome: '4 projects completed',
    metrics: '100% 5-star reviews',
  },
];

export function SuccessStories() {
  useSeo({
    title: 'Success Stories - Clients & Freelancers Thriving on Ribha Solutions',
    description: 'Real stories from clients who hired top talent and freelancers who built their careers on Ribha Solutions. Discover what\'s possible on India\'s leading freelance marketplace.',
    path: '/success-stories',
  });
  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Success Stories</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-12">
          Real projects, real results. See how clients and freelancers are building great things together.
        </p>

        <div className="space-y-12">
          {STORIES.map((s) => (
            <article key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{s.title}</h2>
              <blockquote className="text-slate-600 dark:text-slate-300 text-lg mb-6 italic">
                "{s.quote}"
              </blockquote>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">— {s.author}, {s.role}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{s.outcome}</span>
                <span className="text-green-600 dark:text-green-400">{s.metrics}</span>
              </div>
            </article>
          ))}
        </div>

        <Link to="/" className="inline-block mt-12 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Back to home →
        </Link>
      </div>
    </div>
  );
}
