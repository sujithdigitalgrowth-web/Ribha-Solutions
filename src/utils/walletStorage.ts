const WALLET_KEY = 'talentforge_wallets';

export interface Wallet {
  userId: string;
  balance: number; // in INR (stored as number for simplicity)
  currency: string;
  updatedAt: string;
}

function getRaw(): Record<string, Wallet> {
  try {
    const data = localStorage.getItem(WALLET_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function save(wallets: Record<string, Wallet>) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallets));
}

export function getWallet(userId: string): Wallet | null {
  const wallets = getRaw();
  return wallets[userId] ?? null;
}

export function getOrCreateWallet(userId: string): Wallet {
  const wallets = getRaw();
  if (wallets[userId]) return wallets[userId];
  const wallet: Wallet = {
    userId,
    balance: 0,
    currency: 'INR',
    updatedAt: new Date().toISOString(),
  };
  wallets[userId] = wallet;
  save(wallets);
  return wallet;
}

export function addToBalance(userId: string, amount: number): Wallet {
  const wallet = getOrCreateWallet(userId);
  const newBalance = Math.round((wallet.balance + amount) * 100) / 100;
  const updated: Wallet = {
    ...wallet,
    balance: newBalance,
    updatedAt: new Date().toISOString(),
  };
  const wallets = getRaw();
  wallets[userId] = updated;
  save(wallets);
  return updated;
}

export function deductFromBalance(userId: string, amount: number): { success: boolean; wallet?: Wallet } {
  const wallet = getOrCreateWallet(userId);
  if (wallet.balance < amount) return { success: false };
  const newBalance = Math.round((wallet.balance - amount) * 100) / 100;
  const updated: Wallet = {
    ...wallet,
    balance: newBalance,
    updatedAt: new Date().toISOString(),
  };
  const wallets = getRaw();
  wallets[userId] = updated;
  save(wallets);
  return { success: true, wallet: updated };
}

export function getBalance(userId: string): number {
  return getOrCreateWallet(userId).balance;
}
