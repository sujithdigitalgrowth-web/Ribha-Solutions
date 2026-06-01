const TRANSACTIONS_KEY = 'talentforge_transactions';

export type TransactionType =
  | 'deposit'
  | 'escrow_fund'
  | 'escrow_release'
  | 'invoice_payment'
  | 'withdrawal'
  | 'refund'
  | 'platform_fee';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  relatedId?: string;
  relatedType?: 'contract' | 'invoice' | 'milestone';
  balanceAfter?: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

function getRaw(): Transaction[] {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function save(transactions: Transaction[]) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions.slice(-500)));
}

export function getTransactions(userId: string, limit = 50): Transaction[] {
  const all = getRaw();
  return all
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const all = getRaw();
  const tx: Transaction = {
    ...t,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(tx);
  save(all);
  return tx;
}
