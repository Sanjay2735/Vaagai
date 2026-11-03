import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'logs'
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [changeAmount, setChangeAmount] = useState(5);
  const [adjustReason, setAdjustReason] = useState('restock');
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getInventory({ q: search, stockFilter });
      if (res.success) {
        setProducts(res.products || []);
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await adminApi.getInventoryLogs();
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchInventory();
    } else {
      fetchLogs();
    }
  }, [activeTab, stockFilter]);

  const handleOpenAdjust = (prod) => {
    setAdjustingProduct(prod);
    setChangeAmount(5);
    setAdjustReason('restock');
    setCustomNote('');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setSubmitting(true);
    try {
      const reasonText = customNote ? `${adjustReason}: ${customNote}` : adjustReason;
      await adminApi.adjustInventory(adjustingProduct.id, changeAmount, reasonText);
      setAdjustingProduct(null);
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Stock adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDelta = async (prod, delta) => {
    try {
      await adminApi.adjustInventory(
        prod.id,
        delta,
        delta > 0 ? 'Quick +1 Restock' : 'Quick -1 Atelier Adjustment'
      );
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Atelier Inventory & Stock Control
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Real-time physical stock counts, weaver restock tracking, valuation, and movement audit logs.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex p-1 bg-[#F7F5F1] rounded-xl border border-[#E8E2D9]">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'stock'
                ? 'bg-white text-[#4A0715] shadow-xs'
                : 'text-[#81766E] hover:text-[#29201E]'
            }`}
          >
            Live Stock Table
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-[#4A0715] shadow-xs'
                : 'text-[#81766E] hover:text-[#29201E]'
            }`}
          >
            Movement Audit Trail
          </button>
        </div>
      </div>

      {/* INVENTORY VALUATION KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#81766E]">Total Physical Units</span>
          <p className="font-serif text-2xl font-bold text-[#4A0715] mt-1">{stats.total_units || 0}</p>
          <span className="text-[10px] text-[#81766E]">Across all atelier drapes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#81766E]">Retail Valuation</span>
          <p className="font-serif text-xl font-bold text-[#29201E] mt-1">
            ₹{Number(stats.total_retail_value || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#287A52]">At catalog price</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#81766E]">Atelier Loom Cost</span>
          <p className="font-serif text-xl font-bold text-[#70594B] mt-1">
            ₹{Number(stats.total_cost_value || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#81766E]">Production investment</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#81766E]">Low Stock Warnings</span>
          <p className="font-serif text-2xl font-bold text-[#C58A28] mt-1">{stats.low_count || 0}</p>
          <span className="text-[10px] text-[#C58A28]">≤ 5 units left</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#81766E]">Out of Stock</span>
          <p className="font-serif text-2xl font-bold text-[#C34444] mt-1">{stats.out_count || 0}</p>
          <span className="text-[10px] text-[#81766E]">Needs weaver commission</span>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* TOOLBAR */}
          <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Search stock by saree name, SKU, fabric..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
                className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B9953B] text-[#29201E]"
              />
              <svg className="w-4 h-4 text-[#81766E] absolute left-2.5 top-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
            >
              <option value="all">All Levels</option>
              <option value="healthy">Healthy Stock (&gt; 5)</option>
              <option value="low">Low Stock Alerts (1-5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            <button
              onClick={fetchInventory}
              className="px-3 py-1.5 text-xs bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-semibold rounded-lg transition-colors border border-[#E8E2D9]"
            >
              Filter
            </button>
          </div>

          {/* STOCK TABLE */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Saree Drape</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold">Fabric</th>
                    <th className="py-3 px-4 font-semibold">Retail Price</th>
                    <th className="py-3 px-4 font-semibold">Atelier Cost</th>
                    <th className="py-3 px-4 font-semibold">Available Units</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F5F1]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-12 object-cover rounded-md border border-[#E8E2D9]"
                          />
                          <div>
                            <p className="font-semibold text-[#29201E] line-clamp-1">{p.name}</p>
                            <span className="text-[10px] text-[#81766E]">Threshold: {p.low_stock_threshold || 5} units</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[#70594B]">
                        {p.sku || `VAG-${p.id}`}
                      </td>
                      <td className="py-3 px-4 text-[#29201E]">{p.fabric}</td>
                      <td className="py-3 px-4 font-semibold text-[#29201E]">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-[#81766E]">
                        ₹{Number(p.cost_price || p.price * 0.5).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuickDelta(p, -1)}
                            disabled={p.stock <= 0}
                            className="w-6 h-6 rounded-md bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className={`w-8 text-center font-bold font-mono text-sm ${
                            p.stock === 0 ? 'text-[#C34444]' : p.stock <= 5 ? 'text-[#C58A28]' : 'text-[#287A52]'
                          }`}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleQuickDelta(p, 1)}
                            className="w-6 h-6 rounded-md bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-bold flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.stock === 0
                            ? 'bg-[#FDE8E8] text-[#C34444]'
                            : p.stock <= 5
                            ? 'bg-[#FFF8E1] text-[#C58A28]'
                            : 'bg-[#E8F5E9] text-[#287A52]'
                        }`}>
                          {p.stock === 0 ? 'Depleted' : p.stock <= 5 ? 'Low Alert' : 'Available'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#F5EEE5] text-[#4A0715] hover:bg-[#4A0715] hover:text-[#F5EEE5] rounded-md transition-colors border border-[#E8E2D9]"
                        >
                          Adjust Units
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* AUDIT LOGS VIEW */
        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#F0EBE1] flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-[#4A0715]">
              Stock Movement Audit Trail
            </h2>
            <button
              onClick={fetchLogs}
              className="text-xs text-[#B9953B] hover:text-[#4A0715] font-medium"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Saree Drape</th>
                  <th className="py-3 px-4 font-semibold">Change</th>
                  <th className="py-3 px-4 font-semibold">Stock Shift</th>
                  <th className="py-3 px-4 font-semibold">Operational Reason</th>
                  <th className="py-3 px-4 font-semibold">Authorized Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F1]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#81766E]">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#29201E]">
                      {log.product_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-mono font-bold ${
                        log.change_amount > 0 ? 'text-[#287A52]' : 'text-[#C34444]'
                      }`}>
                        {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#70594B]">
                      {log.previous_stock} → <span className="font-bold text-[#29201E]">{log.new_stock}</span>
                    </td>
                    <td className="py-3 px-4 text-[#29201E]">{log.reason}</td>
                    <td className="py-3 px-4 font-medium text-[#70594B]">{log.admin_user}</td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-[#81766E]">
                      No recorded stock adjustments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADJUSTMENT MODAL */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#4A0715]">
                Adjust Saree Inventory
              </h3>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="text-[#81766E] hover:text-[#4A0715]"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#29201E]">{adjustingProduct.name}</p>
              <p className="text-[11px] text-[#81766E]">Current Atelier Stock: <span className="font-bold text-[#4A0715]">{adjustingProduct.stock} units</span></p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#29201E] mb-1">
                  Change Units (+ or -)
                </label>
                <input
                  type="number"
                  required
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. 5 or -2"
                  className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-semibold focus:outline-none focus:border-[#B9953B]"
                />
                <span className="text-[10px] text-[#81766E] mt-0.5 block">
                  Resulting Stock: {Math.max(0, adjustingProduct.stock + Number(changeAmount))} units
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29201E] mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                >
                  <option value="Weaver Restock from Workshop">Weaver Restock from Workshop</option>
                  <option value="Physical Loom Inventory Count">Physical Loom Inventory Count</option>
                  <option value="Defect / Damaged Silk Removed">Defect / Damaged Silk Removed</option>
                  <option value="Patron Exchange / Return">Patron Exchange / Return</option>
                  <option value="VIP Bespoke Reservation">VIP Bespoke Reservation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29201E] mb-1">
                  Optional Staff Note
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Batch #KCH-892 received from master weaver"
                  className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-3 py-1.5 text-xs text-[#81766E] hover:text-[#29201E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-[#F5EEE5] bg-[#4A0715] hover:bg-[#720F25] rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Apply Stock Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

