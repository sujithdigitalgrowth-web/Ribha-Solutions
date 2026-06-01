const INVOICES_KEY = 'talentforge_invoices';

export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface Invoice {
  id: string;
  freelancerId: string;
  clientId: string;
  contractId: string;
  jobId: string;
  items: Array<{ description: string; amount: string }>;
  total: string;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
}

export function getInvoices(filters?: { freelancerId?: string; clientId?: string }): Invoice[] {
  try {
    const data = localStorage.getItem(INVOICES_KEY);
    const all: Invoice[] = data ? JSON.parse(data) : [];
    if (!filters) return all;
    return all.filter((i) => {
      if (filters.freelancerId && i.freelancerId !== filters.freelancerId) return false;
      if (filters.clientId && i.clientId !== filters.clientId) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export function createInvoice(inv: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
  const data = localStorage.getItem(INVOICES_KEY);
  const all: Invoice[] = data ? JSON.parse(data) : [];
  const i: Invoice = { ...inv, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  all.push(i);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(all));
  return i;
}

export function updateInvoiceStatus(id: string, status: InvoiceStatus): Invoice | null {
  const data = localStorage.getItem(INVOICES_KEY);
  const all: Invoice[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], status };
  localStorage.setItem(INVOICES_KEY, JSON.stringify(all));
  return all[idx];
}
