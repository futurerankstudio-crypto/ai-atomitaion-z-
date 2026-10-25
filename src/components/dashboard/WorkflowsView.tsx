import React, { useState, useEffect } from 'react';
import {
  Workflow as WorkflowIcon,
  Play,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Sliders,
  Check,
  X,
  RefreshCw,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { Workflow, WorkflowExecution, WorkflowStep } from '../../types';
import { api } from '../../api/client';

export const WorkflowsView: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);

  // Execution runner state
  const [executingWfId, setExecutingWfId] = useState<string | null>(null);
  const [activeExecutionModal, setActiveExecutionModal] = useState<WorkflowExecution | null>(null);

  // New Workflow Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfCategory, setNewWfCategory] = useState<'Leads' | 'Support' | 'E-commerce' | 'Custom'>('Custom');
  const [newWfTriggerTitle, setNewWfTriggerTitle] = useState('Inbound Webhook Payload');
  const [newWfTriggerConfig, setNewWfTriggerConfig] = useState('HTTP POST /api/webhooks/custom');
  const [newSteps, setNewSteps] = useState<WorkflowStep[]>([
    { id: 'step-1', name: 'Validate JSON Schema', actionType: 'validate', description: 'Checks required fields' },
    { id: 'step-2', name: 'Persist Event', actionType: 'database_save', description: 'Stores payload to database' },
    { id: 'step-3', name: 'Dispatch Alert', actionType: 'notify', description: 'Emits alert to workspace' },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wfRes, execRes] = await Promise.all([
        api.getWorkflows(),
        api.getWorkflowExecutions(),
      ]);
      setWorkflows(wfRes.workflows);
      setExecutions(execRes.executions);

      if (wfRes.workflows.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(wfRes.workflows[0]);
      } else if (selectedWorkflow) {
        const updated = wfRes.workflows.find((w) => w.id === selectedWorkflow.id);
        if (updated) setSelectedWorkflow(updated);
      }
    } catch (err) {
      console.error('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleEnabled = async (wf: Workflow) => {
    try {
      const updated = await api.updateWorkflow(wf.id, { enabled: !wf.enabled });
      setWorkflows((prev) => prev.map((w) => (w.id === wf.id ? updated.workflow : w)));
      if (selectedWorkflow?.id === wf.id) {
        setSelectedWorkflow(updated.workflow);
      }
    } catch (err) {
      console.error('Toggle enabled error:', err);
    }
  };

  const handleExecuteWorkflow = async (wfId: string) => {
    setExecutingWfId(wfId);
    try {
      const res = await api.executeWorkflow(wfId, 'Manual Live Test (Dashboard Runner)');
      setActiveExecutionModal(res.execution);
      loadData();
    } catch (err) {
      console.error('Workflow execute error:', err);
    } finally {
      setExecutingWfId(null);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    try {
      const res = await api.createWorkflow({
        name: newWfName.trim(),
        description: newWfDesc.trim() || 'Custom automated business sequence',
        category: newWfCategory,
        trigger: {
          type: 'webhook',
          title: newWfTriggerTitle,
          configSummary: newWfTriggerConfig,
        },
        steps: newSteps,
      });

      setIsCreateModalOpen(false);
      setNewWfName('');
      setNewWfDesc('');
      loadData();
    } catch (err) {
      console.error('Create workflow error:', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Visual Workflow Automation Builder</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Engineered sequence designer with step-level validation, live test runner, and duration telemetry.
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Workflow</span>
        </button>
      </div>

      {/* Main Grid: Left is Workflow Cards, Right is Visual Step Canvas & Execution History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Workflow Selector Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Production Sequences ({workflows.length})
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Loading workflows...</div>
          ) : (
            workflows.map((wf) => {
              const isSelected = selectedWorkflow?.id === wf.id;
              const isCurrentlyExecuting = executingWfId === wf.id;

              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-3 ${
                    isSelected
                      ? 'bg-slate-800/80 border-blue-500/80 shadow-lg shadow-blue-950/40'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{wf.name}</span>
                      </div>
                      <div className="text-[11px] text-blue-400 font-mono">{wf.category}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEnabled(wf);
                      }}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        wf.enabled
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {wf.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {wf.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="tabular-nums">{wf.steps.length} Steps</span>
                    <span className="tabular-nums text-emerald-400">{wf.successCount} Success</span>
                    {wf.failureCount > 0 && (
                      <span className="tabular-nums text-rose-400">{wf.failureCount} Failed</span>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      disabled={isCurrentlyExecuting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecuteWorkflow(wf.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors disabled:opacity-50"
                    >
                      {isCurrentlyExecuting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-white" />
                          <span>Test Run</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Visual Diagram / Node Canvas (8 cols) */}
        {selectedWorkflow ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Node Diagram Card */}
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedWorkflow.name}</h3>
                    <span className="text-xs text-slate-400">· {selectedWorkflow.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {selectedWorkflow.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={executingWfId === selectedWorkflow.id}
                  onClick={() => handleExecuteWorkflow(selectedWorkflow.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-md shadow-blue-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute Test Run</span>
                </button>
              </div>

              {/* Node Diagram Flow */}
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Step-by-Step Workflow Blueprint
                </div>

                {/* Trigger Node */}
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/60 relative flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">
                      Trigger Event
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                      {selectedWorkflow.trigger.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {selectedWorkflow.trigger.configSummary}
                    </div>
                  </div>
                </div>

                {/* Steps Chain */}
                <div className="pl-6 space-y-3 relative before:absolute before:left-11 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-800">
                  {selectedWorkflow.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-4 relative z-10"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        0{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{step.name}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-mono">
                            {step.actionType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Run History Table for this Workflow */}
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Execution Run History</h4>
                <span className="text-xs text-slate-500 font-mono">
                  {executions.filter((e) => e.workflowId === selectedWorkflow.id).length} recorded runs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Run ID</th>
                      <th className="py-2.5 px-3">Trigger Source</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Steps Passed</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {executions
                      .filter((e) => e.workflowId === selectedWorkflow.id)
                      .slice(0, 5)
                      .map((exec) => {
                        const totalDuration = exec.stepsCompleted.reduce((a, b) => a + b.durationMs, 0);
                        return (
                          <tr key={exec.id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-3 font-mono text-slate-400">{exec.id}</td>
                            <td className="py-3 px-3 text-slate-200">{exec.triggerSource}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`font-semibold ${
                                  exec.status === 'Success' ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {exec.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-300 font-mono tabular-nums">
                              {exec.stepsCompleted.filter((s) => s.status === 'success').length} / {exec.stepsCompleted.length}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400 tabular-nums">
                              {totalDuration}ms
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setActiveExecutionModal(exec)}
                                className="text-blue-400 hover:text-blue-300 font-semibold"
                              >
                                Inspect Log
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Execution Inspector Modal */}
      {activeExecutionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Execution Inspector</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      activeExecutionModal.status === 'Success'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {activeExecutionModal.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  {activeExecutionModal.workflowName} · Run ID {activeExecutionModal.id}
                </div>
              </div>
              <button
                onClick={() => setActiveExecutionModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Step-by-Step Audit Log
              </div>

              <div className="space-y-2">
                {activeExecutionModal.stepsCompleted.map((step, idx) => (
                  <div
                    key={step.stepId}
                    className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-white">
                          0{idx + 1}. {step.stepName}
                        </span>
                      </div>
                      <div className="text-slate-400 pl-6">{step.details}</div>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] tabular-nums shrink-0">
                      {step.durationMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Trigger: {activeExecutionModal.triggerSource}</span>
              <button
                onClick={() => setActiveExecutionModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Workflow Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Create Automation Workflow</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Workflow Name *
                </label>
                <input
                  type="text"
                  required
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  placeholder="e.g. VIP Inbound Client Escalation"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newWfCategory}
                  onChange={(e) => setNewWfCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Leads">Leads & CRM</option>
                  <option value="Support">Customer Support</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Custom">Custom Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  placeholder="Explain the business objective of this sequence..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Save & Register Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
