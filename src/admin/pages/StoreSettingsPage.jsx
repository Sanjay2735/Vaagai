import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function StoreSettingsPage() {
  const [settings, setSettings] = useState({
    store_name: 'VAAGAI Luxury Sarees',
    tagline: 'Artisanal South Indian Saree Atelier',
    support_email: 'concierge@vaagai.com',
    support_phone: '+91 98400 12345',
    address: '104 Cathedral Road, Gopalapuram, Chennai, Tamil Nadu 600086',
    currency: 'INR',
    free_shipping_threshold: 5000,
    standard_shipping_fee: 0,
    tax_percentage: 5.0,
    announcement_text: 'Complimentary Pan-India Express Delivery & Bespoke Blouse Tailoring on all Orders.',
    announcement_enabled: 1,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await adminApi.getSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        storeName: settings.store_name,
        tagline: settings.tagline,
        supportEmail: settings.support_email,
        supportPhone: settings.support_phone,
        address: settings.address,
        currency: settings.currency,
        freeShippingThreshold: Number(settings.free_shipping_threshold),
        standardShippingFee: Number(settings.standard_shipping_fee),
        taxPercentage: Number(settings.tax_percentage),
        announcementText: settings.announcement_text,
        announcementEnabled: settings.announcement_enabled ? 1 : 0,
      };

      await adminApi.updateSettings(payload);
      setMessage('Store settings updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Atelier Store Settings & Governance
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Global boutique configuration, support hotline, pan-India logistics thresholds, and tax compliance.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#E8F5E9] border border-[#A5D6A7] text-[#287A52] text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
          <span>✓ {message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif text-base font-bold text-[#4A0715] border-b border-[#F0EBE1] pb-3">
            Atelier Brand & Concierge Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Brand Name</label>
              <input
                type="text"
                value={settings.store_name || ''}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Atelier Tagline</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Concierge Email</label>
              <input
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Concierge Phone / WhatsApp</label>
              <input
                type="text"
                value={settings.support_phone || ''}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#29201E] mb-1">Flagship Boutique Address</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-4 text-xs">
          <h2 className="font-serif text-base font-bold text-[#4A0715] border-b border-[#F0EBE1] pb-3">
            Financial & Shipping Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Complimentary Shipping Threshold (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.free_shipping_threshold || 0}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={settings.standard_shipping_fee || 0}
                onChange={(e) => setSettings({ ...settings, standard_shipping_fee: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#29201E] mb-1">Handloom Silk GST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={settings.tax_percentage || 5.0}
                onChange={(e) => setSettings({ ...settings, tax_percentage: e.target.value })}
                className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#4A0715] hover:bg-[#720F25] text-[#F5EEE5] font-semibold text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Updating Settings...' : 'Save Global Atelier Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

