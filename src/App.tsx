/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { Sidebar, DashboardTab } from './components/dashboard/Sidebar';
import { TopBar } from './components/dashboard/TopBar';
import { OverviewView } from './components/dashboard/OverviewView';
import { LeadsView } from './components/dashboard/LeadsView';
import { SupportView } from './components/dashboard/SupportView';
import { WorkflowsView } from './components/dashboard/WorkflowsView';
import { EcommerceView } from './components/dashboard/EcommerceView';
import { TasksView } from './components/dashboard/TasksView';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { IntegrationsView } from './components/dashboard/IntegrationsView';
import { ActivityLogsView } from './components/dashboard/ActivityLogsView';
import { SettingsView } from './components/dashboard/SettingsView';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openNewLeadTrigger, setOpenNewLeadTrigger] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleOpenActionModal = () => {
    if (currentTab === 'leads' || currentTab === 'overview') {
      setCurrentTab('leads');
      setOpenNewLeadTrigger(true);
    } else if (currentTab === 'tasks') {
      // Trigger new task
    }
  };

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onExploreDemo={() => {
          setViewMode('dashboard');
          setCurrentTab('overview');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setOpenNewLeadTrigger(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onReturnHome={() => setViewMode('landing')}
      />

      {/* Main App Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? 'ml-18' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <TopBar
          currentTab={currentTab}
          onOpenActionModal={handleOpenActionModal}
          onRefreshData={handleRefreshData}
          isRefreshing={isRefreshing}
          onReturnHome={() => setViewMode('landing')}
        />

        {/* Dynamic Module Canvas */}
        <main className="flex-1 bg-[#090d16]">
          {currentTab === 'overview' && (
            <OverviewView
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNewLeadModal={() => {
                setCurrentTab('leads');
                setOpenNewLeadTrigger(true);
              }}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              onRefreshStats={handleRefreshData}
              openAddModalInitially={openNewLeadTrigger}
            />
          )}

          {currentTab === 'support' && <SupportView />}

          {currentTab === 'workflows' && <WorkflowsView />}

          {currentTab === 'ecommerce' && <EcommerceView />}

          {currentTab === 'tasks' && <TasksView />}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'integrations' && <IntegrationsView />}

          {currentTab === 'logs' && <ActivityLogsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
