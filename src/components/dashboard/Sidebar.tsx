import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Workflow,
  ShoppingBag,
  ListTodo,
  BarChart3,
  Boxes,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';

export type DashboardTab =
  | 'overview'
  | 'leads'
  | 'support'
  | 'workflows'
  | 'ecommerce'
  | 'tasks'
  | 'analytics'
  | 'integrations'
  | 'logs'
  | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onReturnHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onReturnHome,
}) => {
  const navItems = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'leads' as DashboardTab, label: 'Leads & CRM', icon: Users },
    { id: 'support' as DashboardTab, label: 'Customer Support', icon: MessageSquare },
    { id: 'workflows' as DashboardTab, label: 'Automation Workflows', icon: Workflow },
    { id: 'ecommerce' as DashboardTab, label: 'E-commerce Operations', icon: ShoppingBag },
    { id: 'tasks' as DashboardTab, label: 'Tasks & Follow-ups', icon: ListTodo },
    { id: 'analytics' as DashboardTab, label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'integrations' as DashboardTab, label: 'Integrations Center', icon: Boxes },
    { id: 'logs' as DashboardTab, label: 'Activity Logs', icon: ScrollText },
    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 bg-[#070b13] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header / Branding */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/30">
                <Zap className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-white tracking-tight truncate">Future Rank</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">AI Automation</div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/30">
              <Zap className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace context banner */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Workspace</div>
            <div className="text-xs font-medium text-slate-200 truncate">Future Rank Demo Studio</div>
            <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
              <span>Interactive Preview Mode</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onReturnHome}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Return to Public Homepage"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
          {!collapsed && <span>Public Landing Page</span>}
        </button>

        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 leading-tight">
            <span className="text-slate-300 font-medium">Future Rank Studio</span>
            <div className="text-[10px] text-slate-500 mt-0.5">WhatsApp: +92 321 7507345</div>
          </div>
        )}
      </div>
    </aside>
  );
};
