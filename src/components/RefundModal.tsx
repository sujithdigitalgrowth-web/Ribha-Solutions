import { useState } from 'react';
import { refundToClient } from '@/utils/escrowStorage';
import { addToBalance } from '@/utils/walletStorage';
import { addTransaction } from '@/utils/transactionsStorage';
import { addNotification } from '@/utils/notificationsStorage';
import { CURRENCY_SYMBOL } from '@/config/brand';

interface RefundModalProps {
  contractId: string;
  jobTitle: string;
  clientId: string;
  freelancerId: string;
  availableAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function RefundModal({
  contractId,
  jobTitle,
  clientId,
  freelancerId,
  availableAmount,
  onSuccess,
  onClose,
}: RefundModalProps) {
  const [amount, setAmount] = useState(String(availableAmount));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const amountNum = parseFloat(amount) || 0;

  const handleRefund = () => {
    setError('');
    if (amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (amountNum > availableAmount) {
      setError(`Maximum refund: ${CURRENCY_SYMBOL}${availableAmount.toFixed(2)}`);
      return;
    }
    const result = refundToClient(contractId, amountNum);
    if (!result) {
      setError('Refund failed');
      return;
    }
    const wallet = addToBalance(clientId, amountNum);
    addTransaction({
      userId: clientId,
      type: 'refund',
      amount: amountNum,
      currency: 'INR',
      description: `Refund for "${jobTitle}"${reason ? `: ${reason}` : ''}`,
      relatedId: contractId,
      relatedType: 'contract',
      balanceAfter: wallet.balance,
    });
    addNotification({
      userId: freelancerId,
      type: 'hire',
      title: 'Escrow refund',
      body: `Client requested ${CURRENCY_SYMBOL}${amountNum.toFixed(2)} refund for "${jobTitle}"`,
      link: `/contract/${contractId}`,
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Request refund</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Return funds from escrow to your wallet. Available: {CURRENCY_SYMBOL}{availableAmount.toFixed(2)}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (INR)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            max={availableAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason (optional)</label>
          <input
            type="text"
            placeholder="e.g. Project cancelled"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={handleRefund} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
            Refund
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
