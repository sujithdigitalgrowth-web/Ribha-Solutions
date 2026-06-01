# Payment System Proposal – TalentForge

## Executive Summary

This document outlines how to add a payment system to the TalentForge freelance marketplace. It covers the current state, proposed architecture, integration points, and implementation phases.

---

## 1. Current State

### What Exists Today (All localStorage / No Backend)

| Component | Location | Current Behavior |
|-----------|----------|------------------|
| **Contracts** | `contractsStorage.ts` | Has `escrowStatus` field (`none`, `funded`, `partial`, `released`) but it is **not used** in the UI |
| **Milestones** | `milestonesStorage.ts` | Client can add milestones with amounts. "Release payment" only updates status to `paid` – no real money flow |
| **Invoices** | `invoicesStorage.ts` | Freelancer creates invoice from contract. Status: `draft` → `sent` → `paid`. No "Pay" action for clients |
| **Jobs** | `jobsStorage.ts` | Has `budget`, `paymentTerms`, `projectType` (fixed/hourly) |
| **Post Job** | `PostJob.tsx` | Client enters budget and payment terms |
| **Contract Detail** | `ContractDetail.tsx` | Milestones, "Release payment" button, "Create invoice" (freelancer) |
| **Invoices Page** | `Invoices.tsx` | Lists invoices; no "Pay" or "Mark paid" UI for clients |

### Gaps

- No **escrow funding** flow (client never "funds" a contract)
- No **payment method** collection (cards, bank, etc.)
- No **transaction history** or payment records
- No **platform fee** deduction in the flow
- Invoice "Pay" action is missing for clients

---

## 2. Proposed Approach: Two Tracks

### Track A: Mock Payment System (Recommended for Current Stack)

**Goal:** Full payment UI/UX with simulated money flow. No real charges. Ideal for demo, testing, and when there is no backend.

**How it works:**
- Add a **Wallet/Balance** concept (stored in localStorage)
- Client "adds funds" to wallet (mock) or "funds escrow" with a simulated card
- Milestone "Release payment" moves money from escrow → freelancer balance
- Invoice "Pay" deducts from client wallet, credits freelancer
- Transaction log for audit trail

**Pros:** No API keys, no backend, works offline, fast to implement  
**Cons:** Not real money; for production you’d replace with a real gateway

---

### Track B: Real Payment Gateway (Stripe / PayPal)

**Goal:** Real payments. Requires backend API and payment provider.

**How it works:**
- Backend API (Node, etc.) with Stripe/PayPal SDK
- Frontend calls backend to create PaymentIntent, checkout session, etc.
- Webhooks for payment confirmation
- Escrow via Stripe Connect or similar

**Pros:** Real payments, production-ready  
**Cons:** Backend required, PCI considerations, API keys, webhooks

---

## 3. Recommended: Track A (Mock) First

Given the project uses **localStorage only** and has no backend, we recommend **Track A** first. You can later swap the mock layer for a real gateway when a backend exists.

---

## 4. Where We Will Add the Payment System

### 4.1 New Files

| File | Purpose |
|------|---------|
| `src/utils/walletStorage.ts` | User balances (client + freelancer), transaction log |
| `src/utils/escrowStorage.ts` | Escrow per contract: funded amount, released amount |
| `src/utils/transactionsStorage.ts` | All payment events (fund, release, pay invoice, withdraw) |
| `src/pages/Wallet.tsx` | Wallet balance, transaction history, add funds (mock) |
| `src/pages/PaymentMethods.tsx` | Manage payment methods (mock cards for demo) |
| `src/components/FundEscrowModal.tsx` | Modal to fund contract escrow |
| `src/components/PayInvoiceModal.tsx` | Modal to pay an invoice |

### 4.2 Modified Files

| File | Changes |
|------|---------|
| `src/utils/contractsStorage.ts` | Use `escrowStatus`; add helpers for escrow totals |
| `src/utils/invoicesStorage.ts` | Add `paymentTransactionId` when paid |
| `src/pages/ContractDetail.tsx` | Add "Fund escrow" section, wire "Release payment" to wallet/escrow |
| `src/pages/Invoices.tsx` | Add "Pay" button for clients, open PayInvoiceModal |
| `src/pages/JobDetail.tsx` | Optional: "Fund escrow" when hiring (or defer to ContractDetail) |
| `src/components/Header.tsx` | Link to Wallet in user menu |
| `src/App.tsx` | Routes: `/wallet`, `/payment-methods` |
| `src/pages/Dashboard.tsx` (Client/Freelancer) | Show balance summary, recent transactions |

### 4.3 Data Flow (Mock)

