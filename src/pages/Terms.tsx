import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

export function Terms() {
  useSeo({
    title: 'Terms of Service | Ribha Solutions',
    description: 'Read the Ribha Solutions Terms of Service. Understand your rights and responsibilities when using our freelance marketplace platform.',
    path: '/terms',
  });
  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Last updated: February 2025</p>

        <div className="space-y-8 text-slate-600 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Ribha Solutions, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">2. Description of Service</h2>
            <p>Ribha Solutions connects clients with freelancers for project-based work. We provide a marketplace platform where clients can post jobs and freelancers can submit proposals. We do not employ freelancers or guarantee work outcomes.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">4. Fees and Payments</h2>
            <p>Clients pay freelancers according to agreed terms. Ribha Solutions may charge service fees as described in our Pricing page. All fees are non-refundable unless otherwise stated.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">5. Dispute Resolution</h2>
            <p>We encourage parties to resolve disputes directly. Ribha Solutions may assist with mediation but is not liable for outcomes. Our dispute resolution process is available in the Help Center.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">6. Limitation of Liability</h2>
            <p>Ribha Solutions is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">7. Changes</h2>
            <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance.</p>
          </section>
        </div>

        <Link to="/" className="inline-block mt-12 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Back to home →
        </Link>
      </div>
    </div>
  );
}
