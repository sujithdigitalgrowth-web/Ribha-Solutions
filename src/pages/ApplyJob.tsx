import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById } from '@/utils/jobsStorage';
import { submitProposal, hasApplied } from '@/utils/proposalsStorage';
import { getProposalTemplates } from '@/utils/proposalTemplatesStorage';
import { addNotification } from '@/utils/notificationsStorage';
import { SignaturePad } from '@/components/SignaturePad';

const STEPS = [
  { id: 1, title: 'Cover letter' },
  { id: 2, title: 'Proposed rate' },
  { id: 3, title: 'Timeline & availability' },
  { id: 4, title: 'NDA agreement' },
  { id: 5, title: 'Review & submit' },
];

const MIN_COVER_LETTER = 100;
const MIN_RATE = 3;
const MIN_TIMELINE = 20;
const MIN_ADDRESS = 10;

const DISCLOSURE_TEXT = `NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into as of the date of your electronic signature below, between you ("Recipient") and the project client ("Disclosing Party").

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any data or information, oral or written, disclosed by the Disclosing Party to the Recipient that is not generally known to the public, including but not limited to: project specifications, business plans, trade secrets, technical data, financial information, customer lists, and any other proprietary information.

2. OBLIGATIONS OF RECIPIENT
The Recipient agrees to:
(a) Hold all Confidential Information in strict confidence;
(b) Not disclose Confidential Information to any third party without prior written consent;
(c) Use Confidential Information solely for the purpose of performing work on the project;
(d) Not use Confidential Information for Recipient's own benefit or the benefit of any third party;
(e) Return or destroy all Confidential Information upon project completion or upon request.

3. TERM AND SURVIVAL
This Agreement shall remain in effect during the project and for a period of five (5) years following project completion. The obligations under this Agreement shall survive termination of any project or business relationship.

4. ELECTRONIC SIGNATURE
By typing your full legal name and address below and checking the acceptance box, you acknowledge that you have read, understood, and agree to be bound by this Agreement. Your electronic signature has the same legal effect as a handwritten signature.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with applicable laws.`;

