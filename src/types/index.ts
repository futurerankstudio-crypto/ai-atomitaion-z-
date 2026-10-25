export type LeadSource = 'Website Inquiry' | 'Direct Contact' | 'Shopify Store' | 'Referral' | 'Inbound Campaign';
export type BusinessType = 'E-commerce' | 'Digital Agency' | 'Professional Services' | 'SaaS / Tech' | 'Retail';
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  businessType: BusinessType;
  status: LeadStatus;
  priority: PriorityLevel;
  notes: string;
  createdAt: string;
  nextFollowUp: string;
  aiSummary?: string;
  aiCategorization?: string;
}

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'agent' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportConversation {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  channel: 'Email' | 'Website Chat' | 'WhatsApp';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved';
  priority: PriorityLevel;
  category: 'General' | 'Presales' | 'Technical' | 'Billing' | 'Automation Setup';
  humanHandoff: boolean;
  lastUpdated: string;
  messages: SupportMessage[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  actionType: 'validate' | 'database_save' | 'ai_categorize' | 'create_task' | 'notify' | 'route_human' | 'log_event';
  description: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'Leads' | 'Support' | 'E-commerce' | 'Custom';
  trigger: {
    type: string;
    title: string;
    configSummary: string;
  };
  steps: WorkflowStep[];
  enabled: boolean;
  lastRun: string | null;
  successCount: number;
  failureCount: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  triggerSource: string;
  startTime: string;
  completionTime: string;
  status: 'Success' | 'Failed' | 'Running';
  stepsCompleted: {
    stepId: string;
    stepName: string;
    status: 'success' | 'failed' | 'skipped';
    durationMs: number;
    details: string;
  }[];
  errorDetails: string | null;
}

export interface Task {
  id: string;
  title: string;
  relatedTo: string;
  relatedId?: string;
  dueDate: string;
  priority: PriorityLevel;
  assignedUser: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes: string;
  createdAt: string;
}

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  storePlatform: 'Shopify' | 'WooCommerce' | 'Custom API';
  isSampleData: boolean;
  total: number;
  currency: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'On Hold';
  items: { name: string; quantity: number; price: number; sku: string }[];
  createdAt: string;
  inquiryId?: string;
}

export interface StockAlert {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  status: 'Critical' | 'Warning' | 'Restocking';
  storePlatform: string;
}

export interface IntegrationField {
  key: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  isSecret?: boolean;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Connected' | 'Not Connected' | 'Configuring' | 'Error';
  fields: IntegrationField[];
  values: Record<string, string>;
  lastTested: string | null;
  lastTestStatus: 'success' | 'error' | null;
  lastErrorMessage: string | null;
  setupInstructions: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category: 'Lead' | 'Support' | 'Workflow' | 'Order' | 'Task' | 'Integration';
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface SystemHealth {
  status: string;
  system: string;
  studio: string;
  aiConnected: boolean;
  aiModel: string;
  environment: string;
  timestamp: string;
}
