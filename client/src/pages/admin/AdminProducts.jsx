import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Loader, Pagination } from '../../components/ui/UI';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const emptyForm = { name: '', category_id: '', price: '', discount_price: '', stock: '', brand: '', sku: '', description: '', is_featured: false, is_active: true };

const ProductModal = ({ product, categories, onClose, onSaved }) => {
  const [form, setForm] = useState(product ? {
    name: product.name || '',
    category_id: product.category_id || '',
    price: product.price || '',
    discount_price: product.discount_price || '',
    stock: product.stock || '',
    brand: product.brand || '',
    sku: product.sku || '',
    description: product.description || '',
    is_featured: !!product.is_featured,
    is_active: product.is_active !== 0,
  } : emptyForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setCheck = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category_id || !form.price || form.stock === '') {
      toast.error('Name, category, price and stock are required'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      if (product) {
        await productAPI.update(product.id, fd);
        toast.success('Product updated');
      } else {
        await productAPI.create(fd);
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name <span>*</span></label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. iPhone 15 Pro" required />
            </div>
            <div className="form-group">
              <label className="form-label">Category <span>*</span></label>
              <select className="form-input form-select" value={form.category_id} onChange={set('category_id')} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) <span>*</span></label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Price (₹)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.discount_price} onChange={set('discount_price')} placeholder="Optional" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock <span>*</span></label>
              <input className="form-input" type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" required />
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input className="form-input" value={form.brand} onChange={set('brand')} placeholder="e.g. Apple" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-input" value={form.sku} onChange={set('sku')} placeholder="e.g. APPL-IP15P-001" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={form.description} onChange={set('description')} placeholder="Product description..." />
          </div>
          <div className="form-group">
            <label className="form-label">Images (max 5)</label>
            <input type="file" accept="image/*" multiple className="form-input" onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))} />
            {images.length > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{images.length} file(s) selected</span>}
          </div>
          <div className="form-row" style={{ gap: 24 }}>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.is_featured} onChange={setCheck('is_featured')} />
              <span>Featured Product</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.is_active} onChange={setCheck('is_active')} />
              <span>Active (visible to customers)</span>
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAdminAll({ page, limit: 15, search: search || undefined });
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
    categoryAPI.getAll().then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will hide it from the store.`)) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete product'); }
    finally { setDeleting(null); }
  };

  const handleSaved = () => { setModal(null); fetchProducts(); };
  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(); };

  return (
    <div className="admin-page">
      {modal !== null && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalogue</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      <div className="admin-toolbar">
        <form className="admin-search-form" onSubmit={handleSearch}>
          <input
            className="form-input"
            placeholder="Search by name, brand or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <span className="admin-count">{total} products</span>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>No products found</td></tr>
                  ) : products.map((p) => {
                    const imgs = p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [];
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="product-cell">
                            <div className="product-thumb">
                              {imgs[0]
                                ? <img src={`${UPLOADS}/products/${imgs[0]}`} alt={p.name} />
                                : <span>🛍️</span>
                              }
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{p.name}</div>
                              {p.brand && <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.brand}</div>}
                              {p.sku && <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>SKU: {p.sku}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{p.category_name}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>₹{parseFloat(p.discount_price || p.price).toLocaleString('en-IN')}</div>
                          {p.discount_price && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</div>}
                        </td>
                        <td>
                          <span className={`badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 10 ? 'badge-warning' : 'badge-success'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`badge ${p.is_active ? 'badge-success' : 'badge-gray'}`}>{p.is_active ? 'Active' : 'Hidden'}</span>
                            {p.is_featured ? <span className="badge badge-warning">Featured</span> : null}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => setModal(p)}>
                              <FiEdit2 size={13} /> Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(p.id, p.name)}
                              disabled={deleting === p.id}
                            >
                              <FiTrash2 size={13} /> {deleting === p.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminProducts;
