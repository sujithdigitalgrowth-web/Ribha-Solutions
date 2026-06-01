import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs, type Job } from '@/utils/jobsStorage';
import { sendInvite, getInvites } from '@/utils/invitesStorage';

const MOCK_FREELANCERS: Record<string, { name: string }> = {
  '1': { name: 'Sarah Chen' },
  '2': { name: 'Marcus Johnson' },
  '3': { name: 'Elena Rodriguez' },
  '4': { name: 'David Kim' },
  '5': { name: 'Priya Sharma' },
  '6': { name: 'James Wilson' },
};

const STEPS = [
  { id: 1, title: 'Select project' },
  { id: 2, title: 'Invite message' },
  { id: 3, title: 'Timeline expectations' },
  { id: 4, title: 'Payment & milestones' },
  { id: 5, title: 'Additional requirements' },
  { id: 6, title: 'Review & send' },
];

const MIN_MESSAGE_CHARS = 100;
const MIN_TIMELINE_CHARS = 30;
const MIN_PAYMENT_CHARS = 30;

export function InviteToJob() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [timelineExpect, setTimelineExpect] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [requireNDA, setRequireNDA] = useState(false);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const freelancer = id ? MOCK_FREELANCERS[id] : null;
  const openJobs = jobs.filter((j) => j.status === 'open');
  const existingInvites = id ? getInvites({ freelancerId: id, clientId: user?.id ?? '' }) : [];
  const selectedJob = openJobs.find((j) => j.id === selectedJobId);

  useEffect(() => {
    if (user?.id) {
      setJobs(getJobs(user.id));
    }
  }, [user?.id]);

  const canProceed = () => {
    if (step === 1) return !!selectedJobId;
    if (step === 2) return message.trim().length >= MIN_MESSAGE_CHARS;
    if (step === 3) return timelineExpect.trim().length >= MIN_TIMELINE_CHARS;
    if (step === 4) return paymentTerms.trim().length >= MIN_PAYMENT_CHARS;
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !id || !user?.id) return;
    if (message.trim().length < MIN_MESSAGE_CHARS) {
      setError(`Invite message must be at least ${MIN_MESSAGE_CHARS} characters`);
      return;
    }
    if (timelineExpect.trim().length < MIN_TIMELINE_CHARS) {
      setError(`Timeline expectations must be at least ${MIN_TIMELINE_CHARS} characters`);
      return;
    }
    if (paymentTerms.trim().length < MIN_PAYMENT_CHARS) {
      setError(`Payment terms must be at least ${MIN_PAYMENT_CHARS} characters`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      sendInvite(selectedJobId, id, user.id, {
        message: message.trim(),
        timelineExpect: timelineExpect.trim(),
        paymentTerms: paymentTerms.trim(),
        requireNDA,
        additionalRequirements: additionalRequirements.trim() || undefined,
      });
      setSent(true);
    } catch {
      setError('Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-4">Freelancer not found</p>
          <Link to="/find-talent" className="text-indigo-600 font-semibold hover:underline">
            Back to Find Freelancers
          </Link>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl text-green-600 mx-auto mb-4">✓</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invite sent!</h2>
            <p className="text-slate-600 mb-6">
              Your invite has been sent to {freelancer.name}. They will be notified and can respond with a proposal.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={`/freelancer/${id}`} className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
                Back to profile
              </Link>
              <Link to="/my-jobs" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                View My Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Link to={`/freelancer/${id}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 mb-6">← Back to profile</Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invite {freelancer.name} to a job</h1>
          <p className="text-slate-600 mb-4">Provide detailed information to ensure a successful collaboration.</p>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${step >= s.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                {i < STEPS.length - 1 && <div className={`w-3 h-0.5 mx-0.5 ${step > s.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">Step {step} of 6: {STEPS[step - 1].title}</p>
        </div>

        <form onSubmit={handleSendInvite} className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {openJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">You don't have any open projects yet.</p>
                  <Link to="/post-job" className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                    Post a project
                  </Link>
                </div>
              ) : (
                openJobs.map((job) => {
                  const alreadyInvited = existingInvites.some((i) => i.jobId === job.id);
                  return (
                    <label
                      key={job.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedJobId === job.id ? 'border-indigo-600 bg-indigo-50' : alreadyInvited ? 'border-slate-200 bg-slate-50 opacity-75' : 'border-slate-200 hover:border-indigo-300'
                      } ${alreadyInvited ? 'cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="job"
                        value={job.id}
                        checked={selectedJobId === job.id}
                        onChange={() => !alreadyInvited && setSelectedJobId(job.id)}
                        disabled={alreadyInvited}
                        className="text-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{job.title}</p>
                        <p className="text-sm text-slate-500">{job.budget} • {job.projectType === 'fixed' ? 'Fixed' : 'Hourly'}</p>
                      </div>
                      {alreadyInvited && <span className="text-sm text-slate-500">Already invited</span>}
                    </label>
                  );
                })
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Personalized invite message * (min {MIN_MESSAGE_CHARS} characters)</label>
              <p className="text-xs text-slate-500 mb-2">Explain why you're inviting this freelancer and what you expect from them.</p>
              <textarea
                placeholder="Write a detailed message: introduce your project, why you chose this freelancer, key expectations, and any questions you have..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{message.length} / {MIN_MESSAGE_CHARS} characters minimum</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timeline expectations * (min {MIN_TIMELINE_CHARS} characters)</label>
              <p className="text-xs text-slate-500 mb-2">Specify when you need the work done and any milestones.</p>
              <textarea
                placeholder="e.g. Project start: within 1 week of acceptance. Milestone 1: deliver mockups by March 20. Final delivery: April 15..."
                value={timelineExpect}
                onChange={(e) => setTimelineExpect(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{timelineExpect.length} / {MIN_TIMELINE_CHARS} characters minimum</p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment terms & milestones * (min {MIN_PAYMENT_CHARS} characters)</label>
                <p className="text-xs text-slate-500 mb-2">Describe how and when payment will be made.</p>
                <textarea
                  placeholder="e.g. 30% upfront, 40% after milestone 1, 30% on final delivery. Invoice required..."
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{paymentTerms.length} / {MIN_PAYMENT_CHARS} characters minimum</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input type="checkbox" checked={requireNDA} onChange={(e) => setRequireNDA(e.target.checked)} className="text-indigo-600 rounded" />
                  <span>Require NDA (Non-Disclosure Agreement) before project start</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional requirements (optional)</label>
                <textarea
                  placeholder="Any other requirements: communication tools, meeting schedule, reporting preferences, etc."
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-900 mb-4">Review your invite</h3>
              {selectedJob && (
                <div className="space-y-4 text-sm">
                  <div><p className="text-slate-500 mb-0.5">Project</p><p className="font-medium text-slate-900">{selectedJob.title}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Invite message</p><p className="text-slate-700 whitespace-pre-wrap line-clamp-4">{message}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Timeline</p><p className="text-slate-700 line-clamp-2">{timelineExpect}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Payment terms</p><p className="text-slate-700 line-clamp-2">{paymentTerms}</p></div>
                  {requireNDA && <p className="text-amber-600 font-medium">NDA required</p>}
                  {additionalRequirements && <div><p className="text-slate-500 mb-0.5">Additional</p><p className="text-slate-700 line-clamp-2">{additionalRequirements}</p></div>}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-200">
            <button type="button" onClick={handleBack} className="px-6 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50">
              Back
            </button>
            <div className="flex-1" />
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || (step === 1 && openJobs.length === 0)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !selectedJobId}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
