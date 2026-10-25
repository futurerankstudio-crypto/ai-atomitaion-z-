import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Lead, LeadStatus, PriorityLevel, LeadSource, BusinessType } from '../../types';
import { api } from '../../api/client';

interface LeadsViewProps {
  onRefreshStats?: () => void;
  openAddModalInitially?: boolean;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ onRefreshStats, openAddModalInitially }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Selected lead for detail panel
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitially || false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formSource, setFormSource] = useState<LeadSource>('Website Inquiry');
  const [formBusinessType, setFormBusinessType] = useState<BusinessType>('Professional Services');
  const [formStatus, setFormStatus] = useState<LeadStatus>('New');
  const [formPriority, setFormPriority] = useState<PriorityLevel>('Medium');
  const [formNotes, setFormNotes] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI Summarizer State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeResult, setSummarizeResult] = useState<{ summary: string; isAi: boolean } | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.getLeads({
        search,
        status: statusFilter,
        priority: priorityFilter,
        source: sourceFilter,
      });
      setLeads(res.leads);

      // keep selected lead synced
      if (selectedLead) {
        const updated = res.leads.find((l) => l.id === selectedLead.id);
        if (updated) setSelectedLead(updated);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, priorityFilter, sourceFilter]);

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormSource('Website Inquiry');
    setFormBusinessType('Professional Services');
    setFormStatus('New');
    setFormPriority('Medium');
    setFormNotes('');
    setFormFollowUp(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setFormName(lead.name);
    setFormEmail(lead.email);
    setFormPhone(lead.phone || '');
    setFormCompany(lead.company || '');
    setFormSource(lead.source);
    setFormBusinessType(lead.businessType);
    setFormStatus(lead.status);
    setFormPriority(lead.priority);
    setFormNotes(lead.notes || '');
    setFormFollowUp(lead.nextFollowUp || '');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Lead name is required.');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('A valid business email address is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditModalOpen && selectedLead) {
        const res = await api.updateLead(selectedLead.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          source: formSource,
          businessType: formBusinessType,
          status: formStatus,
          priority: formPriority,
          notes: formNotes.trim(),
          nextFollowUp: formFollowUp,
        });
        setSelectedLead(res.lead);
        setIsEditModalOpen(false);
      } else {
        await api.createLead({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          company: formCompany.trim(),
          source: formSource,
          businessType: formBusinessType,
          status: formStatus,
          priority: formPriority,
          notes: formNotes.trim(),
          nextFollowUp: formFollowUp,
        });
        setIsAddModalOpen(false);
      }
      fetchLeads();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setFormError(err.message || 'Error saving lead');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;
    try {
      await api.deleteLead(leadToDelete.id);
      if (selectedLead?.id === leadToDelete.id) {
        setSelectedLead(null);
      }
      setLeadToDelete(null);
      fetchLeads();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Delete lead failed:', err);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await api.updateLead(leadId, { status: newStatus });
      if (selectedLead?.id === leadId) {
        setSelectedLead(res.lead);
      }
      fetchLeads();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleTriggerAiSummarizer = async (leadId: string) => {
    setIsSummarizing(true);
    setSummarizeResult(null);
    try {
      const res = await api.summarizeLead(leadId);
      setSummarizeResult({ summary: res.summary, isAi: res.isAi });
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => (prev ? { ...prev, aiSummary: res.summary } : null));
      }
      fetchLeads();
    } catch (err) {
      console.error('AI summary failed:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Smart Lead Management & CRM</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Structured acquisition pipeline with automated validation and follow-up generation.
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-600/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, email, company, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="New">Status: New</option>
            <option value="Contacted">Status: Contacted</option>
            <option value="Qualified">Status: Qualified</option>
            <option value="Proposal Sent">Status: Proposal Sent</option>
            <option value="Won">Status: Won</option>
            <option value="Lost">Status: Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">Priority: High</option>
            <option value="Medium">Priority: Medium</option>
            <option value="Low">Priority: Low</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="Website Inquiry">Website Inquiry</option>
            <option value="Direct Contact">Direct Contact</option>
            <option value="Shopify Store">Shopify Store</option>
            <option value="Referral">Referral</option>
            <option value="Inbound Campaign">Inbound Campaign</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Data Table and Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leads Table */}
        <div className={`${selectedLead ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Company & Type</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Follow-up</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Loading database records...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="max-w-sm mx-auto space-y-2">
                          <p className="font-semibold text-slate-300">No matching leads found</p>
                          <p className="text-xs text-slate-500">
                            Try adjusting your filters or create a new lead entry.
                          </p>
                          <button
                            onClick={openAddModal}
                            className="mt-3 px-3 py-1.5 text-xs text-blue-400 hover:text-white bg-blue-600/20 hover:bg-blue-600 rounded transition-colors"
                          >
                            + Create First Lead
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-800/60 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          {/* Contact */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{lead.name}</div>
                            <div className="text-slate-400 text-[11px] font-mono">{lead.email}</div>
                          </td>

                          {/* Company & Type */}
                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{lead.company || '—'}</div>
                            <div className="text-slate-500 text-[11px]">{lead.businessType}</div>
                          </td>

                          {/* Source */}
                          <td className="py-3.5 px-4 text-slate-400">
                            <span>{lead.source}</span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-medium ${
                                lead.status === 'Won'
                                  ? 'text-emerald-400'
                                  : lead.status === 'Lost'
                                  ? 'text-rose-400'
                                  : lead.status === 'Qualified'
                                  ? 'text-blue-400'
                                  : lead.status === 'Proposal Sent'
                                  ? 'text-indigo-400'
                                  : lead.status === 'Contacted'
                                  ? 'text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-semibold ${
                                lead.priority === 'High'
                                  ? 'text-rose-400'
                                  : lead.priority === 'Medium'
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </td>

                          {/* Follow-up */}
                          <td className="py-3.5 px-4 text-slate-300 font-mono tabular-nums">
                            {lead.nextFollowUp || 'None'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(lead)}
                                title="Edit Lead"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setLeadToDelete(lead)}
                                title="Delete Lead"
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Showing {leads.length} records</span>
              <span>Click any row to open lead profile and AI summarizer</span>
            </div>
          </div>
        </div>

        {/* Selected Lead Details Drawer */}
        {selectedLead && (
          <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedLead.name}</h3>
                  <span className="text-xs text-slate-400">· {selectedLead.priority} Priority</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{selectedLead.company || 'Private Lead'}</div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Pipeline Status
              </label>
              <div className="flex flex-wrap gap-1">
                {(['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'] as LeadStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        selectedLead.status === st
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-mono">{selectedLead.email}</span>
              </div>
              {selectedLead.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{selectedLead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400">
                <Building className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Sector: {selectedLead.businessType}</span>
                <span aria-hidden="true">·</span>
                <span>Source: {selectedLead.source}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Next Follow-up: </span>
                <span className="text-white font-mono">{selectedLead.nextFollowUp || 'Not set'}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Client Requirements & Notes
              </label>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed min-h-[60px]">
                {selectedLead.notes || 'No notes provided yet.'}
              </div>
            </div>

            {/* AI Intelligence / Summarizer */}
            <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>AI Lead Intelligence</span>
                </div>
                <button
                  onClick={() => handleTriggerAiSummarizer(selectedLead.id)}
                  disabled={isSummarizing}
                  className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50"
                >
                  {isSummarizing ? 'Analyzing...' : 'Summarize Lead'}
                </button>
              </div>

              {selectedLead.aiSummary ? (
                <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded border border-blue-900/40">
                  {selectedLead.aiSummary}
                  <div className="text-[10px] text-blue-400 mt-2">
                    Verified automation recommendation generated server-side.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click "Summarize Lead" to analyze the client's business sector, requirements, and extract recommended workflow actions.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => openEditModal(selectedLead)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
              >
                Edit Complete Lead Details
              </button>
              <button
                onClick={() => setLeadToDelete(selectedLead)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Delete Lead Record
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Lead Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {isEditModalOpen ? 'Edit Lead Details' : 'Add New Inbound Lead'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveLead} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Jordan Reed"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jordan@company.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Acme Global Inc"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Source
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Website Inquiry">Website Inquiry</option>
                    <option value="Direct Contact">Direct Contact</option>
                    <option value="Shopify Store">Shopify Store</option>
                    <option value="Referral">Referral</option>
                    <option value="Inbound Campaign">Inbound Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Business Type
                  </label>
                  <select
                    value={formBusinessType}
                    onChange={(e) => setFormBusinessType(e.target.value as BusinessType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="E-commerce">E-commerce</option>
                    <option value="Digital Agency">Digital Agency</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="SaaS / Tech">SaaS / Tech</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Lead Discovery Notes
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes on client requirements, tech stack, pain points..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Confirm Lead Deletion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">{leadToDelete.name}</span> ({leadToDelete.email})? This action will remove the record from the database ledger.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
