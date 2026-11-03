import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(15000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(5000);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons();
      if (res.success) {
        setCoupons(res.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code || discountValue === undefined) return;
    setSaving(true);
    try {
      await adminApi.createCoupon({
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      });
      setModalOpen(false);
      setCode('');
      setDescription('');
      fetchCoupons();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await adminApi.updateCoupon(coupon.id, { isActive: coupon.is_active ? 0 : 1 });
      fetchCoupons();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id, cCode) => {
    if (!window.confirm(`Delete coupon "${cCode}"?`)) return;
    try {
      await adminApi.deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Promotional Coupons & Privileges ({coupons.length})
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Backend-validated promotional codes, festive discounts, and patron privileges.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25] text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          + Create Privilege Code
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#4A0715] tracking-wider px-2 py-0.5 bg-[#F5EEE5] rounded-md border border-[#E8E2D9]">
                  {c.code}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  c.is_active ? 'bg-[#E8F5E9] text-[#287A52]' : 'bg-[#FDE8E8] text-[#C34444]'
                }`}>
                  {c.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-[#29201E] font-medium">{c.description || 'Promotional patron discount'}</p>

              <div className="text-xs text-[#70594B] space-y-0.5 pt-2 border-t border-[#F0EBE1]">
                <p>
                  <span className="text-[#81766E]">Privilege: </span>
                  <span className="font-bold text-[#4A0715]">
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}% OFF`
                      : c.discount_type === 'fixed'
                      ? `₹${c.discount_value} FLAT OFF`
                      : 'FREE SHIPPING'}
                  </span>
                </p>
                <p>
                  <span className="text-[#81766E]">Min Bag Value: </span>
                  ₹{Number(c.min_order_amount || 0).toLocaleString('en-IN')}
                </p>
                {c.max_discount_amount && (
                  <p>
                    <span className="text-[#81766E]">Max Discount: </span>
                    ₹{Number(c.max_discount_amount).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mt-3 border-t border-[#F0EBE1] text-xs">
              <button
                onClick={() => handleToggleActive(c)}
                className="text-[11px] font-semibold text-[#70594B] hover:text-[#4A0715]"
              >
                {c.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => handleDelete(c.id, c.code)}
                className="text-[11px] font-semibold text-[#C34444] hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#4A0715]">
              Create Patron Coupon Code
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI25"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-mono font-bold tracking-wider focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Description / Benefit</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 15% Festive Privilege on Kanjivaram drapes"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-semibold focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="15000"
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#29201E] mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-[#81766E] hover:text-[#29201E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 font-semibold text-white bg-[#4A0715] hover:bg-[#720F25] rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

