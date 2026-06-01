import { useState } from 'react';
import { getOrCreateEscrow, fundEscrow } from '@/utils/escrowStorage';
import { deductFromBalance } from '@/utils/walletStorage';
import { addTransaction } from '@/utils/transactionsStorage';
import { CURRENCY_SYMBOL } from '@/config/brand';

interface FundEscrowModalProps {
  contractId: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  freelancerId: string;
  totalNeeded: number;
  alreadyFunded: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function FundEscrowModal({
  contractId,
  jobId,
  jobTitle,
  clientId,
  freelancerId,
  totalNeeded,
  alreadyFunded,
  onSuccess,
  onClose,
}: FundEscrowModalProps) {
  const [amount, setAmount] = useState(String(Math.max(0, totalNeeded - alreadyFunded)));
  const [error, setError] = useState('');

  const amountNum = parseFloat(amount) || 0;
  const remaining = Math.max(0, totalNeeded - alreadyFunded);

  const handleFund = () => {
    setError('');
    if (amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (amountNum > remaining) {
      setError(`Maximum to fund: ${CURRENCY_SYMBOL}${remaining.toFixed(2)}`);
      return;
    }
    const result = deductFromBalance(clientId, amountNum);
    if (!result.success) {
      setError('Insufficient balance. Add funds first.');
      return;
    }
    getOrCreateEscrow(contractId, jobId, clientId, freelancerId);
    fundEscrow(contractId, amountNum);
    addTransaction({
      userId: clientId,
      type: 'escrow_fund',
      amount: amountNum,
      currency: 'INR',
      description: `Funded milestones for "${jobTitle}"`,
      relatedId: contractId,
      relatedType: 'contract',
      balanceAfter: result.wallet?.balance,
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Add funds</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Add funds for "{jobTitle}". Funds are released to the freelancer when you approve milestones.
        </p>
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already funded: {CURRENCY_SYMBOL}{alreadyFunded.toFixed(2)} / {CURRENCY_SYMBOL}{totalNeeded.toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">Remaining: {CURRENCY_SYMBOL}{remaining.toFixed(2)}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount to add (INR)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={handleFund} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
            Add funds
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
