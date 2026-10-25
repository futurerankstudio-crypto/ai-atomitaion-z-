import React from 'react';
import { DashboardTab } from './Sidebar';
import { Plus, RefreshCw, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  currentTab: DashboardTab;
  onOpenActionModal?: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onReturnHome: () => void;
}

const tabTitles: Record<DashboardTab, { title: string; subtitle: string; actionLabel?: string }> = {
  overview: {
    title: 'Business Overview',
    subtitle: 'Calculated metrics, active workflows, and operational health.',
    actionLabel: 'New Inquiry Lead',
  },
  leads: {
    title: 'Leads & CRM',
    subtitle: 'Manage client acquisition pipeline, priority, and follow-ups.',
    actionLabel: 'Add Lead',
  },
  support: {
    title: 'Customer Support Copilot',
    subtitle: 'Grounded AI reply assistance and ticket queue triage.',
    actionLabel: 'New Message',
  },
  workflows: {
    title: 'Automation Workflows',
    subtitle: 'Visual event triggers, execution logs, and live test runners.',
    actionLabel: 'New Workflow',
  },
  ecommerce: {
    title: 'E-commerce Operations',
    subtitle: 'Orders ledger, customer linking, and stock threshold monitors.',
    actionLabel: 'Store Webhook Sync',
  },
  tasks: {
    title: 'Tasks & Follow-ups',
    subtitle: 'Pending action items, overdue reminders, and team assignees.',
    actionLabel: 'Add Task',
  },
  analytics: {
    title: 'Analytics & Reports',
    subtitle: 'Lead sources, status distribution, and execution reliability.',
    actionLabel: 'Export CSV',
  },
  integrations: {
    title: 'Integrations Center',
    subtitle: 'Connect Local Demo Engine, n8n, Make, email, and e-commerce stores.',
    actionLabel: 'Test All Integrations',
  },
  logs: {
    title: 'Activity Logs',
    subtitle: 'Tamper-evident audit trail of all automated and manual actions.',
  },
  settings: {
    title: 'Workspace Settings',
    subtitle: 'System environment, model configuration, and dataset controls.',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenActionModal,
  onRefreshData,
  isRefreshing,
  onReturnHome,
}) => {
  const currentMeta = tabTitles[currentTab] || {
    title: 'Dashboard',
    subtitle: 'Smart Business AI Automation System',
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md px-6 flex items-center justify-between gap-6 sticky top-0 z-30">
      {/* Zone 1: Breadcrumb & Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="text-xs text-slate-500 font-medium hidden sm:inline whitespace-nowrap">
          Smart Business AI Automation
        </span>
        <span className="text-xs text-slate-600 hidden sm:inline">/</span>
        <div className="truncate">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Zone 2 & 3: Actions & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Server Isolation Active</span>
        </div>

        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh database records"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        )}

        {currentMeta.actionLabel && onOpenActionModal && (
          <button
            onClick={onOpenActionModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{currentMeta.actionLabel}</span>
          </button>
        )}

        <button
          onClick={onReturnHome}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 whitespace-nowrap"
        >
          <span>Landing Page</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </header>
  );
};
