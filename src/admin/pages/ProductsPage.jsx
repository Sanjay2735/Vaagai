import React, { useState, useEffect } from 'react';
import { adminApi } from '../adminApi';

const CATALOG_PRESET_IMAGES = [
  { name: 'Crimson Mayil Kanjivaram', url: '/src/assests/images/catalog/kanjivaram_crimson_saree_1792474380596.jpg' },
  { name: 'Ivory Aab-e-Zar Swarnachari', url: '/src/assests/images/catalog/ivory_gold_saree_1792474405497.jpg' },
  { name: 'Forest Emerald Shikarghar Brocade', url: '/src/assests/images/catalog/bottle_green_banarasi_1792474427242.jpg' },
  { name: 'Haldi Mustard Vaddanam Kanjivaram', url: '/src/assests/images/catalog/mustard_festive_saree_1792474451533.jpg' },
  { name: 'Gulabi Rose Petal Organza', url: '/src/assests/images/catalog/blush_pink_organza_1792474478789.jpg' },
  { name: 'Midnight Neelambari Tussar', url: '/src/assests/images/catalog/navy_tussar_saree_1792474503287.jpg' },
  { name: 'The Empress Kalamkari Jamdani', url: '/src/assests/images/catalog/royal_purple_saree_1792474526549.jpg' },
  { name: 'Kurinji Chettinad Cotton', url: '/src/assests/images/catalog/handloom_cotton_saree_1792474579643.jpg' },
];

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fabricFilter, setFabricFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    costPrice: '',
    fabric: 'Kanjivaram Silk',
    weave: 'Korvai Handloom',
    zariType: 'Pure 2G Gold Zari',
    borderStyle: 'Traditional Temple Border',
    blouseDetails: 'Includes 0.8m running blouse piece',
    length: '5.5m + 0.8m Blouse',
    origin: 'Kanchipuram, Tamil Nadu',
    careInstructions: 'Strictly Dry Clean Only',
    toneA: 'Deep Crimson',
    toneB: 'Antique Gold',
    imageUrl: CATALOG_PRESET_IMAGES[0].url,
    stock: 10,
    lowStockThreshold: 5,
    status: 'active',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    metaTitle: '',
    metaDescription: '',
    tags: 'saree,handloom,luxury,silk',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        q: search,
        fabric: fabricFilter,
        status: statusFilter,
        stockStatus: stockFilter,
        sort,
      };
      const res = await adminApi.getProducts(params);
      if (res.success) {
        setProducts(res.products || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fabricFilter, statusFilter, stockFilter, sort]);

  // Open modal if URL has ?action=new
  useEffect(() => {
    if (window.location.hash.includes('action=new')) {
      handleOpenCreate();
    }
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `VAG-${Math.floor(100 + Math.random() * 900)}`,
      slug: '',
      description: '',
      price: '',
      originalPrice: '',
      costPrice: '',
      fabric: 'Kanjivaram Silk',
      weave: 'Korvai Handloom',
      zariType: 'Pure 2G Gold Zari',
      borderStyle: 'Traditional Temple Border',
      blouseDetails: 'Includes 0.8m running blouse piece',
      length: '5.5m + 0.8m Blouse (48 in width)',
      origin: 'Kanchipuram, Tamil Nadu',
      careInstructions: 'Strictly Dry Clean Only',
      toneA: '#720F25',
      toneB: '#C9A43B',
      imageUrl: CATALOG_PRESET_IMAGES[0].url,
      stock: 10,
      lowStockThreshold: 5,
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      metaTitle: '',
      metaDescription: '',
      tags: 'saree,handloom,luxury,silk',
    });
    setActiveTab('general');
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      sku: prod.sku || '',
      slug: prod.slug || '',
      description: prod.description || '',
      price: prod.price || '',
      originalPrice: prod.original_price || '',
      costPrice: prod.cost_price || '',
      fabric: prod.fabric || 'Kanjivaram Silk',
      weave: prod.weave || 'Korvai Handloom',
      zariType: prod.zari_type || 'Pure 2G Gold Zari',
      borderStyle: prod.border_style || 'Traditional Temple Border',
      blouseDetails: prod.blouse_details || 'Includes 0.8m running blouse piece',
      length: prod.length || '5.5m + 0.8m Blouse',
      origin: prod.origin || 'Kanchipuram, Tamil Nadu',
      careInstructions: prod.care_instructions || 'Strictly Dry Clean Only',
      toneA: prod.tone_a || '#720F25',
      toneB: prod.tone_b || '#C9A43B',
      imageUrl: prod.image_url || '',
      stock: prod.stock || 0,
      lowStockThreshold: prod.low_stock_threshold || 5,
      status: prod.status || 'active',
      isFeatured: Boolean(prod.is_featured),
      isNewArrival: Boolean(prod.is_new_arrival),
      isBestSeller: Boolean(prod.is_best_seller),
      metaTitle: prod.meta_title || '',
      metaDescription: prod.meta_description || '',
      tags: prod.tags || '',
    });
    setActiveTab('general');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.fabric) {
      alert('Product title, price, and fabric are required fields.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
      };

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to save saree.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the atelier catalog?`)) {
      return;
    }
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Delete failed.');
    }
  };

  const handleBulkAction = async (action, val = null) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Apply bulk ${action} to ${selectedIds.length} sarees?`)) return;

    try {
      await adminApi.bulkUpdateProducts(selectedIds, action, val);
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Bulk update failed.');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4A0715] tracking-wide">
            Product Management ({total} Sarees)
          </h1>
          <p className="text-xs text-[#81766E] mt-1">
            Curate South Indian handloom drapes, technical weave specs, inventory levels, and pricing.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#4A0715] text-[#F5EEE5] hover:bg-[#720F25] text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 text-[#C9A43B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Saree</span>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search by title, SKU, fabric, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B9953B] text-[#29201E]"
          />
          <svg className="w-4 h-4 text-[#81766E] absolute left-2.5 top-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Fabric filter */}
        <select
          value={fabricFilter}
          onChange={(e) => setFabricFilter(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="">All Fabrics</option>
          <option value="Kanjivaram">Kanjivaram Silk</option>
          <option value="Banarasi">Banarasi Brocade</option>
          <option value="Organza">Organza & Chanderi</option>
          <option value="Tussar">Tussar Heritage</option>
          <option value="Kalakaari">Royal Kalakaari</option>
          <option value="Cotton">Handloom Cotton</option>
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="all">All Inventory</option>
          <option value="in_stock">In Stock (&gt; 5)</option>
          <option value="low_stock">Low Stock (1-5)</option>
          <option value="out_of_stock">Out of Stock (0)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="all">All Status</option>
          <option value="active">Active Drapes</option>
          <option value="draft">Drafts</option>
          <option value="archived">Archived</option>
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#B9953B]"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="stock_asc">Stock: Low to High</option>
          <option value="stock_desc">Stock: High to Low</option>
        </select>

        <button
          onClick={fetchProducts}
          className="px-3 py-1.5 text-xs bg-[#F5EEE5] hover:bg-[#E9D9BF] text-[#4A0715] font-semibold rounded-lg transition-colors border border-[#E8E2D9]"
        >
          Filter
        </button>
      </div>

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-[#4A0715] text-[#F5EEE5] p-3 rounded-xl shadow-md flex items-center justify-between animate-fadeIn text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold">{selectedIds.length} sarees selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('status', 'active')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md font-medium"
            >
              Publish Active
            </button>
            <button
              onClick={() => handleBulkAction('status', 'draft')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md font-medium"
            >
              Move to Draft
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-2.5 py-1 bg-[#C34444] hover:bg-[#A83232] rounded-md font-medium"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F1] text-[#81766E] uppercase tracking-wider text-[10px] border-b border-[#E8E2D9]">
              <tr>
                <th className="py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Saree Drape</th>
                <th className="py-3 px-4 font-semibold">SKU / Code</th>
                <th className="py-3 px-4 font-semibold">Fabric & Weave</th>
                <th className="py-3 px-4 font-semibold">Patron Price</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F5F1]">
              {products.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-[#FDFBF7] transition-colors ${isSelected ? 'bg-[#F5EEE5]/40' : ''}`}>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-12 object-cover rounded-md border border-[#E8E2D9] flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-[#29201E] line-clamp-1">{p.name}</p>
                          <div className="flex items-center space-x-1 mt-0.5">
                            {Boolean(p.is_featured) && (
                              <span className="text-[9px] bg-[#B9953B]/10 text-[#B9953B] font-bold px-1.5 py-0.2 rounded">
                                Featured
                              </span>
                            )}
                            {Boolean(p.is_new_arrival) && (
                              <span className="text-[9px] bg-[#4A0715]/10 text-[#4A0715] font-bold px-1.5 py-0.2 rounded">
                                New
                              </span>
                            )}
                            {Boolean(p.is_best_seller) && (
                              <span className="text-[9px] bg-[#287A52]/10 text-[#287A52] font-bold px-1.5 py-0.2 rounded">
                                Best Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#70594B]">
                      {p.sku || `VAG-${p.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#29201E]">{p.fabric}</p>
                      <p className="text-[10px] text-[#81766E]">{p.weave || 'Handloom'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#29201E]">₹{Number(p.price).toLocaleString('en-IN')}</p>
                      {p.original_price && (
                        <p className="text-[10px] text-[#81766E] line-through">₹{Number(p.original_price).toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.stock === 0
                          ? 'bg-[#FDE8E8] text-[#C34444]'
                          : p.stock <= (p.low_stock_threshold || 5)
                          ? 'bg-[#FFF8E1] text-[#C58A28]'
                          : 'bg-[#E8F5E9] text-[#287A52]'
                      }`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} drapes`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                        p.status === 'active'
                          ? 'bg-[#E8F5E9] text-[#287A52]'
                          : p.status === 'draft'
                          ? 'bg-[#F5EEE5] text-[#70594B]'
                          : 'bg-[#FDE8E8] text-[#C34444]'
                      }`}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-[#70594B] hover:text-[#4A0715] hover:bg-[#F5EEE5] rounded-md transition-colors"
                          title="Edit Saree Specifications"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1 text-[#C34444] hover:bg-[#FDE8E8] rounded-md transition-colors"
                          title="Delete Saree"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-[#81766E]">
                    No sarees match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MULTI-TAB ADD / EDIT SAREE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E8E2D9] animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between bg-[#FDFBF7] rounded-t-2xl">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A0715]">
                  {editingProduct ? `Edit Saree: ${editingProduct.name}` : 'Curate New Saree Drape'}
                </h3>
                <p className="text-[11px] text-[#81766E]">
                  Complete technical specifications, artisan craft lineage, and pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#81766E] hover:text-[#4A0715] p-1.5 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 border-b border-[#E8E2D9] bg-[#F7F5F1] flex space-x-6 text-xs font-semibold overflow-x-auto">
              {[
                { id: 'general', label: '1. Identity & Story' },
                { id: 'specs', label: '2. Weave Specifications' },
                { id: 'pricing', label: '3. Pricing & Stock' },
                { id: 'media', label: '4. Visual Assets' },
                { id: 'badges', label: '5. Badges & Status' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#4A0715] text-[#4A0715] font-bold'
                      : 'border-transparent text-[#81766E] hover:text-[#29201E]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                      Saree Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. The Crimson Mayil Kanjivaram"
                      className="w-full px-3.5 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        SKU Code
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="VAG-KAN-001"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="crimson-mayil-kanjivaram"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                      Artisan Craft Story & Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the weaving heritage, motifs, loom techniques, and drape feel..."
                      className="w-full px-3.5 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL SPECS */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Fabric Craft *
                      </label>
                      <select
                        value={formData.fabric}
                        onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      >
                        <option value="Kanjivaram Silk">Kanjivaram Silk</option>
                        <option value="Banarasi Brocade">Banarasi Brocade</option>
                        <option value="Pure Kora Organza">Pure Kora Organza</option>
                        <option value="Raw Tussar Silk">Raw Tussar Silk</option>
                        <option value="Kalakaari Handloom Silk">Kalakaari Handloom Silk</option>
                        <option value="Chettinad Cotton">Chettinad Cotton</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Weave Technique
                      </label>
                      <input
                        type="text"
                        value={formData.weave}
                        onChange={(e) => setFormData({ ...formData, weave: e.target.value })}
                        placeholder="Korvai Handloom, Kadwa, Jamdani..."
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Zari Quality
                      </label>
                      <input
                        type="text"
                        value={formData.zariType}
                        onChange={(e) => setFormData({ ...formData, zariType: e.target.value })}
                        placeholder="Pure 2G Gold Zari, Tested Antique Zari..."
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Border Styling
                      </label>
                      <input
                        type="text"
                        value={formData.borderStyle}
                        onChange={(e) => setFormData({ ...formData, borderStyle: e.target.value })}
                        placeholder="Traditional Temple Border, Ganga-Jamuna..."
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Blouse Piece Specification
                      </label>
                      <input
                        type="text"
                        value={formData.blouseDetails}
                        onChange={(e) => setFormData({ ...formData, blouseDetails: e.target.value })}
                        placeholder="Includes 0.8m running contrast silk blouse..."
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Saree Dimensions
                      </label>
                      <input
                        type="text"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        placeholder="5.5m + 0.8m Blouse (48 in width)"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Loom Origin
                      </label>
                      <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="Kanchipuram, Tamil Nadu"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Patron Care Instructions
                      </label>
                      <input
                        type="text"
                        value={formData.careInstructions}
                        onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                        placeholder="Strictly Dry Clean Only"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & STOCK */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Patron Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="48500"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] font-semibold focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Original MRP (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="56000"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Atelier Cost (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        placeholder="28000"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Inventory Stock (Units)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="10"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                        placeholder="5"
                        className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                      Primary Saree Photo URL
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://... or /src/assests/images/catalog/..."
                      className="w-full px-3.5 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="flex items-center space-x-4 p-3 bg-[#F7F5F1] rounded-xl border border-[#E8E2D9]">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-16 h-20 object-cover rounded-lg border border-[#C9A43B]/40 shadow-xs"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-[#29201E]">Live Photo Preview</p>
                        <p className="text-[11px] text-[#81766E] break-all">{formData.imageUrl}</p>
                      </div>
                    </div>
                  )}

                  {/* Preset catalog image selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#81766E] uppercase tracking-wider mb-2">
                      Or Choose from Atelier Vault Assets:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {CATALOG_PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
                            formData.imageUrl === preset.url
                              ? 'border-[#4A0715] ring-2 ring-[#B9953B]/50'
                              : 'border-transparent hover:border-[#B9953B]'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-16 object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BADGES & STATUS */}
              {activeTab === 'badges' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#29201E] uppercase tracking-wider mb-1">
                      Visibility Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#F7F5F1] border border-[#E8E2D9] rounded-lg text-[#29201E] focus:outline-none focus:border-[#B9953B]"
                    >
                      <option value="active">Active (Visible to patrons)</option>
                      <option value="draft">Draft (Hidden in store)</option>
                      <option value="archived">Archived (Discontinued)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-[#F7F5F1] rounded-xl border border-[#E8E2D9] space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                      />
                      <span className="text-xs font-medium text-[#29201E]">Feature in Runway & Highlights</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNewArrival}
                        onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                        className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                      />
                      <span className="text-xs font-medium text-[#29201E]">Mark as New Arrival Drape</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBestSeller}
                        onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                        className="rounded border-[#E8E2D9] text-[#4A0715] focus:ring-0"
                      />
                      <span className="text-xs font-medium text-[#29201E]">Mark as Patron Best Seller</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#81766E] hover:text-[#29201E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-[#F5EEE5] bg-[#4A0715] hover:bg-[#720F25] rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Preserving...' : editingProduct ? 'Save Saree Changes' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

