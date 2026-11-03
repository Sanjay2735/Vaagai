import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReviews(statusFilter);
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      fetchReviews();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await adminApi.deleteReview(id);
      fetchReviews();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Patron Reviews & Testimonials ({reviews.length})
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Review and moderate patron feedback on handloom weave drape, silk texture, and authenticity.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="all">All Reviews</option>
          <option value="approved">Approved & Published</option>
          <option value="pending">Pending Moderation</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-[#B9953B]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rev.rating ? 'text-[#B9953B]' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                  <span className="text-xs font-bold text-[#29201E] ml-1.5">{rev.rating}.0</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                  rev.status === 'approved'
                    ? 'bg-[#E8F5E9] text-[#287A52]'
                    : rev.status === 'pending'
                    ? 'bg-[#FFF8E1] text-[#C58A28]'
                    : 'bg-[#FDE8E8] text-[#C34444]'
                }`}>
                  {rev.status || 'approved'}
                </span>
              </div>

              <h4 className="font-semibold text-xs text-[#29201E] mt-2">
                {rev.title || 'Exquisite Handloom Saree'}
              </h4>
              <p className="text-xs text-[#70594B] mt-1 italic">
                "{rev.comment}"
              </p>

              <div className="mt-3 pt-2 border-t border-[#F0EBE1] text-[11px] text-[#81766E] flex justify-between">
                <span>By <strong className="text-[#29201E]">{rev.author_name}</strong></span>
                <span>{new Date(rev.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#F0EBE1] text-xs">
              {rev.status !== 'approved' && (
                <button
                  onClick={() => handleUpdateStatus(rev.id, 'approved')}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#E8F5E9] text-[#287A52] hover:bg-[#C8E6C9] rounded-md transition-colors"
                >
                  Approve
                </button>
              )}
              {rev.status !== 'rejected' && (
                <button
                  onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#FFF8E1] text-[#C58A28] hover:bg-[#FFE082] rounded-md transition-colors"
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => handleDelete(rev.id)}
                className="px-2.5 py-1 text-xs font-semibold text-[#C34444] hover:bg-[#FDE8E8] rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && !loading && (
          <div className="col-span-2 text-center py-12 text-[#81766E] text-xs">
            No reviews found matching the selected status.
          </div>
        )}
      </div>
    </div>
  );
}

