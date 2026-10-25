import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Server,
  RotateCcw,
  ExternalLink,
  Mail,
  MessageCircle,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { SystemHealth } from '../../types';
import { api } from '../../api/client';

export const SettingsView: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.error('Failed to get health:', err))
      .finally(() => setLoadingHealth(false));
  }, []);

  const handleResetData = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      const res = await api.resetDemoData();
      setResetMessage('Demo records restored to baseline initial seed.');
      setShowConfirmReset(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setResetMessage(`Reset error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System & Workspace Settings</h2>
        <div className="text-xs text-slate-400 mt-0.5">
          Environment runtime configuration, API proxy isolation, and developer studio details.
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800 text-blue-200 text-xs">
          {resetMessage}
        </div>
      )}

      {/* Studio Identity Card */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Future Rank Studio</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Creator & Engineering Architect of Smart Business AI Automation System
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
            Version 2026.4 · Client Preview
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Direct Contact
            </span>
            <div className="flex items-center gap-2 text-slate-200">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <a href="mailto:futurerankstudio@gmail.com" className="hover:text-blue-400 transition-colors font-medium">
                futurerankstudio@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <a
                href="https://wa.me/923217507345"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors font-medium"
              >
                +92 321 7507345 (WhatsApp)
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Offered Engineering Services
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Full-Stack Web Development · AI Apps & Chatbots · AI Automation · UI/UX Design · Landing Pages
            </p>
          </div>
        </div>
      </div>

      {/* System Security & Model Runtime */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Runtime Security & AI Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] uppercase font-semibold">AI Model</div>
            <div className="font-mono text-white font-bold text-sm">
              {health?.aiModel || 'local-demo-engine'}
            </div>
            <div className="text-[11px] text-emerald-400 pt-1">
              {health?.aiConnected ? 'Live Model Initialized' : 'Fallback Engine Ready'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] uppercase font-semibold">Key Handling Policy</div>
            <div className="font-mono text-white font-bold text-sm">Server-Only Proxy</div>
            <div className="text-[11px] text-slate-400 pt-1">Zero client-side secrets</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] uppercase font-semibold">Data Isolation</div>
            <div className="font-mono text-white font-bold text-sm">Workspace Scoped</div>
            <div className="text-[11px] text-blue-400 pt-1">Private client ledger</div>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset Demo Data */}
      <div className="p-6 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-4">
        <div>
          <h3 className="text-base font-bold text-rose-200">Reset Demo Database</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Restore sample leads, mock e-commerce transactions, and workflow execution history to the initial factory baseline.
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Sample Records</span>
          </button>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Reset Demo Database?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will reseed all leads, tasks, support tickets, and workflow execution counters with clean demonstration records.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                disabled={isResetting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                {isResetting ? 'Restoring...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
