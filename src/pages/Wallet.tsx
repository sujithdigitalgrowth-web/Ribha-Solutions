import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateWallet, addToBalance, deductFromBalance } from '@/utils/walletStorage';
import { getTransactions, addTransaction, type Transaction, type TransactionType } from '@/utils/transactionsStorage';
import { useToast } from '@/contexts/ToastContext';
import { CURRENCY_SYMBOL } from '@/config/brand';

const ADD_FUND_OPTIONS = [50, 100, 250, 500, 1000];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getTransactionLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    deposit: 'Added funds',
    escrow_fund: 'Funded milestones',
    escrow_release: 'Payment received',
    invoice_payment: 'Invoice paid',
    withdrawal: 'Withdrawal',
    refund: 'Amount returned',
    platform_fee: 'Platform fee',
  };
  return labels[type] || type;
}

function getTransactionSign(type: TransactionType): '+' | '-' {
  return type === 'deposit' || type === 'escrow_release' || type === 'refund' ? '+' : '-';
}

export function Wallet() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState(100);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const refresh = () => {
    if (user?.id) {
      const wallet = getOrCreateWallet(user.id);
      setBalance(wallet.balance);
      setTransactions(getTransactions(user.id));
    }
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const handleAddFunds = (amount: number) => {
    if (!user?.id || amount <= 0) return;
    addToBalance(user.id, amount);
    addTransaction({
      userId: user.id,
      type: 'deposit',
      amount,
      currency: 'INR',
      description: `Added ${CURRENCY_SYMBOL}${amount} to balance (mock)`,
      balanceAfter: getOrCreateWallet(user.id).balance,
    });
    addToast(`${CURRENCY_SYMBOL}${amount} added to your balance`, 'success');
    setShowAddFunds(false);
    refresh();
  };

  const handleWithdraw = () => {
    if (!user?.id) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Enter a valid amount', 'error');
      return;
    }
    const result = deductFromBalance(user.id, amt);
    if (!result.success) {
      addToast('Insufficient balance', 'error');
      return;
    }
    addTransaction({
      userId: user.id,
      type: 'withdrawal',
      amount: amt,
      currency: 'INR',
      description: `Withdrew ${CURRENCY_SYMBOL}${amt} (mock - no real transfer)`,
      balanceAfter: result.wallet?.balance,
    });
    addToast(`${CURRENCY_SYMBOL}${amt} withdrawal simulated`, 'success');
    setShowWithdraw(false);
    setWithdrawAmount('');
    refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400">Please log in to view your balance.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 inline-block">Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Balance</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your funds and view transaction history</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Available balance</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{CURRENCY_SYMBOL}{balance.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">Mock balance • No real money</p>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowAddFunds(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg"
            >
              Add funds
            </button>
            <button
              type="button"
              onClick={() => setShowWithdraw(true)}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Withdraw
            </button>
            <Link
              to="/payment-methods"
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Payment methods
            </Link>
          </div>
        </div>

        {showAddFunds && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add funds (mock)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No real charges. Simulated for demo.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {ADD_FUND_OPTIONS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      addAmount === amt ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {CURRENCY_SYMBOL}{amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleAddFunds(addAmount)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                  Add {CURRENCY_SYMBOL}{addAmount}
                </button>
                <button type="button" onClick={() => setShowAddFunds(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Withdraw (mock)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Simulated transfer. No real payout.</p>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg mb-4 bg-white dark:bg-slate-900"
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleWithdraw} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium">
                  Withdraw
                </button>
                <button type="button" onClick={() => { setShowWithdraw(false); setWithdrawAmount(''); }} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transaction history</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No transactions yet. Add funds or complete a project to see activity.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.map((t) => (
                <div key={t.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{getTransactionLabel(t.type)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(t.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${['deposit', 'escrow_release', 'refund'].includes(t.type) ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                      {getTransactionSign(t.type)}{CURRENCY_SYMBOL}{Math.abs(t.amount).toFixed(2)}
                    </p>
                    {t.balanceAfter != null && (
                      <p className="text-xs text-slate-400">Balance: {CURRENCY_SYMBOL}{t.balanceAfter.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link to="/dashboard" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