export function ApplyJob() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [coverLetter, setCoverLetter] = useState('');
  const [whyGoodFit, setWhyGoodFit] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [timeline, setTimeline] = useState('');
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [ndaFullName, setNdaFullName] = useState('');
  const [ndaAddress, setNdaAddress] = useState('');
  const [ndaDisclosureAccepted, setNdaDisclosureAccepted] = useState(false);
  const [ndaSignature, setNdaSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const job = id ? getJobById(id) : null;
  const alreadyApplied = id && user?.id ? hasApplied(id, user.id) : false;

  const canProceed = () => {
    if (step === 1) return coverLetter.trim().length >= MIN_COVER_LETTER;
    if (step === 2) return proposedRate.trim().length >= MIN_RATE;
    if (step === 3) return timeline.trim().length >= MIN_TIMELINE;
    if (step === 4) return ndaDisclosureAccepted && ndaAgreed && ndaFullName.trim().length >= 2 && ndaAddress.trim().length >= MIN_ADDRESS && ndaSignature;
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user?.id) return;
    if (coverLetter.trim().length < MIN_COVER_LETTER) {
      setError(`Cover letter must be at least ${MIN_COVER_LETTER} characters`);
      return;
    }
    if (!ndaDisclosureAccepted || !ndaAgreed || ndaFullName.trim().length < 2 || ndaAddress.trim().length < MIN_ADDRESS || !ndaSignature) {
      setError('You must read and accept the disclosure, draw your signature, and provide your address to apply');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitProposal({
        jobId: id,
        freelancerId: user.id,
        freelancerName: user.name,
        coverLetter: coverLetter.trim(),
        whyGoodFit: whyGoodFit.trim() || undefined,
        proposedRate: proposedRate.trim(),
        timeline: timeline.trim(),
        ndaSigned: ndaAgreed,
        ndaSignedAt: ndaAgreed ? new Date().toISOString() : undefined,
        ndaAddress: ndaAddress.trim(),
        ndaDisclosureAccepted: ndaDisclosureAccepted,
        ndaSignatureDataUrl: ndaSignature,
      });
      if (job?.clientId) {
        addNotification({
          userId: job.clientId,
          type: 'proposal',
          title: 'New proposal received',
          body: `${user.name} applied for "${job.title}"`,
          link: `/my-jobs/${id}`,
        });
      }
      setSubmitted(true);
    } catch {
      setError('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.name) setNdaFullName(user.name);
  }, [user?.name]);

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">Job not found</p>
          <Link to="/find-work" className="text-indigo-600 font-semibold hover:underline">
            Back to Find Work
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">Please log in to apply</p>
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">Only freelancers can apply for jobs</p>
          <Link to="/find-talent" className="text-indigo-600 font-semibold hover:underline">
            Go to Find Talent
          </Link>
        </div>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-600 mb-4">You have already applied for this job.</p>
            <Link to="/find-work" className="text-indigo-600 font-semibold hover:underline">
              Back to Find Work
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl text-green-600 mx-auto mb-4">✓</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Application submitted!</h2>
            <p className="text-slate-600 mb-6">
              Your proposal has been sent to the client. They will review it and get in touch if interested.
            </p>
            <Link to="/find-work" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
              Back to Find Work
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = STEPS;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to={id ? `/job/${id}` : '/find-work'} className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            ← Back to job details
          </Link>
          <Link to="/find-work" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm">Find Work</Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Apply for: {job.title}</h1>
          <p className="text-slate-600 mb-4">Complete all steps to submit your proposal</p>
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${step >= s.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                {i < steps.length - 1 && <div className={`w-3 h-0.5 mx-0.5 ${step > s.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">Step {step} of {steps.length}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cover letter * (min {MIN_COVER_LETTER} characters)</label>
              <p className="text-xs text-slate-500 mb-2">Introduce yourself and explain why you're a good fit for this project.</p>
              {user?.id && getProposalTemplates(user.id).length > 0 && (
                <div className="mb-2">
                  <label className="text-xs text-slate-500">Use template:</label>
                  <select
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;
                      const t = getProposalTemplates(user!.id).find((x) => x.id === id);
                      if (t) {
                        setCoverLetter(t.coverLetter);
                        setProposedRate(t.proposedRate);
                        setTimeline(t.timeline);
                      }
                      e.target.value = '';
                    }}
                    className="ml-2 px-2 py-1 border border-slate-200 rounded text-sm"
                  >
                    <option value="">Select...</option>
                    {getProposalTemplates(user.id).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <textarea
                placeholder="Describe your experience, relevant work, and how you would approach this project..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{coverLetter.length} / {MIN_COVER_LETTER} characters minimum</p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Why I'm a good fit (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 5 years React experience, similar project completed"
                  value={whyGoodFit}
                  onChange={(e) => setWhyGoodFit(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proposed rate *</label>
              <p className="text-xs text-slate-500 mb-2">Your proposed compensation for this project</p>
              <input
                type="text"
                placeholder={job.projectType === 'fixed' ? 'e.g. ₹50,000 for the project' : 'e.g. ₹500/hr'}
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Project budget: {job.budget ? (job.budget.startsWith('₹') ? job.budget : `₹${job.budget}`) : '—'}</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timeline & availability * (min {MIN_TIMELINE} characters)</label>
              <p className="text-xs text-slate-500 mb-2">When can you start and how long will it take?</p>
              <textarea
                placeholder="e.g. I can start immediately. Estimated completion: 3-4 weeks. Available 20 hours per week..."
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{timeline.length} / {MIN_TIMELINE} characters minimum</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Disclosure & Non-Disclosure Agreement</h3>
                <p className="text-xs text-slate-500 mb-2">Please read the full disclosure text below before signing.</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap">
                  {DISCLOSURE_TEXT}
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ndaDisclosureAccepted}
                  onChange={(e) => setNdaDisclosureAccepted(e.target.checked)}
                  className="mt-1 text-indigo-600 rounded"
                />
                <span className="text-sm text-slate-700">
                  I have read and accept the disclosure text above. I understand and agree to the terms of this Non-Disclosure Agreement.
                </span>
              </label>

              <div className="border-t border-slate-200 pt-6 space-y-4">
                <h4 className="font-medium text-slate-900">Sign below to complete the NDA</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your signature *</label>
                  <p className="text-xs text-slate-500 mb-2">Draw your signature in the box below using your mouse or touch</p>
                  <SignaturePad
                    value={ndaSignature}
                    onChange={setNdaSignature}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full legal name *</label>
                  <input
                    type="text"
                    placeholder="Type your full legal name"
                    value={ndaFullName}
                    onChange={(e) => setNdaFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address * (street, city, state, zip)</label>
                  <input
                    type="text"
                    placeholder="Enter your full address"
                    value={ndaAddress}
                    onChange={(e) => setNdaAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">{ndaAddress.length} / {MIN_ADDRESS} characters minimum</p>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ndaAgreed}
                    onChange={(e) => setNdaAgreed(e.target.checked)}
                    className="mt-1 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-slate-700">
                    I certify that the information above is accurate. I understand that my electronic signature is legally binding.
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 mb-4">Review your application</h3>
              <div className="space-y-4 text-sm">
                <div><p className="text-slate-500 mb-0.5">Cover letter</p><p className="text-slate-700 whitespace-pre-wrap line-clamp-4">{coverLetter}</p></div>
                <div><p className="text-slate-500 mb-0.5">Proposed rate</p><p className="font-medium text-slate-900">{proposedRate}</p></div>
                <div><p className="text-slate-500 mb-0.5">Timeline</p><p className="text-slate-700 line-clamp-2">{timeline}</p></div>
                {ndaAgreed && (
                  <div>
                    <p className="text-green-600 font-medium">NDA signed by {ndaFullName}</p>
                    {ndaSignature && <img src={ndaSignature} alt="Signature" className="mt-2 h-12 border border-slate-200 rounded" />}
                    {ndaAddress && <p className="text-slate-600 text-sm mt-1">Address: {ndaAddress}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
            <button type="button" onClick={handleBack} className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
              Back
            </button>
            <div className="flex-1" />
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg"
              >
                {loading ? 'Submitting...' : 'Submit application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
