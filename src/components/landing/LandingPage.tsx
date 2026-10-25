import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Bot,
  Zap,
  ShoppingBag,
  BarChart3,
  ListTodo,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Workflow,
  Clock,
  Database,
  Sliders,
} from 'lucide-react';
import { api } from '../../api/client';

interface LandingPageProps {
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDemo }) => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryBusinessType, setInquiryBusinessType] = useState('E-commerce');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      setSubmitError('Please provide your name and a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitInquiry({
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        businessType: inquiryBusinessType,
        message: inquiryMessage,
      });

      setSubmitSuccess(res.message);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-5 single-line links) - Zone 3 (1 primary CTA) */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Future Rank Studio
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollToSection('problem-solution')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Why Automation
            </button>
            <button
              onClick={() => scrollToSection('core-features')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Core Capabilities
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('use-cases')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollToSection('contact-inquiry')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Contact Studio
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onExploreDemo}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap shrink-0"
            >
              <span>Explore Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-400 mb-4 tracking-wide uppercase">
              <span>Intelligent Business Workflow Infrastructure</span>
              <span aria-hidden="true">·</span>
              <span>By Future Rank Studio</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.12] text-balance">
              Automate Your Business. Focus on Growth.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Manage leads, streamline customer support, and connect repetitive business tasks in one intelligent workspace.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onExploreDemo}
                className="px-7 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-xl shadow-blue-600/30 inline-flex items-center gap-2"
              >
                <span>Explore Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Product Dashboard Preview with Fallback */}
          <div className="relative mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-black/80 overflow-hidden">
            <div className="h-10 border-b border-slate-800/80 bg-slate-950/80 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-500 font-mono ml-2">app.futurerankstudio.com / enterprise-workspace</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Base44 Engine</span>
                <span aria-hidden="true">·</span>
                <span>Active Sync</span>
              </div>
            </div>

            <div className="relative aspect-video max-h-[580px] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src="/src/assets/images/hero_automation_workspace_1792834018934.jpg"
                alt="Smart Business AI Automation System Interface Preview"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Fallback Overlay if image is loading or hidden */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Full-Stack Business Automation Architecture</div>
                    <div className="text-xs text-slate-400">Leads CRM · Support Triage · Multi-Step Webhooks · E-commerce Sync</div>
                  </div>
                </div>
                <button
                  onClick={onExploreDemo}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                >
                  Open Interactive Workspace
                </button>
              </div>
            </div>
          </div>

          {/* 3 Core Value Pillars Strip */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Save Time on Repetitive Tasks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Eliminate manual copy-pasting between spreadsheets, contact forms, and email clients with automated triage and task dispatch.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Organize Leads & Inquiries</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Centralize every customer touchpoint with transparent classification, due dates, priority tiers, and zero lost follow-ups.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Trackable Workflows</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Build and monitor clear, audited automation sequences with real execution logs, error visibility, and manual test execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section id="problem-solution" className="py-20 border-t border-slate-800/70 bg-[#0d1322]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Operational Bottlenecks</div>
            <h2 className="text-3xl font-bold text-white mb-4">Stop Losing Inquiries Between Tabs and Tools</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Growing companies lose hours every week manually checking form submissions, drafting repetitive emails, and guessing which lead needs attention next.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Fragmented Reality */}
            <div className="p-8 rounded-xl bg-rose-950/20 border border-rose-900/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-3">The Fragmented Approach</div>
                <h3 className="text-xl font-semibold text-white mb-4">Disjointed Tools & Missed Opportunities</h3>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Website inquiries sit in inbox spam folders or unread notifications for days.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Spreadsheets quickly fall out of sync with actual client interactions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Customer support answers identical policy and pricing questions manually.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>No audit trail or execution history when an integration silently breaks.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-rose-900/40 text-xs text-rose-300/80">
                Result: Delayed responses, team exhaustion, and missed high-intent contracts.
              </div>
            </div>

            {/* The Smart Automation Workspace */}
            <div className="p-8 rounded-xl bg-blue-950/20 border border-blue-800/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">The Future Rank Solution</div>
                <h3 className="text-xl font-semibold text-white mb-4">One Centralized, Intelligent Workspace</h3>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Instant ingestion: Inquiries automatically create CRM records and due tasks.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>AI-assisted replies grounded strictly in verified business documentation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Visual workflows with test run execution and step-by-step logs.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Real-time status indicators and error boundary isolation.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-blue-900/40 text-xs text-blue-300/80">
                Result: Reliable follow-ups within minutes and complete visibility across all business workflows.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="core-features" className="py-20 border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Engineered Modules</div>
            <h2 className="text-3xl font-bold text-white mb-4">Six Essential Pillars for Modern Operations</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Each module is built with practical utility, database persistence, and transparent configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Smart Lead Management</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Structured CRM with custom source tagging, status filters, priority tiers, notes, and AI-powered intent summarization.
              </p>
              <div className="text-xs text-slate-500">Includes auto follow-up scheduling</div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">AI-Assisted Customer Support</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Grounded support copilot powered by Local Demo Engine. Generates accurate drafts from your knowledge base with human review prior to sending.
              </p>
              <div className="text-xs text-slate-500">Human handoff controls built-in</div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 text-violet-400 flex items-center justify-center mb-4">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Visual Workflow Automation</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Step-based workflow designer. Configure triggers, data validation, database persistence, and external notifications with live test execution.
              </p>
              <div className="text-xs text-slate-500">Audit logs & step duration metrics</div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">E-commerce Operations</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Order overview, status dispatching, customer inquiry association, and automated inventory threshold alert monitors.
              </p>
              <div className="text-xs text-slate-500">Shopify & WooCommerce ready</div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-600/10 text-amber-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Business Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Clean visual metrics calculated strictly from stored database records: lead sources, conversion pipeline, and automation reliability rates.
              </p>
              <div className="text-xs text-slate-500">One-click CSV exports</div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-sky-600/10 text-sky-400 flex items-center justify-center mb-4">
                <ListTodo className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Task & Follow-up Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Operational task queue linked to leads and orders. Overdue status flags, assignee tracking, and completion audit trails.
              </p>
              <div className="text-xs text-slate-500">Zero dead clicks or mock stubs</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-slate-800/70 bg-[#0d1322]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Operational Blueprint</div>
            <h2 className="text-3xl font-bold text-white mb-4">How Business Automation Operates</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A 4-step structured lifecycle that ensures consistency, data integrity, and human oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="text-3xl font-bold text-blue-500/30 mb-3 font-mono">01</div>
              <h3 className="text-base font-semibold text-white mb-2">Capture Information</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive inquiries, orders, and tickets via secure webhook endpoints, contact forms, or direct CRM entry.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="text-3xl font-bold text-indigo-500/30 mb-3 font-mono">02</div>
              <h3 className="text-base font-semibold text-white mb-2">Organize in Workspace</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Data is validated, stored in relational tables, and tagged with priority, business category, and due dates.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="text-3xl font-bold text-violet-500/30 mb-3 font-mono">03</div>
              <h3 className="text-base font-semibold text-white mb-2">Apply Rules & AI</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Workflows run validation checks, prepare grounded reply drafts, and create immediate follow-up tasks.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 relative">
              <div className="text-3xl font-bold text-emerald-500/30 mb-3 font-mono">04</div>
              <h3 className="text-base font-semibold text-white mb-2">Review & Execute</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your team reviews suggested actions, inspects execution run logs, and completes outreach with full context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Use Cases */}
      <section id="use-cases" className="py-20 border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Domain Applications</div>
            <h2 className="text-3xl font-bold text-white mb-4">Tailored for High-Volume Business Scenarios</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Online Stores</div>
              <h3 className="text-base font-semibold text-white mb-2">E-commerce Brands</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Triage order status inquiries, monitor inventory replenishment thresholds, and automate post-purchase follow-up task sequences.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-xs font-semibold text-indigo-400 uppercase mb-2">Digital Agencies</div>
              <h3 className="text-base font-semibold text-white mb-2">Marketing Agencies</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Route multi-client campaign leads through unified webhooks, qualify company interest, and dispatch alerts to project managers.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-xs font-semibold text-violet-400 uppercase mb-2">Service Firms</div>
              <h3 className="text-base font-semibold text-white mb-2">Professional Services</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automate appointment intake forms, categorize consultation requirements, and prepare personalized response briefs.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-xs font-semibold text-emerald-400 uppercase mb-2">Growing Companies</div>
              <h3 className="text-base font-semibold text-white mb-2">Small Businesses</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Keep small teams coordinated without hiring full-time coordinators by establishing reliable, trackable operational workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Section */}
      <section className="py-16 border-t border-slate-800/70 bg-[#0d1322]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Transparent Engineering Standards</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Data Privacy, Permission Separation & Honest Telemetry</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                This system operates on strict engineering boundaries: server-side secret management with zero frontend API key leakage, real database records rather than fabricated metrics, and explicit labels on sample vs verified integrations.
              </p>
            </div>
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-lg shadow-blue-600/20"
            >
              Test Live Features Now
            </button>
          </div>
        </div>
      </section>

      {/* Contact & Working Inquiry Form Section */}
      <section id="contact-inquiry" className="py-24 border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Future Rank Studio Info Card */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500/40 bg-slate-800 shrink-0">
                  <img
                    src="/src/assets/images/avatar_business_architect_1792834018290.jpg"
                    alt="Future Rank Studio Senior Consultant"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Future Rank Studio</h3>
                  <p className="text-xs text-blue-400 font-medium">Bespoke Software & AI Automation Architecture</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 mb-8">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Our Core Services</span>
                  <p className="text-sm font-medium text-slate-200">
                    Full-Stack Web Development · AI Apps & Chatbots · AI Automation · UI/UX Design · Landing Pages
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Direct Email</span>
                  <a
                    href="mailto:futurerankstudio@gmail.com"
                    className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    futurerankstudio@gmail.com
                  </a>
                </div>

                <div className="pt-2">
                  <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">Direct WhatsApp Support</span>
                  <a
                    href="https://wa.me/923217507345"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>+92 321 7507345</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                Submitting this form triggers the real <span className="text-blue-400 font-medium">New Lead Follow-up Engine</span> workflow in the demo dashboard so you can observe live system ingestion.
              </div>
            </div>

            {/* Working Public Inquiry Form */}
            <div className="lg:col-span-7 p-8 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Request an Automation Consultation</h3>
                <p className="text-sm text-slate-400">
                  Fill in your details below to test live lead ingestion and workflow automation in real time.
                </p>
              </div>

              {submitSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{submitSuccess}</div>
                    <div className="text-xs text-emerald-400 mt-1">
                      Click "Explore Live Demo" above to see your lead and executed workflow inside the CRM!
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitInquiry} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Jordan Smith"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="jordan@company.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Business Model
                    </label>
                    <select
                      value={inquiryBusinessType}
                      onChange={(e) => setInquiryBusinessType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="E-commerce">E-commerce / Retail</option>
                      <option value="Digital Agency">Digital Marketing Agency</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="SaaS / Tech">SaaS / Technology</option>
                      <option value="Small Business">Local / Small Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    What business process would you like to automate?
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe your current manual bottlenecks (e.g., customer inquiry replies, Shopify stock sync, lead follow-up)..."
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  {isSubmitting ? (
                    <span>Processing Pipeline...</span>
                  ) : (
                    <>
                      <span>Submit Inquiry & Trigger Automation</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">Future Rank Studio</span>
            <span aria-hidden="true">·</span>
            <span>Smart Business AI Automation System</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="mailto:futurerankstudio@gmail.com" className="hover:text-slate-300 transition-colors">
              futurerankstudio@gmail.com
            </a>
            <a
              href="https://wa.me/923217507345"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              WhatsApp: +92 321 7507345
            </a>
          </div>

          <div>
            <span>© 2026 Future Rank Studio. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
