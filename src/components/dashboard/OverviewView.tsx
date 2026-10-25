import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Workflow,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Play,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Lead, SupportConversation, Workflow as WorkflowType, Task, ActivityLog, WorkflowExecution } from '../../types';
import { api } from '../../api/client';
import { DashboardTab } from './Sidebar';

interface OverviewViewProps {
  onNavigateTab: (tab: DashboardTab) => void;
  onOpenNewLeadModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab, onOpenNewLeadModal }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | 'all'>('30d');
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [leadsRes, convsRes, wfRes, tasksRes, execsRes, logsRes] = await Promise.all([
        api.getLeads(),
        api.getSupportConversations(),
        api.getWorkflows(),
        api.getTasks(),
        api.getWorkflowExecutions(),
        api.getActivityLogs(),
      ]);

      setLeads(leadsRes.leads);
      setConversations(convsRes.conversations);
      setWorkflows(wfRes.workflows);
      setTasks(tasksRes.tasks);
      setExecutions(execsRes.executions);
      setActivityLogs(logsRes.logs);
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real calculations from stored records
  const now = Date.now();
  const filterCutoff =
    dateFilter === '7d' ? now - 7 * 86400000 : dateFilter === '30d' ? now - 30 * 86400000 : 0;

  const filteredLeads = leads.filter((l) => new Date(l.createdAt).getTime() >= filterCutoff);
  const newInquiriesCount = filteredLeads.filter((l) => l.status === 'New').length;
  const totalLeadsCount = filteredLeads.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const followUpsDueCount = tasks.filter(
    (t) => t.status !== 'Completed' && (t.dueDate <= todayStr || t.priority === 'High')
  ).length;

  const openSupportCount = conversations.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;
  const activeWorkflowsCount = workflows.filter((w) => w.enabled).length;

  const totalRuns = workflows.reduce((sum, w) => sum + w.successCount + w.failureCount, 0);
  const totalSuccess = workflows.reduce((sum, w) => sum + w.successCount, 0);
  const totalFailed = workflows.reduce((sum, w) => sum + w.failureCount, 0);
  const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 100;

  const handleQuickTestRun = async () => {
    if (workflows.length === 0) return;
    const targetWf = workflows[0];
    setIsExecutingTest(true);
    setTestResult(null);

    try {
      const res = await api.executeWorkflow(targetWf.id, 'Overview Dashboard Quick-Run');
      setTestResult(`Successfully executed "${res.workflow.name}". Duration: ${res.execution.stepsCompleted.reduce((a, b) => a + b.durationMs, 0)}ms.`);
      loadData();
    } catch (err: any) {
      setTestResult(`Test execution error: ${err.message}`);
    } finally {
      setIsExecutingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-28 bg-slate-900/60 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-900/60 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-900/60 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-900/60 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Date Filter & System State Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Automation Overview</h2>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Client Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Live Relational Telemetry</span>
          </div>
        </div>

        {/* Date Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setDateFilter('7d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateFilter === '7d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('30d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateFilter === '30d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              dateFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Records
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-200 text-xs flex items-center justify-between gap-4">
          <span>{testResult}</span>
          <button
            onClick={() => setTestResult(null)}
            className="text-xs text-blue-400 hover:text-white font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tight font-mono">
            {totalLeadsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span>In database ledger</span>
          </div>
        </div>

        {/* New Inquiries */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>New Inquiries</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tight font-mono">
            {newInquiriesCount}
          </div>
          <div className="text-[11px] text-blue-400 mt-2">Require qualification</div>
        </div>

        {/* Follow-ups Due */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Follow-ups Due</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums tracking-tight font-mono">
            {followUpsDueCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Due today or overdue</div>
        </div>

        {/* Open Support */}
        <div
          onClick={() => onNavigateTab('support')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Open Tickets</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tight font-mono">
            {openSupportCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Copilot ready</div>
        </div>

        {/* Active Workflows */}
        <div
          onClick={() => onNavigateTab('workflows')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Active Flows</span>
            <Workflow className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums tracking-tight font-mono">
            {activeWorkflowsCount} / {workflows.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Triggers enabled</div>
        </div>

        {/* Automation Success Rate */}
        <div
          onClick={() => onNavigateTab('workflows')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
            <span>Run Reliability</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums tracking-tight font-mono">
            {successRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            {totalSuccess} passed · {totalFailed} failed
          </div>
        </div>
      </div>

      {/* Main Grid: Workflow Health Panel & Quick Action Trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Automation Workflow Status Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Configured Automation Workflows</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Production workflows executing validations, database writes, and alerts.
                </p>
              </div>
              <button
                onClick={handleQuickTestRun}
                disabled={isExecutingTest}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{isExecutingTest ? 'Running...' : 'Quick Test Run'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{wf.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({wf.category})</span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{wf.description}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 font-mono">
                      <span>Trigger: {wf.trigger.title}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{wf.steps.length} Steps</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400 tabular-nums">{wf.successCount} Success</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium ${
                        wf.enabled ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {wf.enabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => onNavigateTab('workflows')}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="View Workflow Builder"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>All workflow runs produce verifiable execution IDs and audit step durations.</span>
              <button
                onClick={() => onNavigateTab('workflows')}
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                <span>Full Workflow Builder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={onOpenNewLeadModal}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all text-left group"
            >
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">CRM Action</div>
              <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
                <span>Add Inbound Lead</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Manual CRM record with validation & follow-up task.</p>
            </button>

            <button
              onClick={() => onNavigateTab('support')}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all text-left group"
            >
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Support Action</div>
              <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                <span>Customer Copilot</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Grounded reply generation with human verification.</p>
            </button>

            <button
              onClick={() => onNavigateTab('ecommerce')}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all text-left group"
            >
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Store Action</div>
              <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                <span>E-commerce Sync</span>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Orders ledger and stock threshold notifications.</p>
            </button>
          </div>
        </div>

        {/* Right Column: Live Activity Audit Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent System Activity</h3>
              <button
                onClick={() => onNavigateTab('logs')}
                className="text-xs text-slate-400 hover:text-white"
              >
                View All Logs
              </button>
            </div>

            <div className="space-y-4">
              {activityLogs.slice(0, 7).map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        log.status === 'success'
                          ? 'bg-emerald-400'
                          : log.status === 'warning'
                          ? 'bg-amber-400'
                          : log.status === 'error'
                          ? 'bg-rose-400'
                          : 'bg-blue-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-200 truncate">{log.action}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 tabular-nums">
                          {timeStr}
                        </span>
                      </div>
                      <div className="text-slate-400 truncate mt-0.5">{log.target}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span>by {log.actor}</span>
                        <span className="mx-1" aria-hidden="true">·</span>
                        <span>{log.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Studio Service Callout */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-900/40">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              Custom Automation Studio
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Need Bespoke Integrations?</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Future Rank Studio designs custom n8n pipelines, Shopify app connections, and intelligent multi-agent support setups tailored to your tech stack.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/923217507345"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
              >
                WhatsApp Inquiry
              </a>
              <a
                href="mailto:futurerankstudio@gmail.com"
                className="text-xs text-slate-400 hover:text-white"
              >
                futurerankstudio@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
