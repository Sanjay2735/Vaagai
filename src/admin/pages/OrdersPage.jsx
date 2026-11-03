import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';
import logoVaagai from '../../assests/images/Logo-Vaagai.jpeg';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [staffNote, setStaffNote] = useState('');

  // Shipping Modal / Drawer
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  // Invoice Print View
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        q: search,
        orderStatus,
        paymentStatus,
      };
      const res = await adminApi.getOrders(params);
      if (res.success) {
        setOrders(res.orders || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderStatus, paymentStatus]);

  const handleOpenDetail = (ord) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status);
    setNewPaymentStatus(ord.payment_status);
    setStaffNote('');
    setCarrier(ord.shipping_carrier || 'BlueDart Express');
    setTrackingNumber(ord.tracking_number || '');
    setTrackingUrl(ord.tracking_url || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await adminApi.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        newPaymentStatus,
        staffNote
      );
      if (res.success) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateShipping = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !trackingNumber) {
      alert('Please enter a tracking AWB number.');
      return;
    }
    setUpdating(true);
    try {
      const res = await adminApi.updateOrderShipping(
        selectedOrder.id,
        carrier,
        trackingNumber,
        trackingUrl
      );
      if (res.success) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Shipping update failed.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Order Fulfillment & Lifecycles ({total} Orders)
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Track client purchases, manage status transitions, courier dispatch tracking, and print receipts.
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search by Order #, Patron Name, Email, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B9953B] text-[#29201E]"
          />
          <svg className="w-4 h-4 text-[#81766E] absolute left-2.5 top-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="all">All Order Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing in Atelier</option>
          <option value="shipped">Dispatched / Shipped</option>
          <option value="delivered">Delivered to Patron</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="all">All Payments</option>
          <option value="completed">Completed / Paid</option>
          <option value="pending">Pending (COD/Gateway)</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 text-xs bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-semibold rounded-lg transition-colors border border-[#E8E2D9]"
        >
          Filter
        </button>
      </div>

      {/* ORDERS LIST */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Order Ref & Date</th>
                <th className="py-3 px-4 font-semibold">Patron Details</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Payment Status</th>
                <th className="py-3 px-4 font-semibold">Fulfillment Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F1]">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-mono font-bold text-[#4A0715]">#{ord.order_number}</p>
                    <p className="text-[10px] text-[#81766E]">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#29201E]">{ord.customer_name}</p>
                    <p className="text-[10px] text-[#81766E]">{ord.email}</p>
                    <p className="text-[10px] text-[#70594B]">{ord.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      {(ord.items || []).slice(0, 3).map((it, i) => (
                        <img
                          key={i}
                          src={it.image_url || '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg'}
                          alt={it.product_name}
                          title={it.product_name}
                          className="w-7 h-9 object-cover rounded-sm border border-[#E8E2D9]"
                        />
                      ))}
                      {(ord.items || []).length > 3 && (
                        <span className="text-[10px] text-[#81766E] font-medium pl-1">
                          +{ord.items.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#29201E]">₹{Number(ord.total_amount).toLocaleString('en-IN')}</p>
                    {ord.coupon_code && (
                      <span className="text-[9px] text-[#B9953B] font-mono font-bold">
                        Coupon: {ord.coupon_code}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      ord.payment_status === 'completed'
                        ? 'bg-[#E8F5E9] text-[#287A52]'
                        : ord.payment_status === 'refunded'
                        ? 'bg-[#EDE7F6] text-[#5E35B1]'
                        : 'bg-[#FFF8E1] text-[#C58A28]'
                    }`}>
                      {ord.payment_status} ({ord.payment_method?.toUpperCase()})
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      ord.order_status === 'delivered'
                        ? 'bg-[#E8F5E9] text-[#287A52]'
                        : ord.order_status === 'shipped'
                        ? 'bg-[#E3F2FD] text-[#1E88E5]'
                        : ord.order_status === 'cancelled'
                        ? 'bg-[#FDE8E8] text-[#C34444]'
                        : 'bg-[#FFF8E1] text-[#C58A28]'
                    }`}>
                      {ord.order_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="px-2.5 py-1 text-xs font-medium bg-[#F5EEE5] text-[#4A0715] hover:bg-[#4A0715] hover:text-[#F5EEE5] rounded-md transition-colors border border-[#E8E2D9]"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => setInvoiceOrder(ord)}
                        className="p-1 text-[#70594B] hover:text-[#4A0715] hover:bg-[#F5EEE5] rounded-md transition-colors"
                        title="Print Invoice"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-[#81766E]">
                    No orders found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL & STATUS TRANSITION MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E8E2D9] animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between bg-[#FDFBF7] rounded-t-2xl">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A0715]">
                  Order #{selectedOrder.order_number}
                </h3>
                <p className="text-[11px] text-[#81766E]">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-[#81766E] hover:text-[#4A0715] p-1.5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Patron & Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F7F5F1] rounded-xl border border-[#E8E2D9] text-xs">
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-[#70594B] text-[10px] mb-1">
                    Patron Profile
                  </h4>
                  <p className="font-bold text-[#29201E]">{selectedOrder.customer_name}</p>
                  <p className="text-[#81766E]">{selectedOrder.email}</p>
                  <p className="text-[#81766E]">{selectedOrder.phone}</p>
                </div>
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-[#70594B] text-[10px] mb-1">
                    Delivery Destination
                  </h4>
                  <p className="text-[#29201E]">{selectedOrder.shipping_address}</p>
                  <p className="text-[#81766E]">{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.postal_code}</p>
                  <p className="text-[#81766E]">{selectedOrder.country || 'India'}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-serif text-sm font-bold text-[#4A0715] mb-2">Itemized Saree Drapes</h4>
                <div className="border border-[#E8E2D9] rounded-xl overflow-hidden divide-y divide-[#F7F5F1] text-xs">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={it.image_url || '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg'}
                          alt={it.product_name}
                          className="w-12 h-14 object-cover rounded-md border border-[#E8E2D9]"
                        />
                        <div>
                          <p className="font-semibold text-[#29201E]">{it.product_name}</p>
                          <p className="text-[10px] text-[#81766E]">SKU: {it.sku || 'N/A'}</p>
                          <p className="text-[10px] text-[#70594B]">Qty: {it.quantity} × ₹{Number(it.price).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#4A0715]">
                        ₹{Number(it.subtotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 bg-white rounded-xl border border-[#E8E2D9] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#81766E]">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-[#287A52] font-medium">
                    <span>Discount Privilege ({selectedOrder.coupon_code || 'Promo'})</span>
                    <span>-₹{Number(selectedOrder.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#81766E]">
                  <span>Insured Pan-India Express Delivery</span>
                  <span>{Number(selectedOrder.shipping_fee) === 0 ? 'Complimentary' : `₹${selectedOrder.shipping_fee}`}</span>
                </div>
                <div className="pt-2 border-t border-[#E8E2D9] flex justify-between font-bold text-sm text-[#4A0715]">
                  <span>Total Amount Paid</span>
                  <span>₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 bg-[#FDFBF7] rounded-xl border border-[#C9A43B]/30 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#4A0715]">
                  Lifecycle Status Transition Engine
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#70594B] mb-1">
                      Order Fulfillment Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing in Atelier</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#70594B] mb-1">
                      Payment Reconciliation
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed / Paid</option>
                      <option value="refunded">Refunded</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#70594B] mb-1">
                    Staff Transition Audit Note
                  </label>
                  <input
                    type="text"
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="e.g. Saree inspected for silk quality and handed over to logistics partner."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 text-xs font-semibold text-[#F5EEE5] bg-[#4A0715] hover:bg-[#720F25] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Recording...' : 'Update Order Status'}
                  </button>
                </div>
              </form>

              {/* Courier Dispatch Form */}
              <form onSubmit={handleUpdateShipping} className="p-4 bg-white rounded-xl border border-[#E8E2D9] space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#4A0715]">
                  Logistics & Courier Dispatch Tracking
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#70594B] mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    >
                      <option value="BlueDart Express">BlueDart Express</option>
                      <option value="DTDC Premium">DTDC Premium</option>
                      <option value="Delhivery Surface">Delhivery Surface</option>
                      <option value="India Post Speed">India Post Speed Post</option>
                      <option value="FedEx Express">FedEx Express</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#70594B] mb-1">
                      AWB / Tracking Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BD89421578IN"
                      className="w-full px-3 py-2 font-mono text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 text-xs font-semibold text-[#4A0715] bg-[#F5EEE5] hover:bg-[#E9D9BF] rounded-lg transition-colors border border-[#E8E2D9]"
                  >
                    Save Tracking & Mark Shipped
                  </button>
                </div>
              </form>

              {/* Order Timeline Audit Trail */}
              <div>
                <h4 className="font-serif text-sm font-bold text-[#4A0715] mb-2">Order Audit Timeline</h4>
                <div className="p-4 bg-[#F7F5F1] rounded-xl border border-[#E8E2D9] space-y-3 text-xs">
                  {(selectedOrder.timeline || []).map((ev, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-[#B9953B] mt-1 flex-shrink-0"></div>
                      <div>
                        <p className="font-semibold text-[#29201E] capitalize">{ev.status}</p>
                        <p className="text-[11px] text-[#70594B]">{ev.note}</p>
                        <p className="text-[10px] text-[#81766E] font-mono">{new Date(ev.time).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                  {(selectedOrder.timeline || []).length === 0 && (
                    <p className="text-[#81766E] text-xs">No recorded events yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-[#E8E2D9] space-y-6 print:m-0 print:p-0 print:shadow-none">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-[#E8E2D9] pb-4">
              <div className="flex items-center space-x-3">
                <img src={logoVaagai} alt="VAAGAI" className="w-12 h-12 rounded-full object-cover border border-[#C9A43B]" />
                <div>
                  <h2 className="font-serif text-xl font-bold tracking-widest text-[#4A0715]">VAAGAI</h2>
                  <p className="text-[10px] uppercase tracking-wider text-[#B9953B] font-semibold">Artisanal Saree Atelier</p>
                  <p className="text-[10px] text-[#81766E]">Cathedral Road, Chennai, Tamil Nadu 600086</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-[#4A0715] text-sm">TAX INVOICE</span>
                <p className="font-mono text-[#29201E] mt-1">Inv: #{invoiceOrder.order_number}</p>
                <p className="text-[#81766E] text-[10px]">{new Date(invoiceOrder.created_at).toLocaleDateString('en-IN')}</p>
                <p className="text-[#287A52] font-semibold text-[10px] mt-0.5">Payment: {invoiceOrder.payment_status.toUpperCase()}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#81766E] font-semibold">Billed & Shipped To:</span>
              <p className="font-bold text-[#29201E] text-sm mt-0.5">{invoiceOrder.customer_name}</p>
              <p className="text-[#70594B]">{invoiceOrder.shipping_address}, {invoiceOrder.city}, {invoiceOrder.state} - {invoiceOrder.postal_code}</p>
              <p className="text-[#81766E]">Email: {invoiceOrder.email} | Phone: {invoiceOrder.phone}</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-[#E8E2D9]">
              <thead className="bg-[#F7F5F1] text-[#70594B] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Price</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {(invoiceOrder.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium text-[#29201E]">{it.product_name} ({it.sku || 'Saree'})</td>
                    <td className="p-2.5 text-center">{it.quantity}</td>
                    <td className="p-2.5 text-right">₹{Number(it.price).toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-semibold">₹{Number(it.subtotal).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1">
                <div className="flex justify-between text-[#81766E]">
                  <span>Subtotal</span>
                  <span>₹{Number(invoiceOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(invoiceOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-[#287A52]">
                    <span>Discount</span>
                    <span>-₹{Number(invoiceOrder.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#81766E]">
                  <span>Insured Express Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="pt-2 border-t border-[#E8E2D9] flex justify-between font-bold text-base text-[#4A0715]">
                  <span>Total Amount</span>
                  <span>₹{Number(invoiceOrder.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E8E2D9] text-center text-[10px] text-[#81766E] space-y-1">
              <p>Thank you for choosing VAAGAI — Handcrafted Heritage & Contemporary South Indian Couture.</p>
              <p>For questions regarding your weave, contact concierge@vaagai.com</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 text-xs text-[#81766E] hover:text-[#29201E] font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-[#F5EEE5] bg-[#4A0715] hover:bg-[#720F25] rounded-lg transition-colors"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

