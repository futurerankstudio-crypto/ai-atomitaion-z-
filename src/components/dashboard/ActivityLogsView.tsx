import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';
import { ActivityLog } from '../../types';
import { api } from '../../api/client';

export const ActivityLogsView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getActivityLogs();
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Audit & Activity Logs</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Immutable chronological record of events, status mutations, and automation triggers.
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, target, actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Event Categories</option>
            <option value="Lead">Leads & CRM</option>
            <option value="Support">Customer Support</option>
            <option value="Workflow">Workflows</option>
            <option value="Order">E-commerce</option>
            <option value="Task">Tasks</option>
            <option value="Integration">Integrations</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-36">Timestamp</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Target / Entity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading activity stream...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No matching activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const date = new Date(log.timestamp);
                  const timeFormatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] tabular-nums">
                        {timeFormatted}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{log.action}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {log.target}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{log.category}</td>
                      <td className="py-3.5 px-4 text-slate-300">{log.actor}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold capitalize ${
                            log.status === 'success'
                              ? 'text-emerald-400'
                              : log.status === 'warning'
                              ? 'text-amber-400'
                              : log.status === 'error'
                              ? 'text-rose-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
