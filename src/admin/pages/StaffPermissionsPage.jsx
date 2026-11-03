import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function StaffPermissionsPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('support');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStaff();
      if (res.success) {
        setStaff(res.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSaving(true);
    try {
      await adminApi.createStaff({ name, email, password, role, phone });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member) => {
    try {
      await adminApi.updateStaff(member.id, { isActive: member.is_active ? 0 : 1 });
      fetchStaff();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = async (id, staffName) => {
    if (!window.confirm(`Remove staff access for "${staffName}"?`)) return;
    try {
      await adminApi.deleteStaff(id);
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Staff & Role-Based Access Control ({staff.length})
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Manage atelier curator privileges, fulfillment managers, and support staff access.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25] text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          + Add Staff Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
              <tr>
                <th className="py-3 px-4 font-semibold">Staff Member</th>
                <th className="py-3 px-4 font-semibold">Contact Email & Phone</th>
                <th className="py-3 px-4 font-semibold">Administrative Role</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F1]">
              {staff.map((m) => (
                <tr key={m.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#4A0715] text-[#C9A43B] font-serif font-bold text-xs flex items-center justify-center">
                        {m.name ? m.name.charAt(0) : 'S'}
                      </div>
                      <span className="font-semibold text-[#29201E]">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[#29201E]">{m.email}</p>
                    <p className="text-[10px] text-[#81766E]">{m.phone || 'No phone'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5EEE5] text-[#4A0715] border border-[#E8E2D9] capitalize">
                      {m.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      m.is_active ? 'bg-[#E8F5E9] text-[#287A52]' : 'bg-[#FDE8E8] text-[#C34444]'
                    }`}>
                      {m.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(m)}
                        className="text-[11px] font-semibold text-[#70594B] hover:text-[#4A0715]"
                      >
                        {m.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="text-[11px] font-semibold text-[#C34444] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#4A0715]">
              Add Team Member
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Meenakshi Sundaram"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="curator@vaagai.com"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Administrative Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                >
                  <option value="super_admin">Super Admin (Full Atelier Control)</option>
                  <option value="product_manager">Product Curator (Products, Categories, Inventory)</option>
                  <option value="order_manager">Order Fulfillment (Orders, Customers, Shipments)</option>
                  <option value="content_manager">Content Editor (Homepage CMS, Reviews)</option>
                  <option value="support">Support Staff (Read-Only Assistance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98400 12345"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
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
                  {saving ? 'Creating...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

