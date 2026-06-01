import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getJobs } from '@/utils/jobsStorage';
import { getProposals } from '@/utils/proposalsStorage';
import { getContracts } from '@/utils/contractsStorage';
import { getSupportTickets } from '@/utils/supportTicketsStorage';

export function ExportData() {
  const { user } = useAuth();
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    if (!user?.id) return;

    const jobs = user.role === 'client' ? getJobs(user.id) : getJobs();
    const proposals = getProposals(user.role === 'freelancer' ? { freelancerId: user.id } : undefined);
    const contracts = getContracts();
    const tickets = getSupportTickets(user.id);

    const data = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      jobs,
      proposals,
      contracts,
      supportTickets: tickets,
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentforge-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csvRows: string[] = [];
      csvRows.push('Type,ID,Title/Subject,CreatedAt');
      jobs.forEach((j) => csvRows.push(`Job,${j.id},"${j.title.replace(/"/g, '""')}",${j.createdAt}`));
      proposals.forEach((p) => csvRows.push(`Proposal,${p.id},"${(p.coverLetter || '').slice(0, 50).replace(/"/g, '""')}",${p.createdAt}`));
      contracts.forEach((c) => csvRows.push(`Contract,${c.id},"${c.freelancerName}",${c.hiredAt}`));
      tickets.forEach((t) => csvRows.push(`Ticket,${t.id},"${t.subject.replace(/"/g, '""')}",${t.createdAt}`));
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talentforge-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExported(true);
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to export your data.</p>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Export your data</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Download your jobs, proposals, contracts, and support tickets.
        </p>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
          >
            Export
          </button>
          {exported && (
            <p className="text-green-600 dark:text-green-400 text-sm">Download started. Check your downloads folder.</p>
          )}
        </div>

        <Link to="/dashboard" className="inline-block mt-8 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
