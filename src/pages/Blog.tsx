import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

const POSTS = [
  {
    id: '1',
    title: '5 Tips for Writing Proposals That Get Hired',
    excerpt: 'Learn how to stand out in a crowded marketplace. A great proposal is clear, specific, and shows you understand the client\'s needs.',
    date: 'Feb 15, 2025',
    author: 'Ribha Solutions Team',
    category: 'Freelancing',
  },
  {
    id: '2',
    title: 'How to Set Fair Rates as a Freelancer',
    excerpt: 'Pricing your services can feel daunting. We break down hourly vs fixed pricing, market rates, and when to negotiate.',
    date: 'Feb 10, 2025',
    author: 'Ribha Solutions Team',
    category: 'Freelancing',
  },
  {
    id: '3',
    title: 'Building Trust with Milestones',
    excerpt: 'Milestones protect both clients and freelancers. Here\'s how to structure projects for smooth delivery and timely payments.',
    date: 'Feb 5, 2025',
    author: 'Ribha Solutions Team',
    category: 'For Clients',
  },
  {
    id: '4',
    title: 'Success Story: From Side Hustle to Full-Time Freelancer',
    excerpt: 'Meet Priya, a UI/UX designer who went from occasional gigs to a thriving freelance business in 18 months.',
    date: 'Jan 28, 2025',
    author: 'Ribha Solutions Team',
    category: 'Success Stories',
  },
  {
    id: '5',
    title: 'What Clients Look for in a Freelancer Profile',
    excerpt: 'Your profile is your storefront. We analyzed hundreds of hires to find what makes profiles stand out.',
    date: 'Jan 20, 2025',
    author: 'Ribha Solutions Team',
    category: 'Freelancing',
  },
  {
    id: '6',
    title: 'Remote Work Best Practices for Distributed Teams',
    excerpt: 'Communication, tools, and boundaries. How to work effectively with clients across time zones.',
    date: 'Jan 12, 2025',
    author: 'Ribha Solutions Team',
    category: 'Tips',
  },
];

export function Blog() {
  useSeo({
    title: 'Blog - Freelancing Tips, Hiring Guides & Industry Insights | Ribha Solutions',
    description: 'Read expert tips on freelancing, remote work, hiring developers and designers, writing winning proposals, and growing your business on Ribha Solutions.',
    path: '/blog',
  });
  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Blog</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-12">
          Tips, insights, and updates from the Ribha Solutions team.
        </p>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
            >
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{post.category}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">{post.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.author}</span>
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
