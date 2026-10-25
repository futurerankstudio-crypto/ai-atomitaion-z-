import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Bot,
  Send,
  UserCheck,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { SupportConversation, SupportMessage, PriorityLevel } from '../../types';
import { api } from '../../api/client';

export const SupportView: React.FC = () => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<SupportConversation | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Agent message box
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // AI Generation State
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [aiMetadata, setAiMetadata] = useState<{ modelUsed: string; isAiGrounded: boolean; message?: string } | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.getSupportConversations({
        search,
        status: statusFilter,
        category: categoryFilter,
      });
      setConversations(res.conversations);

      if (res.conversations.length > 0) {
        if (!selectedConv) {
          setSelectedConv(res.conversations[0]);
        } else {
          const updated = res.conversations.find((c) => c.id === selectedConv.id);
          if (updated) setSelectedConv(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [search, statusFilter, categoryFilter]);

  const handleSelectConversation = (conv: SupportConversation) => {
    setSelectedConv(conv);
    setAiDraft(null);
    setAiMetadata(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim()) return;

    setIsSending(true);
    try {
      await api.sendSupportMessage(selectedConv.id, replyText.trim(), 'Support Specialist');
      setReplyText('');
      setAiDraft(null);
      fetchConversations();
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateAiReply = async () => {
    if (!selectedConv) return;
    setIsGeneratingAi(true);
    try {
      const lastCustMessage = selectedConv.messages
        .slice()
        .reverse()
        .find((m) => m.sender === 'customer')?.text;

      const res = await api.generateAiReply(selectedConv.id, lastCustMessage);
      setAiDraft(res.reply);
      setAiMetadata({
        modelUsed: res.modelUsed,
        isAiGrounded: res.isAiGrounded,
        message: res.message,
      });
    } catch (err) {
      console.error('AI reply error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleUseAiDraft = () => {
    if (aiDraft) {
      setReplyText(aiDraft);
    }
  };

  const handleToggleHumanHandoff = async () => {
    if (!selectedConv) return;
    try {
      const newStatus = !selectedConv.humanHandoff;
      await api.updateConversation(selectedConv.id, {
        humanHandoff: newStatus,
        status: newStatus ? 'Escalated' : 'In Progress',
      });
      fetchConversations();
    } catch (err) {
      console.error('Toggle handoff error:', err);
    }
  };

  const handleUpdateStatus = async (status: SupportConversation['status']) => {
    if (!selectedConv) return;
    try {
      await api.updateConversation(selectedConv.id, { status });
      fetchConversations();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI-Assisted Customer Support Workspace</h2>
        <div className="text-xs text-slate-400 mt-0.5">
          Grounded reply drafts with strict knowledge-base boundaries and explicit human approval controls.
        </div>
      </div>

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-210px)] min-h-[640px]">
        {/* Left Pane: Ticket / Conversation Queue (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket subject, customer, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Presales">Presales</option>
                <option value="Billing">Billing</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading conversation queue...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No support conversations matching the current filter criteria.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1];

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer text-xs space-y-1.5 ${
                      isSelected ? 'bg-slate-800/70 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">{conv.customerName}</span>
                      <span
                        className={`text-[10px] font-semibold shrink-0 ${
                          conv.status === 'Escalated'
                            ? 'text-rose-400'
                            : conv.status === 'Open'
                            ? 'text-amber-400'
                            : conv.status === 'Resolved'
                            ? 'text-emerald-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {conv.status}
                      </span>
                    </div>

                    <div className="text-slate-300 font-medium line-clamp-1">{conv.subject}</div>

                    <div className="text-slate-400 line-clamp-1 text-[11px]">
                      {lastMsg ? lastMsg.text : 'No messages'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{conv.category} · {conv.channel}</span>
                      {conv.humanHandoff && (
                        <span className="text-rose-400 font-medium">Human Handoff Active</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation Thread & AI Assistant (7 cols) */}
        {selectedConv ? (
          <div className="lg:col-span-7 h-full flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{selectedConv.subject}</h3>
                  <span className="text-xs text-slate-400">· {selectedConv.category}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedConv.customerName} ({selectedConv.customerEmail}) · {selectedConv.channel}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleHumanHandoff}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedConv.humanHandoff
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {selectedConv.humanHandoff ? 'Handoff Active' : 'Request Human'}
                </button>

                <select
                  value={selectedConv.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as SupportConversation['status'])}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
              {selectedConv.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div className="text-[10px] text-slate-500 mb-1 px-1">
                      {msg.senderName} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                        isCustomer
                          ? 'bg-slate-800 text-slate-100 border border-slate-700/60'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Suggested Reply Panel */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>AI Grounded Assistant</span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiReply}
                  disabled={isGeneratingAi}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Generating Grounded Draft...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Draft Grounded Reply</span>
                    </>
                  )}
                </button>
              </div>

              {aiDraft && (
                <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-900/60 space-y-2 text-xs">
                  <div className="text-slate-200 leading-relaxed font-sans">{aiDraft}</div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-blue-900/40 text-[10px] text-blue-400">
                    <span>
                      Engine: {aiMetadata?.modelUsed || 'Local Demo Engine'} · Human review required before dispatch
                    </span>
                    <button
                      type="button"
                      onClick={handleUseAiDraft}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                    >
                      Use in Reply Box
                    </button>
                  </div>
                </div>
              )}

              {/* Message Reply Input */}
              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Review, edit, and formulate your response to the customer..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Messages are delivered safely through verified channels.
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-blue-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 h-full flex items-center justify-center p-8 rounded-xl border border-slate-800 bg-slate-900/40 text-center text-slate-400 text-xs">
            Select a support conversation from the list to view inquiry details and AI suggestions.
          </div>
        )}
      </div>
    </div>
  );
};
