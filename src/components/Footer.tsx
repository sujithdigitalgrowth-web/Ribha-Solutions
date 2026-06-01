import { Link } from 'react-router-dom';
import { BRAND } from '@/config/brand';

const FOOTER_LINKS = [
  {
    heading: 'For Clients',
    links: [
      { to: '/find-talent', label: 'Browse Talent' },
      { to: '/post-job', label: 'Post a Job' },
      { to: '/how-it-works', label: 'How it Works' },
      { to: '/pricing', label: 'Plans & Fees' },
      { to: '/budget-calculator', label: 'Budget Calculator' },
    ],
  },
  {
    heading: 'For Freelancers',
    links: [
      { to: '/find-work', label: 'Browse Projects' },
      { to: '/signup', label: 'Build Your Profile' },
      { to: '/leaderboard', label: 'Leaderboard' },
      { to: '/how-it-works', label: 'Earn on Projects' },
      { to: '/blog', label: 'Tips & Guides' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { to: '/help', label: 'Help Center' },
      { to: '/success-stories', label: 'Success Stories' },
      { to: '/blog', label: 'Blog' },
      { to: '/faq', label: 'FAQs' },
      { to: '/contact-support', label: 'Contact Support' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/terms', label: 'Terms of Service' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/api-docs', label: 'API Docs' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">

        {/* Top row: brand + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <span className="text-white font-bold text-base">{BRAND.name}</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Connect with skilled freelancers and build great things together.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/contact-support" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
