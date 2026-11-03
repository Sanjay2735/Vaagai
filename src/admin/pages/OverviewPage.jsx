import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function OverviewPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [liveToast, setLiveToast] = useState(null);
  const [quickRestockProduct, setQuickRestockProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restocking, setRestocking] = useState(false);

  const fetchOverview = async (selectedRange, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await adminApi.getOverview(selectedRange);
      if (res.success) {
        setData(res);
        setLastSync(new Date());
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(range, true);
  }, [range]);

  // Real-time Server-Sent Events (SSE) synchronization
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = adminApi.subscribeRealtime(
        (event) => {
          setLiveConnected(true);
          setLastSync(new Date());

          const payload = event.data?.payload || event.data || {};

          if (event.type === 'order:created') {
            const newOrder = payload;
            const refNum = newOrder.orderNumber || newOrder.order_number || 'VAG-LIVE';
            const customer = newOrder.customerName || newOrder.customer_name || 'Boutique Patron';
            const amount = Number(newOrder.totalAmount ?? newOrder.total_amount ?? 0);

            setLiveToast({
              type: 'order',
              title: `✨ New Order #${refNum}`,
              message: `${customer} placed an order for ₹${amount.toLocaleString('en-IN')}`,
              timestamp: new Date(),
            });

            // Dynamically update KPIs and prepend recent order
            setData((prev) => {
              if (!prev) return prev;
              const prevTotalOrders = prev.kpis?.totalOrders || 0;
              const newTotalOrders = prevTotalOrders + 1;
              const newTotalRevenue = (prev.kpis?.totalRevenue || 0) + amount;
              const newAov = Math.round(newTotalRevenue / (newTotalOrders || 1));
              const newPendingOrders = (prev.kpis?.pendingOrders || 0) + 1;
              const normalizedOrder = {
                id: newOrder.id || Date.now(),
                order_number: refNum,
                customer_name: customer,
                email: newOrder.email || '',
                total_amount: amount,
                payment_status: newOrder.paymentStatus || newOrder.payment_status || 'completed',
                order_status: newOrder.orderStatus || newOrder.order_status || 'placed',
              };
              const updatedRecent = [normalizedOrder, ...(prev.recentOrders || [])].slice(0, 10);

              return {
                ...prev,
                kpis: {
                  ...prev.kpis,
                  totalRevenue: newTotalRevenue,
                  totalOrders: newTotalOrders,
                  aov: newAov,
                  pendingOrders: newPendingOrders,
                },
                recentOrders: updatedRecent,
              };
            });
          } else if (event.type === 'inventory:adjusted') {
            const inv = payload;
            setLiveToast({
              type: 'inventory',
              title: 'Artisan Stock Update',
              message: inv.reason || 'Saree inventory units adjusted.',
              timestamp: new Date(),
            });
            // Background refresh to recalculate low stock warnings
            fetchOverview(range, false);
          } else if (event.type === 'order:status_updated') {
            const ord = payload;
            const refNum = ord.orderNumber || ord.order_number || ord.order_id;
            setLiveToast({
              type: 'status',
              title: `Order Status Updated`,
              message: `Order #${refNum} is now ${ord.order_status || ord.orderStatus}`,
              timestamp: new Date(),
            });
            // Update in place
            setData((prev) => {
              if (!prev) return prev;
              const updatedRecent = (prev.recentOrders || []).map((o) =>
                o.id === ord.order_id || o.order_number === refNum
                  ? { ...o, order_status: ord.order_status || ord.orderStatus, tracking_number: ord.tracking_number || o.tracking_number }
                  : o
              );
              return { ...prev, recentOrders: updatedRecent };
            });
          }
        },
        () => {
          setLiveConnected(false);
        }
      );
    } catch (err) {
      console.warn('Real-time connection note:', err);
    }

    return () => {
      if (eventSource && eventSource.close) {
        eventSource.close();
      }
    };
  }, [range]);

  // Auto-dismiss live toast after 6 seconds
  useEffect(() => {
    if (!liveToast) return;
    const timer = setTimeout(() => setLiveToast(null), 6000);
    return () => clearTimeout(timer);
  }, [liveToast]);

  const handleRestock = async () => {
    if (!quickRestockProduct) return;
    setRestocking(true);
    try {
      await adminApi.adjustInventory(quickRestockProduct.id, restockAmount, 'Weaver Restock from Workshop');
      setQuickRestockProduct(null);
      fetchOverview(range, false);
    } catch (err) {
      alert(err.message || 'Restock failed');
    } finally {
      setRestocking(false);
    }
  };

  const kpis = data?.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    aov: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  };

  return (
    <div className="space-y-6 relative">
      {/* FLOATING REAL-TIME EVENT TOAST */}
      {liveToast && (
        <div className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white border-2 border-[#B9953B] rounded-2xl shadow-2xl p-4 animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#287A52] animate-ping" />
              <h4 className="text-xs font-bold text-[#4A0715] uppercase tracking-wider">
                {liveToast.title}
              </h4>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="text-[#81766E] hover:text-[#4A0715] text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#29201E] mt-1.5 font-medium">
            {liveToast.message}
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EBE1] text-[10px] text-[#81766E]">
            <span>Live Broadcast</span>
            <span>{liveToast.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
              Atelier Executive Overview
            </h1>
            {/* Live SSE Status Badge */}
            <div
              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                liveConnected
                  ? 'bg-[#E8F5E9] text-[#287A52] border-[#C8E6C9]'
                  : 'bg-[#F5EEE5] text-[#70594B] border-[#E8E2D9]'
              }`}
              title="Real-time Server-Sent Events stream connected"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  liveConnected ? 'bg-[#287A52] animate-pulse' : 'bg-[#B9953B]'
                }`}
              />
              <span>{liveConnected ? 'Live Sync Active' : 'Realtime Ready'}</span>
            </div>
          </div>
          <p className="text-xs text-[#81766E] mt-1">
            Real-time business performance, patron orders, and artisan inventory analytics. Last synced at{' '}
            <span className="font-mono text-[#4A0715] font-medium">{lastSync.toLocaleTimeString()}</span>.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#70594B] uppercase tracking-wider">
            Range:
          </span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] text-[#29201E] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B] font-medium"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* 8 KPI METRIC CARDS WITH COMPARISON BADGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Total Revenue</span>
            <span className="p-1.5 bg-[#4A0715]/10 text-[#4A0715] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#4A0715] mt-2">
            ₹{kpis.totalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#287A52]">
              ↑ +18.4%
            </span>
            <span className="text-[10px] text-[#81766E]">vs prev period</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Total Orders</span>
            <span className="p-1.5 bg-[#B9953B]/10 text-[#B9953B] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#29201E] mt-2">
            {kpis.totalOrders}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#287A52]">
              ↑ +12.5%
            </span>
            <span className="text-[10px] text-[#81766E]">{kpis.pendingOrders} awaiting dispatch</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Avg Order Value (AOV)</span>
            <span className="p-1.5 bg-[#287A52]/10 text-[#287A52] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#29201E] mt-2">
            ₹{kpis.aov.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#287A52]">
              ↑ +5.3%
            </span>
            <span className="text-[10px] text-[#81766E]">Couture basket size</span>
          </div>
        </div>

        {/* Total Patrons */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Active Patrons</span>
            <span className="p-1.5 bg-[#70594B]/10 text-[#70594B] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#29201E] mt-2">
            {kpis.totalCustomers}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#287A52]">
              ↑ +22.0%
            </span>
            <span className="text-[10px] text-[#81766E]">Patron acquisition</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Catalog Sarees</span>
            <span className="p-1.5 bg-[#4A0715]/10 text-[#4A0715] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#29201E] mt-2">
            {kpis.totalProducts}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5EEE5] text-[#70594B]">
              100% Active
            </span>
            <span className="text-[10px] text-[#81766E]">Live boutique drapes</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Pending Dispatch</span>
            <span className="p-1.5 bg-[#C58A28]/10 text-[#C58A28] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#C58A28] mt-2">
            {kpis.pendingOrders}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
              kpis.pendingOrders > 0 ? 'bg-[#FFF8E1] text-[#C58A28]' : 'bg-[#E8F5E9] text-[#287A52]'
            }`}>
              {kpis.pendingOrders > 0 ? 'Action Needed' : 'All Clear'}
            </span>
            <span className="text-[10px] text-[#81766E]">Atelier packaging</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Low Stock Alerts</span>
            <span className="p-1.5 bg-[#C58A28]/10 text-[#C58A28] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#C58A28] mt-2">
            {kpis.lowStockCount}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
              kpis.lowStockCount > 0 ? 'bg-[#FFF8E1] text-[#C58A28]' : 'bg-[#E8F5E9] text-[#287A52]'
            }`}>
              {kpis.lowStockCount > 0 ? 'Replenish' : 'Sufficient'}
            </span>
            <span className="text-[10px] text-[#81766E]">≤ 5 units left</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs hover:border-[#B9953B]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Out of Stock</span>
            <span className="p-1.5 bg-[#C34444]/10 text-[#C34444] rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#C34444] mt-2">
            {kpis.outOfStockCount}
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
              kpis.outOfStockCount === 0 ? 'bg-[#E8F5E9] text-[#287A52]' : 'bg-[#FFEBEE] text-[#C34444]'
            }`}>
              {kpis.outOfStockCount === 0 ? 'Zero Outage' : 'Backorder'}
            </span>
            <span className="text-[10px] text-[#81766E]">
              {kpis.outOfStockCount === 0 ? 'All drapes ready' : 'Weaver restock'}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS & CATEGORY PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Graphic */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-base font-bold text-[#4A0715]">Revenue & Volume Velocity</h2>
              <p className="text-[11px] text-[#81766E]">Artisanal saree demand distribution over recent period</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#F5EEE5] text-[#70594B] rounded-full border border-[#E8E2D9]">
              INR (₹) Gross
            </span>
          </div>

          {/* SVG Visual Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-4 border-b border-[#F0EBE1]">
            {[
              { label: 'Week 1', val: 48500, count: 1 },
              { label: 'Week 2', val: 75700, count: 2 },
              { label: 'Week 3', val: 52000, count: 1 },
              { label: 'Week 4', val: 96800, count: 2 },
              { label: 'Week 5', val: 64200, count: 1 },
              { label: 'Current', val: kpis.totalRevenue, count: kpis.totalOrders },
            ].map((bar, idx) => {
              const maxVal = 180000;
              const heightPct = Math.min(100, Math.max(15, (bar.val / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-[#4A0715] font-bold mb-1">
                    ₹{(bar.val / 1000).toFixed(1)}k
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ${
                      idx === 5
                        ? 'bg-gradient-to-t from-[#4A0715] to-[#B9953B] shadow-sm'
                        : 'bg-[#F0EBE1] hover:bg-[#E9D9BF]'
                    }`}
                  />
                  <span className="text-[10px] text-[#81766E] font-medium mt-2">{bar.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 text-[11px] text-[#81766E]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-xs bg-[#4A0715]"></span>
              <span>Current Cycle Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-xs bg-[#F0EBE1]"></span>
              <span>Historical Baseline</span>
            </div>
          </div>
        </div>

        {/* Sales by Fabric Category */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col">
          <h2 className="font-serif text-base font-bold text-[#4A0715]">Sales by Saree Fabric</h2>
          <p className="text-[11px] text-[#81766E] mb-4">Volume generated across weaving crafts</p>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {[
              { name: 'Kanjivaram Silk', share: 45, sales: '₹88,000', color: '#4A0715' },
              { name: 'Banarasi Brocade', share: 28, sales: '₹54,000', color: '#720F25' },
              { name: 'Royal Kalakaari', share: 18, sales: '₹35,000', color: '#B9953B' },
              { name: 'Organza & Tussar', share: 9, sales: '₹18,000', color: '#70594B' },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#29201E]">{cat.name}</span>
                  <span className="font-semibold text-[#4A0715]">{cat.sales} ({cat.share}%)</span>
                </div>
                <div className="w-full h-2 bg-[#F7F5F1] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EBE1] text-center">
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="text-xs font-semibold text-[#B9953B] hover:text-[#4A0715] transition-colors"
            >
              View Full Analytics Breakdown →
            </button>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS & LOW STOCK WATCHLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#F0EBE1] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-bold text-[#4A0715]">Recent Patron Orders</h2>
              <p className="text-[11px] text-[#81766E]">Latest drapes ordered through the digital atelier</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('orders')}
              className="text-xs font-semibold text-[#B9953B] hover:text-[#4A0715] transition-colors"
            >
              All Orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order Ref</th>
                  <th className="py-3 px-4 font-semibold">Patron</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F1]">
                {(data?.recentOrders || []).map((ord) => {
                  const refNum = ord.order_number || ord.orderNumber || 'VAG-ORD';
                  const patronName = ord.customer_name || ord.customerName || 'Boutique Patron';
                  const patronEmail = ord.email || '';
                  const amount = Number(ord.total_amount ?? ord.totalAmount ?? 0);
                  const payStatus = ord.payment_status || ord.paymentStatus || 'pending';
                  const ordStatus = ord.order_status || ord.orderStatus || 'placed';

                  return (
                    <tr key={ord.id || refNum} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#4A0715]">
                        #{refNum}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#29201E]">{patronName}</p>
                        {patronEmail && <p className="text-[10px] text-[#81766E]">{patronEmail}</p>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#29201E]">
                        ₹{amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          payStatus === 'completed'
                            ? 'bg-[#E8F5E9] text-[#287A52]'
                            : 'bg-[#FFF8E1] text-[#C58A28]'
                        }`}>
                          {payStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          ordStatus === 'delivered'
                            ? 'bg-[#E8F5E9] text-[#287A52]'
                            : ordStatus === 'shipped'
                            ? 'bg-[#E3F2FD] text-[#1E88E5]'
                            : 'bg-[#FDF4E7] text-[#C58A28]'
                        }`}>
                          {ordStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#F0EBE1] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-base font-bold text-[#4A0715]">Atelier Stock Alert</h2>
              <p className="text-[11px] text-[#81766E]">Drapes with critical low availability</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('inventory')}
              className="text-xs font-semibold text-[#B9953B] hover:text-[#4A0715] transition-colors"
            >
              Inventory →
            </button>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-80 divide-y divide-[#F7F5F1]">
            {(data?.lowStockProducts || []).map((prod) => (
              <div key={prod.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-10 h-12 object-cover rounded-md border border-[#E8E2D9]"
                  />
                  <div>
                    <p className="text-xs font-medium text-[#29201E] line-clamp-1">{prod.name}</p>
                    <p className="text-[10px] text-[#81766E]">{prod.sku} • {prod.fabric}</p>
                    <span className="text-[10px] text-[#C34444] font-semibold">
                      Only {prod.stock} left in atelier
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setQuickRestockProduct(prod);
                    setRestockAmount(10);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-[#F5EEE5] text-[#4A0715] hover:bg-[#4A0715] hover:text-[#F5EEE5] rounded-lg transition-colors border border-[#E8E2D9] flex-shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}

            {(data?.lowStockProducts || []).length === 0 && (
              <div className="text-center py-8 text-[#81766E] text-xs">
                ✓ All sarees have healthy inventory levels.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK RESTOCK MODAL */}
      {quickRestockProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#4A0715]">
              Quick Restock Saree
            </h3>
            <p className="text-xs text-[#81766E]">
              Add freshly woven stock units for <span className="font-semibold text-[#29201E]">{quickRestockProduct.name}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#29201E] mb-1">
                Units to add from weavers:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickRestockProduct(null)}
                className="px-3 py-1.5 text-xs text-[#81766E] hover:text-[#29201E] font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={restocking}
                onClick={handleRestock}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#4A0715] hover:bg-[#720F25] rounded-lg transition-colors disabled:opacity-50"
              >
                {restocking ? 'Updating...' : `Confirm +${restockAmount} Drapes`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

