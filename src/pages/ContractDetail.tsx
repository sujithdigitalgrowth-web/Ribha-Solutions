import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getJobById } from '@/utils/jobsStorage';
import { getContracts, completeContract, type Contract } from '@/utils/contractsStorage';
import {
  getMilestones,
  addMilestone,
  requestMilestoneClearance,
  completeMilestone,
  releasePayment,
  cancelMilestone,
  type Milestone,
} from '@/utils/milestonesStorage';
import { getDisputes, createDispute, type Dispute } from '@/utils/disputesStorage';
import { getReviews, addReview } from '@/utils/reviewsStorage';
import { getProposals } from '@/utils/proposalsStorage';
import {
  getTimeLogs,
  addTimeLog,
  approveTimeLog,
  getActiveTimer,
  startTimer,
  stopTimer,
  getTotalLoggedHours,
  type TimeLog,
} from '@/utils/timeLogsStorage';
import { addNotification } from '@/utils/notificationsStorage';
import { updateJob } from '@/utils/jobsStorage';
import { createInvoice } from '@/utils/invoicesStorage';
import { addToBalance } from '@/utils/walletStorage';
import { addTransaction } from '@/utils/transactionsStorage';
import { PLATFORM_FEE, CURRENCY_SYMBOL } from '@/config/brand';
import { useToast } from '@/contexts/ToastContext';
import { API_ENABLED } from '@/config/api';
import { fetchMilestones, addMilestoneApi, updateMilestoneStatusApi } from '@/services/dynamicDataApi';

function formatDate(s: string) {
  return new Date(s).toLocaleDateString();
}

function parseAmount(s: string): number {
  return parseFloat((s || '0').replace(/[^0-9.]/g, '')) || 0;
}

function formatMoney(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return `${CURRENCY_SYMBOL}${v.toFixed(2)}`;
}

