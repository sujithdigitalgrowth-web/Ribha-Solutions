import { useState } from 'react';
import { deductFromBalance, addToBalance } from '@/utils/walletStorage';
import { addTransaction } from '@/utils/transactionsStorage';
import { updateInvoiceStatus } from '@/utils/invoicesStorage';
import { addNotification } from '@/utils/notificationsStorage';
import type { Invoice } from '@/utils/invoicesStorage';
import { CURRENCY_SYMBOL } from '@/config/brand';

interface PayInvoiceModalProps {
  invoice: Invoice;
  jobTitle: string;
  onSuccess: () => void;
  onClose: () => void;
}

function parseAmount(total: string): number {
  return parseFloat((total || '0').replace(/[^0-9.]/g, '')) || 0;
}

export function PayInvoiceModal({ invoice, jobTitle, onSuccess, onClose }: PayInvoiceModalProps) {
  const [error, setError] = useState('');
  const amount = parseAmount(invoice.total);

  const handlePay = () => {
    setError('');
    if (amount <= 0) {
      setError('Invalid invoice amount');
      return;
    }
    const result = deductFromBalance(invoice.clientId, amount);
    if (!result.success) {
      setError('Insufficient balance. Add funds first.');
      return;
    }
    const freelancerWallet = addToBalance(invoice.freelancerId, amount);
    updateInvoiceStatus(invoice.id, 'paid');
    addTransaction({
      userId: invoice.clientId,
      type: 'invoice_payment',
      amount: amount,
      currency: 'INR',
      description: `Paid invoice for "${jobTitle}"`,
      relatedId: invoice.id,
      relatedType: 'invoice',
      balanceAfter: result.wallet?.balance,
    });
    addTransaction({
      userId: invoice.freelancerId,
      type: 'escrow_release',
      amount: amount,
      currency: 'INR',
      description: `Payment received for "${jobTitle}"`,
      relatedId: invoice.id,
      relatedType: 'invoice',
      balanceAfter: freelancerWallet.balance,
    });
    addNotification({
      userId: invoice.freelancerId,
      type: 'hire',
      title: 'Invoice paid',
      body: `You received ${CURRENCY_SYMBOL}${amount.toFixed(2)} for "${jobTitle}"`,
      link: '/invoices',
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Pay invoice</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Pay {invoice.total} for "{jobTitle}" from your balance.
        </p>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={handlePay} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
            Pay {invoice.total}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
