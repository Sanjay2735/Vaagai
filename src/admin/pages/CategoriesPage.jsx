import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg');
    setDisplayOrder(categories.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setDisplayOrder(cat.display_order || 0);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        imageUrl,
        displayOrder: Number(displayOrder),
      };

      if (editingCat) {
        await adminApi.updateCategory(editingCat.id, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Saree Categories & Crafts ({categories.length})
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Organize South Indian handloom weaves, silk traditions, and craft classifications.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25] text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          + New Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-xs flex flex-col">
            <div className="h-40 relative bg-[#F7F5F1] overflow-hidden">
              <img
                src={cat.image_url || '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg'}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#4A0715]/80 backdrop-blur-xs text-[#F5EEE5] font-mono text-[10px] rounded-full">
                Order #{cat.display_order}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#4A0715]">{cat.name}</h3>
                <p className="text-[10px] text-[#B9953B] font-mono mt-0.5">slug: {cat.slug}</p>
                <p className="text-xs text-[#70594B] mt-2 line-clamp-2">{cat.description || 'Artisanal handloom saree category.'}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-4 mt-2 border-t border-[#F0EBE1]">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-2.5 py-1 text-xs text-[#4A0715] hover:bg-[#F5EEE5] rounded-md font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="px-2.5 py-1 text-xs text-[#C34444] hover:bg-[#FDE8E8] rounded-md font-medium"
                >
                  Delete
                </button>
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
              {editingCat ? 'Edit Saree Category' : 'Create Saree Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kanjivaram Silk"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kanjivaram"
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-mono focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/src/assests/images/catalog/..."
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Craft Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the craft lineage, loom count, and characteristics..."
                  className="w-full px-3 py-2 bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#29201E] mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
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
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

