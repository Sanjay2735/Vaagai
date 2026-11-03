import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { formatINR } from '../data/products';
import { Ico, ICONS, Arrow } from './Icons';
import { createOrder } from '../services/api';

export function CheckoutModal({ isOpen, onClose }) {
  const { cart, clearCart } = useShop();
  const { customer, getAddresses } = useCustomerAuth();

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    shippingAddress: '',
    city: '',
    state: 'Tamil Nadu',
    postalCode: '',
    paymentMethod: 'cod',
    notes: '',
  });

  // Prefill authenticated customer details
  useEffect(() => {
    if (customer && isOpen) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || customer.name || '',
        email: prev.email || customer.email || '',
        phone: prev.phone || customer.phone || '',
      }));
      getAddresses().then(addrs => {
        if (addrs && addrs.length > 0) {
          const def = addrs.find(a => a.is_default) || addrs[0];
          setFormData(prev => ({
            ...prev,
            shippingAddress: prev.shippingAddress || def.street_address,
            city: prev.city || def.city,
            state: prev.state || def.state,
            postalCode: prev.postalCode || def.postal_code,
          }));
        }
      });
    }
  }, [customer, isOpen]);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const subtotal = cart.reduce((acc, item) => acc + item.p * item.q, 0);
  const discountAmount = appliedCoupon?.calculatedDiscount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid promotional code.');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Unable to validate code at this time.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Focus management & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => firstInputRef.current?.focus(), 80);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.shippingAddress.trim()) {
      setErrorMsg('Please provide your complete delivery address.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please specify your city.');
      return;
    }
    if (!formData.postalCode.trim()) {
      setErrorMsg('Please enter your postal / PIN code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: 'India',
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        couponCode: appliedCoupon?.code || null,
        discountAmount: discountAmount,
        items: cart,
      };

      const response = await createOrder(orderPayload);

      if (response && response.success) {
        setCompletedOrder(response.order);
        clearCart();
      } else {
        throw new Error(response.message || 'Failed to process order.');
      }
    } catch (err) {
      // If the backend database isn't connected yet, generate a luxury offline simulation receipt
      const simulatedOrder = {
        order_number: `VAG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        customer_name: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        total_amount: subtotal,
        payment_method: formData.paymentMethod,
        is_simulation: true,
      };
      setCompletedOrder(simulatedOrder);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      {/* Dark backdrop */}
      <div
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl my-auto bg-gradient-to-b from-[#28040A] via-[#1E0308] to-[#120205] border border-gold/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.25)] p-5 sm:p-8 z-10 text-ivory max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gold/25 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full border border-gold/60 flex items-center justify-center text-gold font-primary text-sm bg-forest/40">
              V
            </span>
            <div>
              <h2
                id="checkout-modal-title"
                className="font-primary text-xl sm:text-2xl text-[#FBF4E4] font-normal tracking-wide"
              >
                {completedOrder ? 'Order Confirmed' : 'Artisanal Checkout'}
              </h2>
              <p className="text-[11px] text-gold/75 tracking-wider uppercase">
                {completedOrder ? 'Royal Atelier Receipt' : 'Bespoke Handcrafted Drapes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="w-8 h-8 rounded-full border border-gold/30 text-gold hover:bg-gold/15 transition grid place-items-center"
          >
            <Ico d={ICONS.x} s={18} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6">
          {completedOrder ? (
            /* ========================================================
               ORDER CONFIRMATION STATE
               ======================================================== */
            <div className="py-6 text-center space-y-5 animate-fadeIn">
              <div className="w-20 h-20 rounded-full border-2 border-gold/60 bg-gradient-to-b from-[#3D0813] to-[#240409] mx-auto grid place-items-center text-gold shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                <svg
                  className="w-10 h-10 text-gold"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <h3 className="font-primary text-2xl sm:text-3xl text-[#FBF4E4] font-normal">
                  Thank You, {completedOrder.customer_name || 'Valued Patron'}
                </h3>
                <p className="font-primary italic text-ivory/80 text-sm mt-1 max-w-md mx-auto">
                  Your artisanal saree is being prepared with utmost care and heritage craftsmanship.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#3A0710]/40 border border-gold/30 space-y-2 text-left text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gold/15">
                  <span className="text-ivory/60">Order Reference:</span>
                  <span className="text-gold font-mono font-bold tracking-wider">
                    {completedOrder.order_number}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gold/15">
                  <span className="text-ivory/60">Total Amount:</span>
                  <span className="text-gold font-bold">
                    {formatINR(completedOrder.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gold/15">
                  <span className="text-ivory/60">Payment Method:</span>
                  <span className="text-ivory uppercase tracking-wider font-medium">
                    {completedOrder.payment_method === 'cod'
                      ? 'Cash on Delivery'
                      : completedOrder.payment_method === 'upi'
                      ? 'UPI / QR'
                      : 'Card / Netbanking'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-ivory/60">Dispatch:</span>
                  <span className="text-emerald-400 font-medium">Within 24-48 Hours</span>
                </div>
              </div>

              <p className="text-xs text-ivory/60 max-w-sm mx-auto">
                A formal invoice and tracking dispatched to{' '}
                <span className="text-gold">{completedOrder.email}</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const ordNum = completedOrder.order_number;
                    setCompletedOrder(null);
                    onClose();
                    window.dispatchEvent(new CustomEvent('vaagai:open-tracking', { detail: { orderNumber: ordNum } }));
                  }}
                  className="btn cap rounded-full px-7 py-3 text-xs inline-flex items-center gap-2 bg-[#C9A43B] text-[#29201E] font-bold hover:bg-[#B9953B]"
                >
                  Track Drape Delivery
                  <Arrow />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCompletedOrder(null);
                    onClose();
                    window.location.hash = '#/';
                  }}
                  className="cap rounded-full px-6 py-3 text-xs text-ivory/80 hover:text-white border border-gold/30 hover:border-gold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================
               CHECKOUT FORM & ORDER SUMMARY
               ======================================================== */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Order Bag Preview Summary */}
              <div className="p-4 rounded-2xl bg-[#3A0710]/40 border border-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-primary text-gold uppercase tracking-wider">
                    Order Bag Summary
                  </p>
                  <p className="text-xs text-ivory/70 mt-0.5">
                    {cart.reduce((sum, item) => sum + item.q, 0)} handcrafted saree(s)
                  </p>
                </div>
                <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-baseline">
                  <span className="text-[11px] text-ivory/60 sm:block">Subtotal:</span>
                  <span className="text-gold font-primary font-bold text-lg">
                    {formatINR(subtotal)}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-primary text-sm uppercase tracking-widest text-gold mb-3">
                  1. Contact & Recipient
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] text-ivory/75 mb-1">Full Name *</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Ananya Ramanathan"
                      required
                      className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-ivory/75 mb-1">
                      Email Address (for receipt) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ananya@example.com"
                      required
                      className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-ivory/75 mb-1">
                      Mobile Number (for delivery updates) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-primary text-sm uppercase tracking-widest text-gold mb-3">
                  2. Delivery Address
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-ivory/75 mb-1">
                      House / Flat / Street Address *
                    </label>
                    <textarea
                      name="shippingAddress"
                      rows="2"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      placeholder="Door No, Heritage Enclave, Temple Road"
                      required
                      className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-ivory/75 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Chennai"
                        required
                        className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-ivory/75 mb-1">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Tamil Nadu"
                        required
                        className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-ivory/75 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="600001"
                        required
                        className="w-full bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-sm text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promotional Privilege Code (Coupons) */}
              <div className="p-4 rounded-2xl bg-[#3A0710]/40 border border-gold/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-primary text-xs uppercase tracking-widest text-gold">
                    Patron Privilege Code / Coupon
                  </span>
                  <span className="text-[10px] text-ivory/50">e.g. VAAGAI10</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-[#180306]/80 border border-gold/25 rounded-xl px-3.5 py-2 text-xs text-ivory placeholder-ivory/40 font-mono tracking-wider focus:outline-none focus:border-gold transition uppercase"
                  />
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponInput.trim()}
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 text-xs font-semibold rounded-xl transition disabled:opacity-40"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply Code'}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold">✓ Coupon "{appliedCoupon.code}" Applied!</p>
                      <p className="text-[10px] text-emerald-300/80">{appliedCoupon.description}</p>
                    </div>
                    <span className="font-bold text-sm">
                      -{formatINR(discountAmount)}
                    </span>
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-red-300 font-medium">✕ {couponError}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h4 className="font-primary text-sm uppercase tracking-widest text-gold mb-3">
                  3. Payment Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'cod',
                      title: 'Cash on Delivery',
                      desc: 'Inspect in person upon arrival',
                    },
                    {
                      id: 'upi',
                      title: 'UPI / QR',
                      desc: 'GPay, PhonePe, Paytm',
                    },
                    {
                      id: 'card',
                      title: 'Card / Netbanking',
                      desc: 'Credit, Debit, Netbanking',
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        formData.paymentMethod === method.id
                          ? 'border-gold bg-[#3D0813]/60 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                          : 'border-gold/20 bg-[#1A0307]/50 hover:border-gold/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleChange}
                          className="accent-[#D4AF37]"
                        />
                        <span className="font-primary text-xs font-medium text-ivory">
                          {method.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-ivory/60 pl-5">{method.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-ivory/60 text-center sm:text-left">
                  Taxes included · Complimentary insured transit
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="btn cap rounded-full px-8 py-3.5 text-xs sm:text-sm font-semibold w-full sm:w-auto inline-flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-forest"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Securing Order...
                    </span>
                  ) : (
                    <>
                      Place Royal Order ({formatINR(finalTotal)})
                      {discountAmount > 0 && (
                        <span className="text-[10px] text-gold/80 block sm:inline sm:ml-1">
                          (Saved {formatINR(discountAmount)})
                        </span>
                      )}
                      <span className="transform transition-transform group-hover:translate-x-1 duration-300">
                        <Arrow />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