export function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [contract, setContract] = useState<Contract | null>(null);
  const [job, setJob] = useState<ReturnType<typeof getJobById>>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [showAddTimeLog, setShowAddTimeLog] = useState(false);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualMemo, setManualMemo] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [timerActive, setTimerActive] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [clearanceMilestone, setClearanceMilestone] = useState<Milestone | null>(null);
  const [clearanceNote, setClearanceNote] = useState('');

  const loadMilestones = async (contractId: string) => {
    if (!contractId) return;
    if (!API_ENABLED) {
      setMilestones(getMilestones(contractId));
      return;
    }
    setMilestonesLoading(true);
    try {
      const list = (await fetchMilestones(contractId)) as Milestone[];
      setMilestones(Array.isArray(list) ? list : []);
    } finally {
      setMilestonesLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const c = getContracts().find((x) => x.id === id);
      setContract(c ?? null);
      if (c) {
        setJob(getJobById(c.jobId));
        loadMilestones(c.id);
        setDisputes(getDisputes({ contractId: c.id }));
        setTimeLogs(getTimeLogs(c.id));
      }
    }
  }, [id]);

  const activeTimer = getActiveTimer();
  useEffect(() => {
    if (activeTimer && contract && activeTimer.contractId === contract.id && activeTimer.freelancerId === contract.freelancerId) {
      setTimerActive(true);
      const interval = setInterval(() => {
        setTimerElapsed(Math.floor((Date.now() - new Date(activeTimer.startedAt).getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimerActive(false);
      setTimerElapsed(0);
    }
  }, [activeTimer, contract]);

  const refresh = () => {
    if (contract) {
      if (API_ENABLED) {
        loadMilestones(contract.id);
      } else {
        setMilestones(getMilestones(contract.id));
      }
      setDisputes(getDisputes({ contractId: contract.id }));
      setContract(getContracts().find((c) => c.id === contract.id) ?? null);
      setTimeLogs(getTimeLogs(contract.id));
    }
  };

  const handleAddManualTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !user?.id || contract.freelancerId !== user.id) return;
    const h = parseInt(manualHours || '0', 10) || 0;
    const m = parseInt(manualMinutes || '0', 10) || 0;
    if (h === 0 && m === 0) return;
    addTimeLog({
      contractId: contract.id,
      freelancerId: user.id,
      type: 'manual',
      hours: h,
      minutes: m,
      memo: manualMemo.trim() || undefined,
      date: manualDate,
    });
    setManualHours('');
    setManualMinutes('');
    setManualMemo('');
    setManualDate(new Date().toISOString().split('T')[0]);
    setShowAddTimeLog(false);
    refresh();
  };

  const handleStartTimer = () => {
    if (!contract || !user?.id || contract.freelancerId !== user.id) return;
    startTimer(contract.id, user.id);
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    const state = stopTimer();
    if (!state || !contract || !user?.id) return;
    const elapsed = Date.now() - new Date(state.startedAt).getTime();
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    if (hours > 0 || minutes > 0) {
      addTimeLog({
        contractId: contract.id,
        freelancerId: user.id,
        type: 'timer',
        hours,
        minutes,
        memo: state.memo,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setTimerActive(false);
    refresh();
  };

  const handleApproveTimeLog = (log: TimeLog) => {
    if (!user?.id || contract?.clientId !== user.id) return;
    approveTimeLog(log.id, user.id);
    refresh();
  };

  const isHourly = job?.projectType === 'hourly';
  const totalHours = contract ? getTotalLoggedHours(contract.id) : 0;
  const isFixedPrice = job?.projectType === 'fixed';
  const totalMilestoneAmount = milestones.reduce((s, m) => s + parseAmount(m.amount), 0);
  const cancelledMilestoneAmount = milestones.filter((m) => m.status === 'cancelled').reduce((s, m) => s + parseAmount(m.amount), 0);
  const paidMilestoneAmount = milestones.filter((m) => m.status === 'paid').reduce((s, m) => s + parseAmount(m.amount), 0);
  const completedMilestoneAmount = milestones.filter((m) => m.status === 'completed').reduce((s, m) => s + parseAmount(m.amount), 0);
  const submittedMilestoneAmount = milestones.filter((m) => m.status === 'submitted').reduce((s, m) => s + parseAmount(m.amount), 0);
  const activeMilestoneAmount = milestones
    .filter((m) => m.status === 'pending' || m.status === 'in_progress')
    .reduce((s, m) => s + parseAmount(m.amount), 0);

  const totalNonCancelled = Math.max(0, totalMilestoneAmount - cancelledMilestoneAmount);
  const remainingToPay = Math.max(0, totalNonCancelled - paidMilestoneAmount);
  const agreedAmountRaw =
    contract?.totalAmount ??
    (contract
      ? getProposals({ jobId: contract.jobId, freelancerId: contract.freelancerId })[0]?.proposedRate
      : undefined);
  const agreedAmount = agreedAmountRaw ? formatMoney(parseAmount(agreedAmountRaw)) : null;

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !user?.id || contract.clientId !== user.id) return;
    if (API_ENABLED) {
      const res = await addMilestoneApi({
        contractId: contract.id,
        jobId: contract.jobId,
        title: newMilestoneTitle.trim(),
        description: '',
        amount: newMilestoneAmount.trim(),
        order: milestones.length,
      });
      if (!res.success) {
        addToast('Failed to add milestone. Please try again.', 'error');
        return;
      }
    } else {
      await addMilestone({
        contractId: contract.id,
        jobId: contract.jobId,
        title: newMilestoneTitle.trim(),
        description: '',
        amount: newMilestoneAmount.trim(),
        status: 'pending',
        order: milestones.length,
      });
    }
    setNewMilestoneTitle('');
    setNewMilestoneAmount('');
    setShowAddMilestone(false);
    refresh();
  };

  /** Freelancer: request client to clear (approve) this milestone. Optional note included in notification. */
  const handleRequestClearance = async (m: Milestone, note?: string) => {
    if (!user?.id || contract?.freelancerId !== user.id) return;
    if (API_ENABLED) {
      const res = await updateMilestoneStatusApi(m.id, 'submitted');
      if (!res.success) {
        addToast('Failed to request clearance. Please try again.', 'error');
        return;
      }
    } else {
      await requestMilestoneClearance(m.id);
    }
    if (contract?.clientId) {
      const noteText = note?.trim() ? ` Note: ${note.trim()}` : '';
      addNotification({
        userId: contract.clientId,
        type: 'hire',
        title: 'Milestone ready for approval',
        body: `Freelancer has completed work for "${m.title}" and requested clearance. Please review and release payment.${noteText}`,
        link: `/contract/${contract.id}`,
      });
    }
    setClearanceMilestone(null);
    setClearanceNote('');
    refresh();
  };

  const handleConfirmClearance = () => {
    if (clearanceMilestone) {
      handleRequestClearance(clearanceMilestone, clearanceNote);
    }
  };

  /** Client: approve work (only for milestones in "submitted" state). */
  const handleApproveMilestone = (m: Milestone) => {
    if (!user?.id || contract?.clientId !== user.id) return;
    if (API_ENABLED) {
      updateMilestoneStatusApi(m.id, 'completed').then((res) => {
        if (!res.success) {
          // If this milestone does not exist in API (e.g. local/seed item), keep client flow working locally.
          if (res.error?.includes('Milestone not found')) {
            completeMilestone(m.id);
            addToast('Approved locally (milestone not found on API).', 'warning');
          } else {
            addToast(res.error ? `Failed to approve milestone: ${res.error}` : 'Failed to approve milestone. Please try again.', 'error');
          }
        }
        refresh();
      });
      return;
    }
    completeMilestone(m.id);
    refresh();
  };

  const handleReleasePayment = (m: Milestone) => {
    if (!user?.id || contract?.clientId !== user.id || !contract) return;
    const grossAmount = parseAmount(m.amount);
    if (grossAmount <= 0) {
      addToast('Invalid milestone amount. Please set a numeric amount before releasing payment.', 'error');
      return;
    }
    const feeAmount = Math.round(grossAmount * PLATFORM_FEE * 100) / 100;
    const netAmount = Math.round((grossAmount - feeAmount) * 100) / 100;
    const wallet = addToBalance(contract.freelancerId, netAmount);
    if (API_ENABLED) {
      updateMilestoneStatusApi(m.id, 'paid').then((res) => {
        if (!res.success) {
          // Keep release flow usable for local/seed milestones not present on API.
          if (res.error?.includes('Milestone not found')) {
            releasePayment(m.id);
            addToast('Payment marked paid locally (milestone not found on API).', 'warning');
          } else {
            addToast(res.error ? `Failed to release payment: ${res.error}` : 'Failed to release payment. Please try again.', 'error');
          }
        }
        refresh();
      });
    } else {
      releasePayment(m.id);
    }
    addTransaction({
      userId: contract.freelancerId,
      type: 'escrow_release',
      amount: netAmount,
      currency: 'INR',
      description: `Payment for "${m.title}"${feeAmount > 0 ? ` (${(PLATFORM_FEE * 100).toFixed(0)}% fee: -${CURRENCY_SYMBOL}${feeAmount.toFixed(2)})` : ''}`,
      relatedId: m.id,
      relatedType: 'milestone',
      balanceAfter: wallet.balance,
    });
    addNotification({
      userId: contract.freelancerId,
      type: 'hire',
      title: 'Payment released',
      body: `You received ${CURRENCY_SYMBOL}${netAmount.toFixed(2)} for "${m.title}"${feeAmount > 0 ? ` (${(PLATFORM_FEE * 100).toFixed(0)}% platform fee applied)` : ''}`,
      link: `/contract/${contract.id}`,
    });
    addToast(`Released ${CURRENCY_SYMBOL}${netAmount.toFixed(2)} to freelancer${feeAmount > 0 ? ` (${CURRENCY_SYMBOL}${feeAmount.toFixed(2)} platform fee)` : ''}`, 'success');
    refresh();
  };

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !user?.id || !disputeSubject.trim() || !disputeDesc.trim()) return;
    createDispute({
      contractId: contract.id,
      jobId: contract.jobId,
      reporterId: user.id,
      reporterRole: user.role as 'client' | 'freelancer',
      subject: disputeSubject.trim(),
      description: disputeDesc.trim(),
      status: 'open',
    });
    setDisputeSubject('');
    setDisputeDesc('');
    setShowDispute(false);
    refresh();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !user?.id || !reviewComment.trim()) return;
    const revieweeId = user.role === 'client' ? contract.freelancerId : contract.clientId;
    addReview({
      jobId: contract.jobId,
      reviewerId: user.id,
      revieweeId,
      rating: reviewRating,
      comment: reviewComment.trim(),
      role: user.role as 'client' | 'freelancer',
    });
    addNotification({
      userId: revieweeId,
      type: 'review',
      title: 'New review received',
      body: `You received a ${reviewRating}-star review`,
      link: `/freelancer/${revieweeId}`,
    });
    setShowReview(false);
    setReviewComment('');
  };

  const handleDownloadContract = () => {
    if (!contract || !job) return;
    const text = `CONTRACT - Ribha Solutions\n\nJob: ${job.title}\nClient ID: ${contract.clientId}\nFreelancer: ${contract.freelancerName}\nHired: ${formatDate(contract.hiredAt)}\nStatus: ${contract.status}\n\nThis contract is governed by Ribha Solutions Terms of Service.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${job.title.slice(0, 20)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateInvoice = () => {
    if (!contract || !user?.id || contract.freelancerId !== user.id) return;
    const total = milestones.reduce((s, m) => s + (parseFloat((m.amount || '0').replace(/[^0-9.]/g, '')) || 0), 0);
    createInvoice({
      freelancerId: contract.freelancerId,
      clientId: contract.clientId,
      contractId: contract.id,
      jobId: contract.jobId,
      items: milestones.length ? milestones.map((m) => ({ description: m.title, amount: m.amount })) : [{ description: job?.title || 'Project', amount: contract.totalAmount || `${CURRENCY_SYMBOL}0` }],
      total: total > 0 ? `${CURRENCY_SYMBOL}${total.toFixed(2)}` : (contract.totalAmount || `${CURRENCY_SYMBOL}0`),
      status: 'draft',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setInvoiceCreated(true);
  };

  const handleCompleteJob = () => {
    if (!contract || !user?.id || contract.clientId !== user.id) return;
    updateJob(contract.jobId, { status: 'closed' });
    const updated = completeContract(contract.id);
    if (updated) setContract(updated);
    addNotification({
      userId: contract.freelancerId,
      type: 'hire',
      title: 'Project completed',
      body: `"${job?.title}" has been marked complete. Leave a review!`,
      link: `/contract/${contract.id}`,
    });
    setShowReview(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to view this contract</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Contract not found</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isClient = user.role === 'client' && contract.clientId === user.id;
  const isFreelancer = user.role === 'freelancer' && contract.freelancerId === user.id;
  const canAccess = isClient || isFreelancer;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">You don't have access to this contract</p>
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const otherPartyName = isClient ? contract.freelancerName : 'Client';
  const hasReviewed = getReviews(contract.freelancerId).some((r) => r.jobId === contract.jobId && r.reviewerId === user.id) ||
    getReviews(contract.clientId).some((r) => r.jobId === contract.jobId && r.reviewerId === user.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          ← Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job?.title || 'Project'}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Contract with {otherPartyName} • Hired {formatDate(contract.hiredAt)}
              </p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                contract.status === 'active'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
              }`}>
                {contract.status === 'active' ? 'In progress' : 'Completed'}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleDownloadContract} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">
                Download contract
              </button>
              {isFreelancer && contract.status === 'completed' && (
                invoiceCreated ? (
                  <Link to="/invoices" className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg">
                    View invoice
                  </Link>
                ) : (
                  <button type="button" onClick={handleCreateInvoice} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg">
                    Create invoice
                  </button>
                )
              )}
              <Link
                to={`/messages?with=${isClient ? contract.freelancerId : contract.clientId}`}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
              >
                Message
              </Link>
              {contract.status === 'active' && isClient && (
                <button
                  type="button"
                  onClick={handleCompleteJob}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                >
                  Mark complete
                </button>
              )}
              {contract.status === 'completed' && !hasReviewed && !showReview && (
                <button
                  type="button"
                  onClick={() => setShowReview(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                >
                  Leave review
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project funds (fixed-price) */}
        {isFixedPrice && contract && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project funds</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Approved {formatMoney(completedMilestoneAmount)} • Paid {formatMoney(paidMilestoneAmount)}
                </p>
                {job?.budget ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Job budget: {formatMoney(parseAmount(job.budget))}
                  </p>
                ) : null}
              {agreedAmount ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Agreed amount: {agreedAmount}
                </p>
              ) : null}
              </div>
            </div>

            {/* Budget summary */}
            <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total milestones</div>
                <div className="font-semibold text-slate-900 dark:text-white">{formatMoney(totalMilestoneAmount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Cancelled</div>
                <div className="font-semibold text-slate-900 dark:text-white">{formatMoney(cancelledMilestoneAmount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Paid</div>
                <div className="font-semibold text-slate-900 dark:text-white">{formatMoney(paidMilestoneAmount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Approved</div>
                <div className="font-semibold text-slate-900 dark:text-white">{formatMoney(completedMilestoneAmount)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Remaining</div>
                <div className="font-semibold text-slate-900 dark:text-white">{formatMoney(remainingToPay)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Pending work total: {formatMoney(activeMilestoneAmount)} • Awaiting approval: {formatMoney(submittedMilestoneAmount)}
            </p>
          </div>
        )}

        {/* Request clearance modal: optional note to client */}
        {clearanceMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Request clearance</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                You’re asking the client to approve work for “{clearanceMilestone.title}”. Add an optional note below.
              </p>
              <textarea
                placeholder="Note to client (optional)"
                value={clearanceNote}
                onChange={(e) => setClearanceNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg mb-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleConfirmClearance} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                  Request clearance
                </button>
                <button type="button" onClick={() => { setClearanceMilestone(null); setClearanceNote(''); }} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Milestones */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Milestones</h2>
            {isClient && (
              <button
                type="button"
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                {showAddMilestone ? 'Cancel' : '+ Add milestone'}
              </button>
            )}
          </div>

          {showAddMilestone && (
            <form onSubmit={handleAddMilestone} className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg mb-2 bg-white dark:bg-slate-800"
              />
              <input
                type="text"
                placeholder={`Amount (e.g. ${CURRENCY_SYMBOL}20,000)`}
                value={newMilestoneAmount}
                onChange={(e) => setNewMilestoneAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg mb-2 bg-white dark:bg-slate-800"
              />
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Add
              </button>
            </form>
          )}

          {milestonesLoading ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading milestones…</p>
          ) : milestones.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No milestones yet. Add one to track progress.</p>
          ) : (
            <>
              {isClient && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                  When the freelancer requests clearance for a milestone, you will see <strong>Approve work</strong> here. After you approve, use <strong>Release payment</strong> to pay.
                </p>
              )}
            <div className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{m.title}</p>
                    {m.description ? <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{m.description}</p> : null}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{formatMoney(parseAmount(m.amount))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      m.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      m.status === 'completed' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      m.status === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      m.status === 'cancelled' ? 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {m.status === 'submitted' ? (isClient ? 'Awaiting your approval' : 'Awaiting client approval') : m.status === 'cancelled' ? 'Cancelled' : m.status}
                    </span>
                    {(m.status === 'pending' || m.status === 'in_progress') && isFreelancer && (
                      <button
                        type="button"
                        onClick={() => { setClearanceMilestone(m); setClearanceNote(''); }}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded"
                      >
                        Request clearance
                      </button>
                    )}
                    {m.status === 'submitted' && isClient && (
                      <button
                        type="button"
                        onClick={() => handleApproveMilestone(m)}
                        className="px-3 py-1 bg-amber-600 text-white text-sm rounded"
                      >
                        Approve work
                      </button>
                    )}
                    {m.status === 'completed' && isClient && (
                      <button
                        type="button"
                        onClick={() => handleReleasePayment(m)}
                        disabled={parseAmount(m.amount) <= 0}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title={parseAmount(m.amount) <= 0 ? 'Milestone amount must be numeric' : ''}
                      >
                        Release payment
                      </button>
                    )}
                    {/* Cancel milestone: client can cancel pending/in_progress/submitted; freelancer can cancel pending/in_progress */}
                    {m.status !== 'cancelled' && m.status !== 'completed' && m.status !== 'paid' && (
                      (isClient && (m.status === 'pending' || m.status === 'in_progress' || m.status === 'submitted')) ||
                      (isFreelancer && (m.status === 'pending' || m.status === 'in_progress'))
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Cancel this milestone? This cannot be undone.')) {
                            if (API_ENABLED) {
                              updateMilestoneStatusApi(m.id, 'cancelled').then((res) => {
                                if (!res.success) {
                                  addToast(res.error ? `Failed to cancel milestone: ${res.error}` : 'Failed to cancel milestone. Please try again.', 'error');
                                }
                                refresh();
                              });
                            } else {
                              cancelMilestone(m.id).then(() => refresh());
                            }
                          }
                        }}
                        className="px-3 py-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    )}
                    {isClient && (m.status === 'pending' || m.status === 'in_progress') && (
                      <span className="text-xs text-slate-400 italic">Waiting for freelancer to request clearance</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>

        {/* Time tracking (hourly contracts) */}
        {isHourly && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Time tracking</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Total: {totalHours.toFixed(1)}h</span>
                {isFreelancer && (
                  <>
                    {!timerActive ? (
                      <button type="button" onClick={handleStartTimer} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg">
                        Start timer
                      </button>
                    ) : (
                      <button type="button" onClick={handleStopTimer} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
                        Stop timer ({Math.floor(timerElapsed / 3600)}h {Math.floor((timerElapsed % 3600) / 60)}m)
                      </button>
                    )}
                    <button type="button" onClick={() => setShowAddTimeLog(!showAddTimeLog)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium">
                      {showAddTimeLog ? 'Cancel' : '+ Manual entry'}
                    </button>
                  </>
                )}
              </div>
            </div>
            {showAddTimeLog && (
              <form onSubmit={handleAddManualTime} className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Hours</label>
                  <input type="number" min="0" value={manualHours} onChange={(e) => setManualHours(e.target.value)} className="w-20 px-2 py-1 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Minutes</label>
                  <input type="number" min="0" max="59" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} className="w-20 px-2 py-1 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
                  <input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} className="px-2 py-1 border rounded" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Memo</label>
                  <input type="text" placeholder="What did you work on?" value={manualMemo} onChange={(e) => setManualMemo(e.target.value)} className="w-full px-2 py-1 border rounded" />
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Add</button>
              </form>
            )}
            {timeLogs.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No time logged yet.</p>
            ) : (
              <div className="space-y-2">
                {timeLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{log.hours}h {log.minutes}m</span>
                        <span className="text-xs text-slate-500">{log.type === 'timer' ? '⏱' : '✏'}</span>
                        {log.approved && <span className="text-xs text-green-600">✓ Approved</span>}
                      </div>
                      {log.memo && <p className="text-sm text-slate-500 mt-0.5">{log.memo}</p>}
                      <p className="text-xs text-slate-400">{formatDate(log.date)}</p>
                    </div>
                    {isClient && !log.approved && (
                      <button type="button" onClick={() => handleApproveTimeLog(log)} className="px-3 py-1 bg-green-600 text-white text-sm rounded">
                        Approve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disputes */}
        {disputes.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Disputes</h2>
            {disputes.map((d) => (
              <div key={d.id} className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg mb-2">
                <p className="font-medium text-slate-900 dark:text-white">{d.subject}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{d.description}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                  d.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30' :
                  d.status === 'in_review' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-slate-100 dark:bg-slate-700'
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {showDispute && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Report a dispute</h2>
            <form onSubmit={handleCreateDispute} className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                value={disputeSubject}
                onChange={(e) => setDisputeSubject(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
              <textarea
                placeholder="Describe the issue..."
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Submit
                </button>
                <button type="button" onClick={() => setShowDispute(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showReview && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Leave a review for {otherPartyName}</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReviewRating(r)}
                      className={`w-10 h-10 rounded-lg font-bold ${
                        r <= reviewRating
                          ? 'bg-amber-400 text-amber-900'
                          : 'bg-slate-200 dark:bg-slate-600 text-slate-500'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Share your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Submit review
                </button>
                <button type="button" onClick={() => setShowReview(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
