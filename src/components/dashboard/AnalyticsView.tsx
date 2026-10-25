import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { Lead, Workflow, Task, WorkflowExecution } from '../../types';
import { api } from '../../api/client';

export const AnalyticsView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, wfRes, tasksRes, execsRes] = await Promise.all([
        api.getLeads(),
        api.getWorkflows(),
        api.getTasks(),
        api.getWorkflowExecutions(),
      ]);
      setLeads(leadsRes.leads);
      setWorkflows(wfRes.workflows);
      setTasks(tasksRes.tasks);
      setExecutions(execsRes.executions);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real calculations
  const totalLeads = leads.length;

  // Lead Sources breakdown
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });

  // Status Funnel
  const statusCounts: Record<string, number> = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    'Proposal Sent': 0,
    Won: 0,
    Lost: 0,
  };
  leads.forEach((l) => {
    if (statusCounts[l.status] !== undefined) {
      statusCounts[l.status] += 1;
    }
  });

  // Automation stats
  const totalExecutions = workflows.reduce((a, b) => a + b.successCount + b.failureCount, 0);
  const totalSuccess = workflows.reduce((a, b) => a + b.successCount, 0);
  const totalFailed = workflows.reduce((a, b) => a + b.failureCount, 0);
  const successRate = totalExecutions > 0 ? ((totalSuccess / totalExecutions) * 100).toFixed(1) : '100';

  // Task Completion
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Real CSV Exporter
  const exportCsv = (type: 'leads' | 'tasks' | 'workflows') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (type === 'leads') {
      filename = `futurerank_leads_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Source', 'Business Type', 'Status', 'Priority', 'Created Date'];
      rows = leads.map((l) => [
        l.id,
        `"${l.name}"`,
        l.email,
        l.phone || '',
        `"${l.company || ''}"`,
        l.source,
        l.businessType,
        l.status,
        l.priority,
        l.createdAt,
      ]);
    } else if (type === 'tasks') {
      filename = `futurerank_tasks_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['ID', 'Title', 'Related To', 'Due Date', 'Priority', 'Assignee', 'Status'];
      rows = tasks.map((t) => [
        t.id,
        `"${t.title}"`,
        `"${t.relatedTo}"`,
        t.dueDate,
        t.priority,
        t.assignedUser,
        t.status,
      ]);
    } else {
      filename = `futurerank_workflow_executions_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Execution ID', 'Workflow ID', 'Workflow Name', 'Trigger Source', 'Status', 'Start Time', 'Completion Time'];
      rows = executions.map((e) => [
        e.id,
        e.workflowId,
        `"${e.workflowName}"`,
        `"${e.triggerSource}"`,
        e.status,
        e.startTime,
        e.completionTime,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Business Intelligence & Telemetry</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Calculated strictly from database records without simulated or vanity metrics.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv('leads')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Leads CSV</span>
          </button>
          <button
            onClick={() => exportCsv('tasks')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tasks CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Total Pipeline Leads</div>
          <div className="text-3xl font-bold text-white tabular-nums tracking-tight font-mono">
            {totalLeads}
          </div>
          <div className="text-[11px] text-blue-400 mt-1">Verified Inbound</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Workflow Success Rate</div>
          <div className="text-3xl font-bold text-emerald-400 tabular-nums tracking-tight font-mono">
            {successRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalSuccess} passed / {totalExecutions} runs
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Task Completion</div>
          <div className="text-3xl font-bold text-white tabular-nums tracking-tight font-mono">
            {taskCompletionRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {completedTasks} of {totalTasks} finished
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 mb-1">Won / Closed Leads</div>
          <div className="text-3xl font-bold text-blue-400 tabular-nums tracking-tight font-mono">
            {statusCounts.Won}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Converted Accounts</div>
        </div>
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Lead Sources Distribution (Clean SVG Bars) */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Lead Ingestion by Source Channel</h3>
            <span className="text-xs text-slate-500 font-mono">Total {totalLeads}</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(sourceCounts).map(([source, count]) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={source} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-medium">{source}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Status Pipeline Funnel */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Acquisition Status Pipeline</h3>
            <span className="text-xs text-slate-500 font-mono">Funnel View</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div
                  key={status}
                  className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        status === 'Won'
                          ? 'text-emerald-400'
                          : status === 'Lost'
                          ? 'text-rose-400'
                          : status === 'Qualified'
                          ? 'text-blue-400'
                          : status === 'Proposal Sent'
                          ? 'text-indigo-400'
                          : status === 'Contacted'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-slate-300">
                    <span className="font-bold text-white">{count}</span> leads ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workflow Reliability Breakdown */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Automation Execution Reliability</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of execution runs, failures, and step stability across all defined sequences.
            </p>
          </div>
          <button
            onClick={() => exportCsv('workflows')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            Export Execution Logs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {workflows.map((wf) => {
            const runs = wf.successCount + wf.failureCount;
            const rate = runs > 0 ? Math.round((wf.successCount / runs) * 100) : 100;

            return (
              <div
                key={wf.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="font-semibold text-white truncate">{wf.name}</div>
                <div className="text-slate-400 font-mono text-[11px]">{wf.category}</div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-mono tabular-nums text-[11px]">
                  <span className="text-emerald-400 font-bold">{rate}% Success</span>
                  <span className="text-slate-500">{runs} Total Runs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
