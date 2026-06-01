import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getInvoices, type Invoice } from '@/utils/invoicesStorage';
import { getJobById } from '@/utils/jobsStorage';
import { PayInvoiceModal } from '@/components/PayInvoiceModal';

function formatDate(s: string) {
  return new Date(s).toLocaleDateString();
}

export function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (user?.id) {
      const list = user.role === 'freelancer'
        ? getInvoices({ freelancerId: user.id })
        : getInvoices({ clientId: user.id });
      setInvoices(list);
    }
  }, [user?.id, user?.role]);

  const refresh = () => {
    if (user?.id) {
      const list = user.role === 'freelancer'
        ? getInvoices({ freelancerId: user.id })
        : getInvoices({ clientId: user.id });
      setInvoices(list);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] py-16 px-4 text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to view invoices.</p>
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Log in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Invoices</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          {user.role === 'freelancer' ? 'Invoices you\'ve created' : 'Invoices from freelancers'}
        </p>

        {invoices.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No invoices yet</p>
            <p className="text-slate-500 text-sm">Invoices are created from completed contracts</p>
            <Link to="/dashboard" className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => {
              const job = getJobById(inv.jobId);
              return (
                <div key={inv.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{job?.title || 'Project'}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      {inv.items.length} item(s) • Due {formatDate(inv.dueDate)}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      inv.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      inv.status === 'sent' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{inv.total}</p>
                    {user.role === 'client' && inv.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => setPayingInvoice(inv)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {payingInvoice && (
          <PayInvoiceModal
            invoice={payingInvoice}
            jobTitle={getJobById(payingInvoice.jobId)?.title || 'Project'}
            onSuccess={refresh}
            onClose={() => setPayingInvoice(null)}
          />
        )}

        <Link to="/dashboard" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
