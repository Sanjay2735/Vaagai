import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export function CustomerAccountModal({ isOpen, onClose, onTrackOrder }) {
  const { customer, logout, getMyOrders, getAddresses, addAddress, deleteAddress, cancelOrder, requestReturn, changePassword } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'security'
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Fabric Tone Difference');
  const [returnDesc, setReturnDesc] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Cancel order state
  const [cancellingOrderNumber, setCancellingOrderNumber] = useState(null);

  // Add address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    streetAddress: '',
    city: '',
    state: 'Tamil Nadu',
    postalCode: '',
    country: 'India',
    addressType: 'Home',
    isDefault: 1,
  });

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordList, addrList] = await Promise.all([getMyOrders(), getAddresses()]);
      setOrders(ordList || []);
      setAddresses(addrList || []);
    } catch (err) {
      console.error('Failed to load customer profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  const handleCancel = async (orderNumber) => {
    if (!window.confirm(`Are you sure you wish to cancel Order #${orderNumber}? Stock units will be returned to the weavers.`)) {
      return;
    }
    setCancellingOrderNumber(orderNumber);
    try {
      const res = await cancelOrder(orderNumber, 'Cancelled from customer account dashboard');
      if (res.success) {
        alert('Order successfully cancelled.');
        loadData();
      } else {
        alert(res.message || 'Failed to cancel order.');
      }
    } finally {
      setCancellingOrderNumber(null);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnOrder) return;
    setSubmittingReturn(true);
    try {
      const res = await requestReturn(returnOrder.order_number, {
        reason: returnReason,
        description: returnDesc,
      });
      if (res.success) {
        alert('Return request successfully submitted! Our concierge team will review within 24 hours.');
        setReturnOrder(null);
        setReturnDesc('');
        loadData();
      } else {
        alert(res.message || 'Failed to submit return request.');
      }
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const res = await addAddress(newAddr);
    if (res.success) {
      setShowAddressForm(false);
      setNewAddr({
        name: customer?.name || '',
        phone: customer?.phone || '',
        streetAddress: '',
        city: '',
        state: 'Tamil Nadu',
        postalCode: '',
        country: 'India',
        addressType: 'Home',
        isDefault: 0,
      });
      loadData();
    } else {
      alert(res.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Delete this saved address?')) {
      await deleteAddress(id);
      loadData();
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    const res = await changePassword(currentPass, newPass);
    if (res.success) {
      setPassMsg({ text: 'Password successfully updated.', type: 'success' });
      setCurrentPass('');
      setNewPass('');
    } else {
      setPassMsg({ text: res.message || 'Failed to change password.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#29201E] border border-[#C9A43B]/40 rounded-3xl shadow-2xl text-[#F5EEE5] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-[#C9A43B]/20 flex items-center justify-between bg-black/30">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-[#4A0715] text-[#C9A43B] font-serif font-bold text-lg flex items-center justify-center border border-[#C9A43B]/40 shadow-sm">
              {customer.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#E9D9BF] leading-none">
                {customer.name}
              </h2>
              <p className="text-xs text-[#E9D9BF]/60 mt-0.5">
                {customer.email} {customer.phone ? `• ${customer.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3 py-1.5 text-xs text-[#C9A43B]/80 hover:text-[#C9A43B] hover:bg-white/5 rounded-lg transition-colors border border-[#C9A43B]/20"
            >
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#E9D9BF]/60 hover:text-[#C9A43B] rounded-full hover:bg-white/5 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#C9A43B]/20 px-6 bg-black/20 text-xs font-semibold">
          {[
            { id: 'orders', label: `My Orders (${orders.length})` },
            { id: 'addresses', label: `Addresses (${addresses.length})` },
            { id: 'security', label: 'Security & Password' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3.5 px-4 uppercase tracking-wider transition-colors ${
                activeTab === t.id
                  ? 'text-[#C9A43B] border-b-2 border-[#C9A43B]'
                  : 'text-[#E9D9BF]/50 hover:text-[#E9D9BF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#E9D9BF]/60">
              Loading your atelier records...
            </div>
          ) : activeTab === 'orders' ? (
            /* TAB 1: MY ORDERS */
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <p className="text-sm text-[#E9D9BF]/70">No orders placed yet.</p>
                  <p className="text-xs text-[#E9D9BF]/40">Explore our curated drapes and place your first heirloom order.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-black/30 border border-[#C9A43B]/20 space-y-4 hover:border-[#C9A43B]/40 transition-colors"
                  >
                    {/* Order header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#C9A43B]">
                          #{ord.order_number}
                        </span>
                        <span className="text-[11px] text-[#E9D9BF]/50 ml-3">
                          Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                            ord.order_status === 'delivered'
                              ? 'bg-[#E8F5E9]/20 text-[#81C784] border border-[#81C784]/30'
                              : ord.order_status === 'cancelled'
                              ? 'bg-[#FFEBEE]/20 text-[#E57373] border border-[#E57373]/30'
                              : 'bg-[#FFF8E1]/20 text-[#FFD54F] border border-[#FFD54F]/30'
                          }`}
                        >
                          {ord.order_status}
                        </span>

                        <span className="text-xs font-bold text-[#E9D9BF]">
                          ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Ordered items */}
                    <div className="space-y-2">
                      {(ord.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
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
                              <p className="text-[10px] text-[#E9D9BF]/50">
                                Qty: {item.quantity} • ₹{Number(item.price).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-[#E9D9BF]">
                            ₹{Number(item.subtotal).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/5 gap-2">
                      <div className="text-[11px] text-[#E9D9BF]/60">
                        {ord.shipping_carrier ? (
                          <span>Shipped with <strong className="text-[#C9A43B]">{ord.shipping_carrier}</strong> (AWB: {ord.tracking_number})</span>
                        ) : (
                          <span>Complimentary insured shipping to {ord.city}, {ord.state}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Track Order */}
                        <button
                          type="button"
                          onClick={() => {
                            if (onTrackOrder) onTrackOrder(ord.order_number);
                            onClose();
                          }}
                          className="px-3 py-1 text-xs text-[#C9A43B] bg-[#C9A43B]/10 hover:bg-[#C9A43B]/20 rounded-lg transition-colors border border-[#C9A43B]/30 font-medium"
                        >
                          Track Drape →
                        </button>

                        {/* Cancel Button (if eligible) */}
                        {(ord.order_status === 'placed' || ord.order_status === 'confirmed') && (
                          <button
                            type="button"
                            disabled={cancellingOrderNumber === ord.order_number}
                            onClick={() => handleCancel(ord.order_number)}
                            className="px-3 py-1 text-xs text-[#E57373] bg-[#E57373]/10 hover:bg-[#E57373]/20 rounded-lg transition-colors border border-[#E57373]/30 font-medium"
                          >
                            {cancellingOrderNumber === ord.order_number ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}

                        {/* Request Return Button (if delivered) */}
                        {ord.order_status === 'delivered' && (
                          <button
                            type="button"
                            onClick={() => setReturnOrder(ord)}
                            className="px-3 py-1 text-xs text-[#FFD54F] bg-[#FFD54F]/10 hover:bg-[#FFD54F]/20 rounded-lg transition-colors border border-[#FFD54F]/30 font-medium"
                          >
                            Request Return
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'addresses' ? (
            /* TAB 2: ADDRESSES */
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-[#E9D9BF]/60">Manage your verified delivery destinations</p>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#C9A43B] text-[#29201E] rounded-lg hover:bg-[#B9953B] transition-colors"
                >
                  {showAddressForm ? 'Close Form' : '+ Add New Address'}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-5 bg-black/40 rounded-2xl border border-[#C9A43B]/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A43B]">New Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Street Address / House No."
                    value={newAddr.streetAddress}
                    onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="PIN Code"
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#C9A43B] text-[#29201E] text-xs font-bold rounded-lg hover:bg-[#B9953B]"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl bg-black/30 border border-[#C9A43B]/20 relative">
                    {addr.is_default === 1 && (
                      <span className="absolute top-3 right-3 text-[9px] bg-[#C9A43B]/20 text-[#C9A43B] px-2 py-0.5 rounded-full font-bold">
                        DEFAULT
                      </span>
                    )}
                    <p className="font-bold text-xs text-[#E9D9BF]">{addr.name}</p>
                    <p className="text-[11px] text-[#E9D9BF]/70 mt-1">{addr.street_address}</p>
                    <p className="text-[11px] text-[#E9D9BF]/70">{addr.city}, {addr.state} - {addr.postal_code}</p>
                    <p className="text-[10px] text-[#C9A43B] mt-2">{addr.phone}</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="mt-3 text-[10px] text-red-400 hover:underline"
                    >
                      Delete Address
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 3: SECURITY */
            <div className="max-w-md space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A43B]">Change Password</h3>
              {passMsg.text && (
                <div className={`p-3 rounded-lg text-xs ${passMsg.type === 'success' ? 'bg-[#287A52]/20 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                  {passMsg.text}
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-[#E9D9BF]/70 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-[#C9A43B]/30 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#E9D9BF]/70 mb-1">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-[#C9A43B]/30 rounded-lg text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#C9A43B] text-[#29201E] text-xs font-bold rounded-lg hover:bg-[#B9953B]"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RETURN REQUEST SUB-MODAL */}
        {returnOrder && (
          <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4">
            <div className="bg-[#29201E] border border-[#C9A43B] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#E9D9BF]">
                Request Drape Return
              </h3>
              <p className="text-xs text-[#E9D9BF]/70">
                Order <span className="text-[#C9A43B] font-mono">#{returnOrder.order_number}</span>
              </p>

              <form onSubmit={handleReturnSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#C9A43B] font-semibold mb-1">
                    Return Reason
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-[#C9A43B]/30 rounded-lg text-white"
                  >
                    <option value="Fabric Tone Difference">Fabric Tone Difference under indoor light</option>
                    <option value="Saree Drape Preference">Prefer different weave / collection</option>
                    <option value="Transit Packaging Imperfection">Packaging damaged during transit</option>
                    <option value="Other Concierge Inquiry">Other inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#C9A43B] font-semibold mb-1">
                    Explanation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Please describe how we can assist..."
                    value={returnDesc}
                    onChange={(e) => setReturnDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/50 border border-[#C9A43B]/30 rounded-lg text-white"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReturnOrder(null)}
                    className="px-3 py-1.5 text-xs text-[#E9D9BF]/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReturn}
                    className="px-4 py-1.5 text-xs font-bold bg-[#C9A43B] text-[#29201E] rounded-lg hover:bg-[#B9953B]"
                  >
                    {submittingReturn ? 'Submitting...' : 'Confirm Return Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

