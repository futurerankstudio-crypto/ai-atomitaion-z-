import {
  Lead,
  SupportConversation,
  Workflow,
  WorkflowExecution,
  Task,
  EcommerceOrder,
  StockAlert,
  IntegrationItem,
  ActivityLog,
  SystemHealth,
} from '../types';

export const api = {
  // Health
  getHealth: async (): Promise<SystemHealth> => {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Leads
  getLeads: async (params?: { search?: string; status?: string; priority?: string; source?: string }): Promise<{ leads: Lead[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.source) query.set('source', params.source);

    const res = await fetch(`/api/leads?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  createLead: async (data: Partial<Lead>): Promise<{ lead: Lead; task: Task }> => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create lead');
    }
    return res.json();
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<{ lead: Lead }> => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update lead');
    }
    return res.json();
  },

  deleteLead: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete lead');
    return res.json();
  },

  summarizeLead: async (leadId: string): Promise<{ summary: string; modelUsed: string; isAi: boolean }> => {
    const res = await fetch('/api/ai/summarize-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId }),
    });
    return res.json();
  },

  // Support Conversations
  getSupportConversations: async (params?: { search?: string; status?: string; category?: string; priority?: string }): Promise<{ conversations: SupportConversation[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.priority) query.set('priority', params.priority);

    const res = await fetch(`/api/support/conversations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch support conversations');
    return res.json();
  },

  sendSupportMessage: async (conversationId: string, text: string, senderName = 'Agent'): Promise<any> => {
    const res = await fetch(`/api/support/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender: 'agent', senderName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  updateConversation: async (id: string, data: Partial<SupportConversation>): Promise<{ conversation: SupportConversation }> => {
    const res = await fetch(`/api/support/conversations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  generateAiReply: async (conversationId: string, customerMessage?: string): Promise<{ reply: string; modelUsed: string; isAiGrounded: boolean; message?: string }> => {
    const res = await fetch('/api/ai/support-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, customerMessage }),
    });
    return res.json();
  },

  // Workflows
  getWorkflows: async (): Promise<{ workflows: Workflow[] }> => {
    const res = await fetch('/api/workflows');
    return res.json();
  },

  createWorkflow: async (data: Partial<Workflow>): Promise<{ workflow: Workflow }> => {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create workflow');
    }
    return res.json();
  },

  updateWorkflow: async (id: string, data: Partial<Workflow>): Promise<{ workflow: Workflow }> => {
    const res = await fetch(`/api/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteWorkflow: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  executeWorkflow: async (id: string, triggerSource?: string): Promise<{ execution: WorkflowExecution; workflow: Workflow }> => {
    const res = await fetch(`/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggerSource }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Execution failed');
    }
    return res.json();
  },

  getWorkflowExecutions: async (): Promise<{ executions: WorkflowExecution[] }> => {
    const res = await fetch('/api/workflow-executions');
    return res.json();
  },

  // Tasks
  getTasks: async (params?: { status?: string; priority?: string }): Promise<{ tasks: Task[] }> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);

    const res = await fetch(`/api/tasks?${query.toString()}`);
    return res.json();
  },

  createTask: async (data: Partial<Task>): Promise<{ task: Task }> => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<{ task: Task }> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // E-commerce
  getOrders: async (): Promise<{ orders: EcommerceOrder[] }> => {
    const res = await fetch('/api/ecommerce/orders');
    return res.json();
  },

  getStockAlerts: async (): Promise<{ alerts: StockAlert[] }> => {
    const res = await fetch('/api/ecommerce/stock-alerts');
    return res.json();
  },

  updateOrderStatus: async (id: string, status: EcommerceOrder['status']): Promise<{ order: EcommerceOrder }> => {
    const res = await fetch(`/api/ecommerce/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // Integrations
  getIntegrations: async (): Promise<{ integrations: IntegrationItem[] }> => {
    const res = await fetch('/api/integrations');
    return res.json();
  },

  testIntegration: async (id: string, values?: Record<string, string>): Promise<{ success: boolean; message: string; integration: IntegrationItem }> => {
    const res = await fetch(`/api/integrations/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Integration test failed');
    }
    return data;
  },

  // Activity Logs
  getActivityLogs: async (): Promise<{ logs: ActivityLog[] }> => {
    const res = await fetch('/api/activity-logs');
    return res.json();
  },

  // Public Landing Inquiry
  submitInquiry: async (data: { name: string; email: string; phone?: string; businessType: string; message: string }): Promise<{ success: boolean; message: string; leadId: string }> => {
    const res = await fetch('/api/inquiry/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Submission failed');
    }
    return resData;
  },

  // Reset demo data
  resetDemoData: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/data/reset', { method: 'POST' });
    return res.json();
  },
};
