import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchReturns = async (statusFilter) => {
    setLoading(true);
    try {
      const res = await adminApi.getReturns(statusFilter === 'all' ? '' : statusFilter);
      if (res.success) {
        setReturns(res.returns || []);
      }
    } catch (err) {
      console.error('Failed to load returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns(filter);
  }, [filter]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedReturn) return;
    setProcessing(true);
    try {
      const res = await adminApi.updateReturnStatus(selectedReturn.id, {
        status: newStatus,
        adminNotes: adminNotes || selectedReturn.admin_notes,
        refundAmount: selectedReturn.refund_amount,
      });

      if (res.success) {
        alert(`Return status updated to ${newStatus}.`);
        setSelectedReturn(null);
        setAdminNotes('');
        fetchReturns(filter);
      } else {
        alert(res.message || 'Failed to update return status.');
      }
    } catch (err) {
      alert(err.message || 'Operation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'refund_completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#287A52] border border-[#C8E6C9]">Refund Completed</span>;
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F2FD] text-[#1E88E5] border border-[#BBDEFB]">Approved</span>;
      case 'item_received':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E5F5] text-[#8E24AA] border border-[#E1BEE7]">Item Received</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBEE] text-[#C34444] border border-[#FFCDD2]">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E1] text-[#C58A28] border border-[#FFE082]">Action Needed</span>;
    }
  };

  const pendingCount = returns.filter(r => r.status === 'requested').length;
  const inspectedCount = returns.filter(r => r.status === 'item_received').length;
  const refundedCount = returns.filter(r => r.status === 'refund_completed').length;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Returns & Refund Management
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Review customer return inquiries, manage inspection protocol, and process verified refunds.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[#70594B] uppercase tracking-wider">Status:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] text-[#29201E] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B] font-medium"
          >
            <option value="all">All Returns</option>
            <option value="requested">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="item_received">Item Received</option>
            <option value="refund_completed">Refund Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Pending Review</span>
          <p className="font-serif text-2xl font-bold text-[#C58A28] mt-1">{pendingCount}</p>
          <span className="text-[10px] text-[#81766E] mt-1 block">Awaiting curator decision</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">In Atelier Inspection</span>
          <p className="font-serif text-2xl font-bold text-[#70594B] mt-1">{inspectedCount}</p>
          <span className="text-[10px] text-[#81766E] mt-1 block">Weave quality verification</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#81766E]">Completed Refunds</span>
          <p className="font-serif text-2xl font-bold text-[#287A52] mt-1">{refundedCount}</p>
          <span className="text-[10px] text-[#81766E] mt-1 block">Disbursed to patrons</span>
        </div>
      </div>

      {/* RETURNS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Return Ref</th>
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Patron</th>
                <th className="py-3 px-4 font-semibold">Saree Drape</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
                <th className="py-3 px-4 font-semibold">Refund (₹)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F1]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#81766E]">
                    Loading returns queue...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#81766E]">
                    ✓ No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4A0715]">
                      #RET-{ret.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#70594B]">
                      #{ret.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#29201E]">{ret.customer_name}</p>
                      <p className="text-[10px] text-[#81766E]">{ret.customer_email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#29201E] max-w-xs truncate">
                      {ret.product_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#81766E]">
                      <span className="font-medium text-[#29201E] block">{ret.reason}</span>
                      {ret.description && (
                        <span className="text-[10px] text-[#81766E] line-clamp-1 italic">{ret.description}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#4A0715]">
                      ₹{Number(ret.refund_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ret.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReturn(ret);
                          setAdminNotes(ret.admin_notes || '');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#4A0715] hover:bg-[#720F25] text-white rounded-lg transition-colors"
                      >
                        Review Protocol →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A0715]">
                  Return Protocol: #RET-{selectedReturn.id}
                </h3>
                <p className="text-xs text-[#81766E]">
                  Order <span className="font-mono text-[#4A0715]">#{selectedReturn.order_number}</span> by {selectedReturn.customer_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                className="text-[#81766E] hover:text-[#29201E] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F7F5F1] p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#81766E]">Product:</span>
                <span className="font-bold text-[#29201E]">{selectedReturn.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#81766E]">Claim Reason:</span>
                <span className="font-semibold text-[#4A0715]">{selectedReturn.reason}</span>
              </div>
              {selectedReturn.description && (
                <div className="pt-1 border-t border-[#E8E2D9]">
                  <span className="text-[#81766E] block mb-0.5">Patron Explanation:</span>
                  <p className="italic text-[#29201E]">{selectedReturn.description}</p>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-[#E8E2D9]">
                <span className="text-[#81766E]">Refund Calculation:</span>
                <span className="font-serif text-sm font-bold text-[#4A0715]">
                  ₹{Number(selectedReturn.refund_amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#29201E] mb-1">
                Atelier Internal Notes:
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Inspection results, courier pickup notes..."
                className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
              />
            </div>

            {/* Protocol Action Triggers */}
            <div className="space-y-2 pt-2 border-t border-[#F0EBE1]">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#81766E] block">
                Workflow Transitions:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={processing || selectedReturn.status === 'approved'}
                  onClick={() => handleUpdateStatus('approved')}
                  className="px-3 py-2 text-xs font-semibold bg-[#E3F2FD] text-[#1E88E5] hover:bg-[#BBDEFB] rounded-lg transition-colors disabled:opacity-50"
                >
                  ✓ Approve Return
                </button>
                <button
                  type="button"
                  disabled={processing || selectedReturn.status === 'item_received'}
                  onClick={() => handleUpdateStatus('item_received')}
                  className="px-3 py-2 text-xs font-semibold bg-[#F3E5F5] text-[#8E24AA] hover:bg-[#E1BEE7] rounded-lg transition-colors disabled:opacity-50"
                >
                  📦 Mark Received & Inspected
                </button>
                <button
                  type="button"
                  disabled={processing || selectedReturn.status === 'refund_completed'}
                  onClick={() => handleUpdateStatus('refund_completed')}
                  className="px-3 py-2 text-xs font-semibold bg-[#E8F5E9] text-[#287A52] hover:bg-[#C8E6C9] rounded-lg transition-colors col-span-2 disabled:opacity-50"
                >
                  💳 Complete Refund (₹{Number(selectedReturn.refund_amount).toLocaleString('en-IN')})
                </button>
                <button
                  type="button"
                  disabled={processing || selectedReturn.status === 'rejected'}
                  onClick={() => handleUpdateStatus('rejected')}
                  className="px-3 py-2 text-xs font-semibold bg-[#FFEBEE] text-[#C34444] hover:bg-[#FFCDD2] rounded-lg transition-colors col-span-2 disabled:opacity-50"
                >
                  ✕ Reject Return Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

