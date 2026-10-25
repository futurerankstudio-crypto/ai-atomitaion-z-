import React, { useState, useEffect } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Play,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Key,
  Server,
  X,
} from 'lucide-react';
import { IntegrationItem } from '../../types';
import { api } from '../../api/client';

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<{ success: boolean; message: string } | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegrations();
      setIntegrations(res.integrations);

      if (selectedIntegration) {
        const updated = res.integrations.find((i) => i.id === selectedIntegration.id);
        if (updated) setSelectedIntegration(updated);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const openConfigModal = (integ: IntegrationItem) => {
    setSelectedIntegration(integ);
    setFormValues(integ.values || {});
    setTestResponse(null);
  };

  const handleTestConnection = async (integId: string, valuesToTest?: Record<string, string>) => {
    setTestingId(integId);
    setTestResponse(null);

    try {
      const res = await api.testIntegration(integId, valuesToTest || formValues);
      setTestResponse({ success: true, message: res.message });
      fetchIntegrations();
    } catch (err: any) {
      setTestResponse({ success: false, message: err.message || 'Connection test failed.' });
      fetchIntegrations();
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Integrations Center</h2>
        <div className="text-xs text-slate-400 mt-0.5">
          Connect third-party webhook gateways, e-commerce engines, and AI providers with strict verification.
        </div>
      </div>

      {/* Honest Status Policy Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong className="text-white font-semibold">Verification Guarantee:</strong> Integrations never show connected status until credentials, handshake ping, and payload verification succeed.
          </span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">
            Loading integration manifests...
          </div>
        ) : (
          integrations.map((integ) => {
            const isConnected = integ.status === 'Connected';
            const isError = integ.status === 'Error';
            const isTesting = testingId === integ.id;

            return (
              <div
                key={integ.id}
                className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">{integ.name}</h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{integ.category}</div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isConnected
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          : isError
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {integ.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[38px]">
                    {integ.description}
                  </p>

                  {integ.lastTested && (
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Last tested: {new Date(integ.lastTested).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {integ.lastErrorMessage && (
                    <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 text-[11px] text-rose-300 leading-tight">
                      {integ.lastErrorMessage}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => openConfigModal(integ)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Configure
                  </button>

                  <button
                    onClick={() => handleTestConnection(integ.id, integ.values)}
                    disabled={isTesting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-blue-400' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Integration Setup & Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedIntegration.name} Setup</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedIntegration.category}</p>
              </div>
              <button onClick={() => setSelectedIntegration(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {testResponse && (
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed ${
                  testResponse.success
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}
              >
                {testResponse.message}
              </div>
            )}

            {/* Step-by-Step Setup Instructions */}
            <div className="space-y-2 p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Setup Instructions
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedIntegration.setupInstructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-mono text-[11px]">0{idx + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Config Fields Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTestConnection(selectedIntegration.id, formValues);
              }}
              className="space-y-4"
            >
              {selectedIntegration.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={formValues[field.key] || ''}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testingId === selectedIntegration.id}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {testingId === selectedIntegration.id ? 'Verifying...' : 'Save & Test Handshake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
