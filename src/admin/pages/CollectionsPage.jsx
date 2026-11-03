import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCollections();
      if (res.success) {
        setCollections(res.collections || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleOpenCreate = () => {
    setEditingCol(null);
    setTitle('');
    setSlug('');
    setSubtitle('');
    setDescription('');
    setBannerUrl('/src/assests/images/banner/banner-1.png');
    setIsFeatured(false);
    setDisplayOrder(collections.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingCol(col);
    setTitle(col.title || '');
    setSlug(col.slug || '');
    setSubtitle(col.subtitle || '');
    setDescription(col.description || '');
    setBannerUrl(col.banner_url || '');
    setIsFeatured(Boolean(col.is_featured));
    setDisplayOrder(col.display_order || 0);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subtitle,
        description,
        bannerUrl,
        isFeatured,
        displayOrder: Number(displayOrder),
      };

      if (editingCol) {
        await adminApi.updateCollection(editingCol.id, payload);
      } else {
        await adminApi.createCollection(payload);
      }
      setModalOpen(false);
      fetchCollections();
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, colTitle) => {
    if (!window.confirm(`Delete collection "${colTitle}"?`)) return;
    try {
      await adminApi.deleteCollection(id);
      fetchCollections();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Curated Editorial Collections ({collections.length})
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Curate thematic seasonal capsules, bridal sanctuaries, and runway edits.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25] text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          + New Capsule Collection
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {collections.map((col) => (
          <div key={col.id} className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-xs flex flex-col">
            <div className="h-48 relative bg-[#29201E] overflow-hidden">
              <img
                src={col.banner_url || '/src/assests/images/banner/banner-1.png'}
                alt={col.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] text-[#C9A43B] font-mono tracking-wider uppercase font-semibold">
                  {col.subtitle || 'Editorial Edit'}
                </span>
                <h3 className="font-serif text-lg font-bold">{col.title}</h3>
              </div>
              {Boolean(col.is_featured) && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#C9A43B] text-[#4A0715] text-[10px] font-bold rounded-full shadow-xs">
                  ★ Featured on Homepage
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#70594B]">{col.description}</p>
              <div className="flex justify-between items-center pt-4 mt-3 border-t border-[#F0EBE1] text-xs">
                <span className="font-mono text-[10px] text-[#81766E]">Order #{col.display_order}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenEdit(col)}
                    className="px-2.5 py-1 text-[#4A0715] hover:bg-[#F5EEE5] rounded-md font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(col.id, col.title)}
                    className="px-2.5 py-1 text-[#C34444] hover:bg-[#FDE8E8] rounded-md font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D9] space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#4A0715]">
              {editingCol ? 'Edit Collection' : 'Create Capsule Collection'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Collection Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Royal Bridal Sanctuary"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Subtitle / Lineage</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Heirloom Kanjivaram Weaves"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="/src/assests/images/banner/..."
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Editorial Narrative</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the aesthetic mood, occasion, and silk artistry..."
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featCol"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                />
                <label htmlFor="featCol" className="font-medium text-[#29201E]">Feature prominently on storefront portal</label>
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
                  {saving ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

