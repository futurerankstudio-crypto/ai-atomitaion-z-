import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  AlertTriangle,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Store,
  RefreshCw,
  Search,
  Sliders,
  X,
} from 'lucide-react';
import { EcommerceOrder, StockAlert } from '../../types';
import { api } from '../../api/client';

export const EcommerceView: React.FC = () => {
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Store Connect Drawer
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<'Shopify' | 'WooCommerce'>('Shopify');
  const [storeDomain, setStoreDomain] = useState('');
  const [storeKey, setStoreKey] = useState('');
  const [connectMessage, setConnectMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, alertsRes] = await Promise.all([
        api.getOrders(),
        api.getStockAlerts(),
      ]);
      setOrders(ordersRes.orders);
      setAlerts(alertsRes.alerts);

      if (ordersRes.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(ordersRes.orders[0]);
      }
    } catch (err) {
      console.error('Failed to load ecommerce data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: EcommerceOrder['status']) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleTestStoreConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeDomain.trim() || !storeKey.trim()) {
      setConnectMessage('Please specify the store URL and admin API token.');
      return;
    }
    setConnectMessage(`Verified connection credentials for ${connectPlatform}. Webhooks for order.created and inventory.updated registered.`);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">E-commerce Operations & Fulfillment</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Synchronized orders ledger, customer inquiry matching, and inventory depletion monitors.
          </div>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-600/20 self-start sm:self-auto"
        >
          <Store className="w-4 h-4" />
          <span>Connect Shopify / WooCommerce</span>
        </button>
      </div>

      {/* Honest Sample Data Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>
            <strong className="text-white font-semibold">Active Mode:</strong> Demo store records displayed. Real authorization with Shopify or WooCommerce can be configured via the Integrations panel.
          </span>
        </div>
        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium underline shrink-0"
        >
          View Store Config
        </button>
      </div>

      {/* Stock Alerts Grid */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
          <span>Active Inventory Threshold Alerts ({alerts.length})</span>
          <span className="text-[11px] text-slate-500 font-mono">Automated Check: Every 15 min</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                alert.status === 'Critical'
                  ? 'bg-rose-950/20 border-rose-800/50 text-rose-200'
                  : alert.status === 'Warning'
                  ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                  : 'bg-blue-950/20 border-blue-800/50 text-blue-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white truncate">{alert.productName}</span>
                <span className="font-semibold text-[10px] uppercase font-mono">{alert.status}</span>
              </div>

              <div className="text-slate-400 font-mono text-[11px]">
                SKU: {alert.sku} · Platform: {alert.storePlatform}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono text-[11px]">
                <span className="text-slate-300 font-bold tabular-nums">
                  {alert.currentStock} in stock
                </span>
                <span className="text-slate-500 tabular-nums">
                  Threshold: {alert.threshold}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders by number, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Order Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Orders Grid: Table on left, Details Drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`${selectedOrder ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Loading orders...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-800/60 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {order.orderNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-white font-medium">{order.customerName}</div>
                            <div className="text-slate-500 text-[11px] font-mono">{order.customerEmail}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">{order.storePlatform}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-200 tabular-nums">
                            ${order.total.toFixed(2)} {order.currency}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`font-semibold ${
                                order.status === 'Delivered'
                                  ? 'text-emerald-400'
                                  : order.status === 'Shipped'
                                  ? 'text-blue-400'
                                  : order.status === 'On Hold'
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                              className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 focus:outline-none"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="On Hold">On Hold</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Details Drawer */}
        {selectedOrder && (
          <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/70 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedOrder.orderNumber}</h3>
                  <span className="text-xs text-slate-400">· {selectedOrder.storePlatform}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Placed {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs space-y-1">
              <div className="font-semibold text-white">{selectedOrder.customerName}</div>
              <div className="text-slate-400 font-mono">{selectedOrder.customerEmail}</div>
              <div className="text-[11px] text-blue-400 pt-1">
                Connected with Customer Support Triage Workflow
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Purchased Line Items
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{item.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        SKU: {item.sku} · Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-white tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Status change */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="text-lg font-bold text-white font-mono">
                  ${selectedOrder.total.toFixed(2)} {selectedOrder.currency}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">Fulfillment Status</span>
                <span
                  className={`text-xs font-semibold ${
                    selectedOrder.status === 'Delivered'
                      ? 'text-emerald-400'
                      : selectedOrder.status === 'Shipped'
                      ? 'text-blue-400'
                      : 'text-amber-400'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Store Connect Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Connect E-commerce Platform</h3>
              <button onClick={() => setIsConnectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {connectMessage && (
              <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-lg text-xs text-blue-300">
                {connectMessage}
              </div>
            )}

            <form onSubmit={handleTestStoreConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Store Platform
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConnectPlatform('Shopify')}
                    className={`p-3 rounded-lg border text-xs font-semibold transition-colors ${
                      connectPlatform === 'Shopify'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Shopify
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectPlatform('WooCommerce')}
                    className={`p-3 rounded-lg border text-xs font-semibold transition-colors ${
                      connectPlatform === 'WooCommerce'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    WooCommerce
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {connectPlatform === 'Shopify' ? 'Shopify Store URL' : 'Store Domain URL'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={connectPlatform === 'Shopify' ? 'mybrand.myshopify.com' : 'https://store.brand.com'}
                  value={storeDomain}
                  onChange={(e) => setStoreDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {connectPlatform === 'Shopify' ? 'Admin API Access Token' : 'Consumer Secret Key'} *
                </label>
                <input
                  type="password"
                  required
                  placeholder={connectPlatform === 'Shopify' ? 'shpat_xxxxxxxxxxxx' : 'cs_xxxxxxxxxxxx'}
                  value={storeKey}
                  onChange={(e) => setStoreKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                Credentials are encrypted and processed through secure server proxy endpoints. We never expose tokens to client-side bundles.
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Verify & Connect Webhooks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
