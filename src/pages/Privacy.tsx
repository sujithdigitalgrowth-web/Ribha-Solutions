import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

export function Privacy() {
  useSeo({
    title: 'Privacy Policy | Ribha Solutions',
    description: 'Learn how Ribha Solutions collects, uses, and protects your personal data. We are committed to your privacy and data security.',
    path: '/privacy',
  });
  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Last updated: February 2025</p>

        <div className="space-y-8 text-slate-600 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. Information We Collect</h2>
            <p>We collect information you provide when signing up, creating a profile, posting jobs, submitting proposals, and communicating through our platform. This includes name, email, profile details, and project-related data.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. How We Use Your Information</h2>
            <p>We use your information to operate the platform, match clients with freelancers, process transactions, send notifications, improve our services, and comply with legal obligations.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with service providers who assist our operations, or when required by law. Profile information you choose to make public is visible to other users.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Data Security</h2>
            <p>We implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. Your Rights</h2>
            <p>You may access, correct, or delete your personal information through your account settings. You may also export your data or request account deletion by contacting support.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. Cookies</h2>
            <p>We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You can manage cookie settings in your browser.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">7. Contact</h2>
            <p>For privacy-related questions, contact us at privacy@ribhasolutions.com.</p>
          </section>
        </div>

        <Link to="/" className="inline-block mt-12 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Back to home →
        </Link>
      </div>
    </div>
  );
}