```
CLIENT FLOW:
1. Wallet → Add funds (mock: +$500)
2. Contract created → Client goes to Contract Detail
3. "Fund escrow" → Enter amount, confirm → Deduct from wallet, add to escrow
4. Freelancer completes milestone → Client clicks "Release payment"
5. Amount moves: Escrow → Freelancer wallet
6. Invoice: Client clicks "Pay" → Deduct from wallet, credit freelancer, mark invoice paid

FREELANCER FLOW:
1. Wallet shows balance from released payments
2. "Withdraw" (mock) → Simulate payout to bank (no real transfer)
3. Transaction history shows all credits
```

---

## 5. Data Structures (Mock)

### Wallet

```ts
interface Wallet {
  userId: string;
  balance: number;      // in cents or dollars
  currency: string;
  updatedAt: string;
}
```

### Escrow

```ts
interface Escrow {
  contractId: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  totalFunded: number;
  totalReleased: number;
  status: 'empty' | 'funded' | 'partial' | 'released';
  fundedAt?: string;
  updatedAt: string;
}
```

### Transaction

```ts
interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'escrow_fund' | 'escrow_release' | 'invoice_payment' | 'withdrawal';
  amount: number;
  currency: string;
  description: string;
  relatedId?: string;   // contractId, invoiceId
  createdAt: string;
  balanceAfter?: number;
}
```

---

## 6. UI/UX Flow

### 6.1 Contract Detail (Enhanced)

- **Escrow section** (above milestones):
  - Show: "Escrow: $0 / $X funded"
  - Button: "Fund escrow" (if not fully funded)
  - When funded: Show green badge "Escrow funded"
- **Milestones**:
  - "Release payment" only enabled if escrow has enough funds
  - On release: Update escrow, credit freelancer, add transaction

### 6.2 Invoices Page (Enhanced)

- For **clients**: "Pay" button on each unpaid invoice
- Click "Pay" → Modal: Confirm amount, pay from wallet
- On success: Deduct client balance, credit freelancer, mark invoice paid

### 6.3 Wallet Page (New)

- Balance at top
- "Add funds" (mock) – e.g. +$100, +$500, +$1000
- Transaction history (last 50)
- Link to Payment methods

### 6.4 Payment Methods (New)

- List of mock cards (e.g. "Visa •••• 4242")
- "Add card" (mock) – form that adds a fake card
- Used when "Add funds" or "Fund escrow" (simulate card charge)

---

## 7. Platform Fee (Optional)

- When releasing payment: deduct e.g. 5% platform fee
- Freelancer receives: `amount * 0.95`
- Store fee in transaction for reporting

---

## 8. Implementation Phases

### Phase 1: Foundation (1–2 days)
- [ ] `walletStorage.ts` – balance, init on signup
- [ ] `transactionsStorage.ts` – log all movements
- [ ] `Wallet.tsx` – balance, add funds (mock), transaction list
- [ ] Route + nav link to Wallet

### Phase 2: Escrow (1–2 days)
- [ ] `escrowStorage.ts` – per-contract escrow
- [ ] `FundEscrowModal.tsx` – amount, confirm
- [ ] ContractDetail: Escrow section, "Fund escrow" button
- [ ] Wire "Release payment" to escrow + wallet + transaction

### Phase 3: Invoices (1 day)
- [ ] `PayInvoiceModal.tsx` – confirm, pay from wallet
- [ ] Invoices page: "Pay" button for clients
- [ ] Update invoice status, wallet, transactions

### Phase 4: Polish (0.5–1 day)
- [ ] Payment methods page (mock cards)
- [ ] Dashboard balance widget
- [ ] Platform fee (optional)
- [ ] Toast notifications on success/error

---

## 9. Future: Real Payment Integration

When you add a backend:

1. Replace `walletStorage` with API calls to your backend
2. Backend uses Stripe/PayPal for:
   - Client: Add funds, fund escrow
   - Platform: Hold escrow (Stripe Connect)
   - Freelancer: Payouts
3. Keep the same UI components; swap storage layer for API service
4. Add webhook handlers for payment confirmation

---

## 10. Summary

| Aspect | Plan |
|--------|------|
| **Approach** | Mock payment system (Track A) – no backend, localStorage |
| **New pages** | Wallet, Payment Methods |
| **New components** | FundEscrowModal, PayInvoiceModal |
| **New storage** | walletStorage, escrowStorage, transactionsStorage |
| **Modified** | ContractDetail, Invoices, Header, App, Dashboard |
| **Flow** | Add funds → Fund escrow → Release to freelancer → Pay invoices |
| **Timeline** | ~4–6 days for full mock system |

---

## 11. Next Steps

1. **Confirm approach** – Mock (Track A) vs real gateway (Track B)
2. **Confirm scope** – All phases or Phase 1 only?
3. **Start implementation** – Begin with Phase 1 (Wallet + transactions)

---

*Document version: 1.0 | Last updated: Feb 2025*
