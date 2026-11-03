import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export function OrderTrackingModal({ isOpen, onClose, initialOrderNumber = '' }) {
  const { customer, cancelOrder, requestReturn } = useCustomerAuth();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lookup function
  const fetchOrder = async (searchNum) => {
    if (!searchNum) return;
    setLoading(true);
    setError('');

    const token = localStorage.getItem('vaagai_customer_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const emailParam = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`/api/orders/${encodeURIComponent(searchNum.trim())}${emailParam}`, {
        headers,
      });
      const data = await res.json();

      if (res.ok && data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order reference not found.');
        setOrder(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to tracking server.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialOrderNumber) {
        setOrderNumber(initialOrderNumber);
        fetchOrder(initialOrderNumber);
      }
    } else {
      setOrder(null);
      setError('');
    }
  }, [isOpen, initialOrderNumber]);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  // 7-Stage Luxury Progress Pipeline
  const stages = [
    { key: 'placed', label: 'Order Placed', desc: 'Received at Atelier' },
    { key: 'confirmed', label: 'Payment Confirmed', desc: 'Verified transaction' },
    { key: 'processing', label: 'In Crafting', desc: 'Artisan weaving & inspection' },
    { key: 'packed', label: 'Heirloom Packaging', desc: 'Silk box with fragrance sachet' },
    { key: 'shipped', label: 'Dispatched', desc: order?.shipping_carrier || 'Express Courier' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'With local courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Safely presented to patron' },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'placed': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'packed': return 3;
      case 'shipped': return 4;
      case 'out_for_delivery': return 5;
      case 'delivered': return 6;
      default: return 0;
    }
  };

  const currentStageIdx = order ? getStageIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'cancelled';
  const isReturned = order?.order_status === 'returned' || order?.order_status === 'return_requested';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#29201E] border border-[#C9A43B]/40 rounded-3xl shadow-2xl text-[#F5EEE5] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-[#C9A43B]/20 flex items-center justify-between bg-black/30">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#E9D9BF]">
              Track Your Heirloom Drape
            </h2>
            <p className="text-xs text-[#E9D9BF]/60 mt-0.5">
              Real-time courier progress and artisanal crafting timeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E9D9BF]/60 hover:text-[#C9A43B] rounded-full hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-6 border-b border-white/5 bg-black/20">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                placeholder="Enter Order Reference (e.g. VAG-2026-437230)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-black/50 border border-[#C9A43B]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C9A43B] font-mono uppercase"
              />
            </div>
            {!customer && (
              <input
                type="email"
                placeholder="Order Email (if guest)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="sm:w-48 px-3 py-2.5 text-xs bg-black/50 border border-[#C9A43B]/30 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#C9A43B]"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#C9A43B] hover:bg-[#B9953B] text-[#29201E] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Locating...' : 'Track'}
            </button>
          </form>

          {error && (
            <p className="text-xs text-[#E57373] mt-2 flex items-center gap-1.5">
              <span>⚠</span> <span>{error}</span>
            </p>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {order ? (
            <div className="space-y-6">
              {/* Order Meta Header Card */}
              <div className="p-4 rounded-2xl bg-black/30 border border-[#C9A43B]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="font-mono text-sm font-bold text-[#C9A43B]">
                    #{order.order_number}
                  </span>
                  <p className="text-xs text-[#E9D9BF]/70 mt-1">
                    Patron: <span className="font-semibold text-white">{order.customer_name}</span>
                  </p>
                  <p className="text-[11px] text-[#E9D9BF]/50">
                    Destination: {order.city}, {order.state} - {order.postal_code}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span
                    className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full font-bold ${
                      order.order_status === 'delivered'
                        ? 'bg-[#E8F5E9]/20 text-[#81C784] border border-[#81C784]/30'
                        : isCancelled
                        ? 'bg-[#FFEBEE]/20 text-[#E57373] border border-[#E57373]/30'
                        : 'bg-[#FFF8E1]/20 text-[#FFD54F] border border-[#FFD54F]/30'
                    }`}
                  >
                    {order.order_status.replace('_', ' ')}
                  </span>
                  <p className="font-serif text-base font-bold text-[#E9D9BF] mt-1.5">
                    ₹{Number(order.total_amount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* COURIER INFO (if shipped) */}
              {order.shipping_carrier && (
                <div className="p-4 rounded-2xl bg-[#C9A43B]/10 border border-[#C9A43B]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C9A43B] font-bold block">
                      Express Courier Partner
                    </span>
                    <p className="font-bold text-[#E9D9BF] mt-0.5">
                      {order.shipping_carrier} • Consignment AWB: <span className="font-mono text-[#C9A43B]">{order.tracking_number}</span>
                    </p>
                  </div>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs bg-[#C9A43B] text-[#29201E] rounded-lg font-bold hover:bg-[#B9953B] transition-colors self-start sm:self-auto"
                    >
                      Open Carrier Portal ↗
                    </a>
                  )}
                </div>
              )}

              {/* 7-STAGE PROGRESS TIMELINE */}
              {!isCancelled ? (
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#C9A43B]">
                    Fulfillment Milestones
                  </h3>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C9A43B]/20">
                    {stages.map((st, idx) => {
                      const isComplete = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={st.key} className="relative flex items-start space-x-3 text-xs">
                          {/* Indicator dot */}
                          <div
                            className={`absolute -left-6 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-[#C9A43B] ring-4 ring-[#C9A43B]/30 shadow-md'
                                : isComplete
                                ? 'bg-[#287A52] text-white text-[9px]'
                                : 'bg-black/60 border border-white/20'
                            }`}
                          >
                            {isComplete && !isCurrent ? '✓' : ''}
                          </div>

                          <div>
                            <p
                              className={`font-semibold ${
                                isCurrent
                                  ? 'text-[#C9A43B] text-sm font-serif font-bold'
                                  : isComplete
                                  ? 'text-white'
                                  : 'text-white/40'
                              }`}
                            >
                              {st.label}
                            </p>
                            <p className="text-[11px] text-[#E9D9BF]/50 mt-0.5">{st.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-200">
                  This order was cancelled. Stock units have been returned to our master weavers and refund processed where applicable.
                </div>
              )}

              {/* ITEMS SNAPSHOT */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#C9A43B]">
                  Drapes in this Consignment
                </h3>
                <div className="divide-y divide-white/5 bg-black/20 rounded-2xl p-3 border border-white/5">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center space-x-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-10 h-12 object-cover rounded-md border border-[#C9A43B]/20"
                          />
                        )}
                        <div>
                          <p className="font-medium text-[#E9D9BF]">{item.product_name}</p>
                          <p className="text-[10px] text-[#E9D9BF]/50">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-[#E9D9BF]">
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <span className="text-3xl">🥻</span>
              <p className="text-xs text-[#E9D9BF]/60 max-w-sm mx-auto">
                Enter your VAAGAI order reference number above (e.g. from your confirmation receipt or patron dashboard) to view real-time delivery milestones.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

