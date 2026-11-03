import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers({ q: search });
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Patron Directory ({customers.length} Clients)
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Registered patrons, high-value clientele, purchasing volume, and delivery locations.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search patrons by name, email, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B9953B] text-[#29201E]"
          />
          <svg className="w-4 h-4 text-[#81766E] absolute left-2.5 top-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={fetchCustomers}
          className="px-3 py-1.5 text-xs bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-semibold rounded-lg transition-colors border border-[#E8E2D9]"
        >
          Search
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Patron Name</th>
                <th className="py-3 px-4 font-semibold">Contact Details</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Orders Count</th>
                <th className="py-3 px-4 font-semibold">Lifetime Spend</th>
                <th className="py-3 px-4 font-semibold">Last Purchase</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F1]">
              {customers.map((c, idx) => (
                <tr key={idx} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#4A0715]/10 text-[#4A0715] font-serif font-bold text-xs flex items-center justify-center">
                        {c.name ? c.name.charAt(0) : 'P'}
                      </div>
                      <span className="font-semibold text-[#29201E]">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[#29201E]">{c.email}</p>
                    <p className="text-[10px] text-[#81766E]">{c.phone || 'No phone'}</p>
                  </td>
                  <td className="py-3 px-4 text-[#70594B]">
                    {c.city ? `${c.city}, ${c.state}` : 'India'}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#29201E]">
                    {c.total_orders} {c.total_orders === 1 ? 'order' : 'orders'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#4A0715]">
                    ₹{Number(c.total_spent).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-[#81766E] text-[11px]">
                    {c.last_order_date
                      ? new Date(c.last_order_date).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#F5EEE5] text-[#4A0715] hover:bg-[#4A0715] hover:text-[#F5EEE5] rounded-md transition-colors border border-[#E8E2D9]"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-[#81766E]">
                    No patrons registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PATRON DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#4A0715]">
                Patron Profile: {selectedCustomer.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-[#81766E] hover:text-[#4A0715]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#F7F5F1] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#81766E]">Email:</span>
                <span className="font-semibold text-[#29201E]">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81766E]">Phone:</span>
                <span className="font-semibold text-[#29201E]">{selectedCustomer.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81766E]">Location:</span>
                <span className="font-semibold text-[#29201E]">{selectedCustomer.city}, {selectedCustomer.state}</span>
              </div>
              <div className="flex justify-between border-t border-[#E8E2D9] pt-2">
                <span className="text-[#81766E]">Total Purchases:</span>
                <span className="font-bold text-[#4A0715]">{selectedCustomer.total_orders} Orders</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81766E]">Lifetime Patron Spend:</span>
                <span className="font-bold text-[#4A0715]">₹{Number(selectedCustomer.total_spent).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#4A0715] hover:bg-[#720F25] rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

