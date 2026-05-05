import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaEdit, FaPlus, FaTrashAlt, FaImage, FaSearch, FaTimes } from 'react-icons/fa';
import * as Yup from 'yup';
import { 
  getInventory, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem 
} from '../../services/inventoryService';
import { getVendors } from '../../services/vendorService';
import { getApiErrorMessage } from '../../services/api';

const inventoryValidationSchema = Yup.object().shape({
  sku: Yup.string().required('SKU is required'),
  name: Yup.string().required('Item name is required'),
  category: Yup.string().required('Category is required'),
  vendor: Yup.string().required('Vendor is required'),
  price: Yup.number().typeError('Must be a number').positive('Price must be greater than 0').required('Price is required'),
  stockQuantity: Yup.number().typeError('Must be a number').min(0, 'Stock cannot be negative').required('Stock is required'),
});

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, venRes] = await Promise.all([
        getInventory(),
        getVendors(1, 1000)
      ]);
      
      if (invRes.success) setItems(invRes.data);
      
      const vData = venRes?.data || venRes?.Data || {};
      const vItems = vData.items || vData.Items || [];
      setVendors(vItems.map(v => ({ id: v.id || v.Id, name: v.companyName || v.CompanyName })));

    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setImagePreview(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setImagePreview(item.imageUrl || null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImagePreview(null);
    setSelectedFile(null);
    setFormKey((prev) => prev + 1);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      setStatus(null);
      setActionLoading(true);
      
      const formData = new FormData();
      formData.append('sku', values.sku);
      formData.append('name', values.name);
      formData.append('category', values.category);
      formData.append('price', values.price);
      formData.append('stockQuantity', values.stockQuantity);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = editingItem
        ? await updateInventoryItem(editingItem.id, formData)
        : await addInventoryItem(formData);

      if (res.success) {
        resetForm();
        handleCloseModal();
        fetchInventory();
      } else {
        setStatus(res.message || 'Failed to save item.');
      }
    } catch (err) {
      setStatus(getApiErrorMessage(err, 'Failed to save item.'));
    } finally {
      setSubmitting(false);
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setActionLoading(true);
        await deleteInventoryItem(id);
        fetchInventory();
      } catch (err) {
        alert('Error deleting item');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const initialValues = useMemo(() => ({
    sku: editingItem?.sku || '',
    name: editingItem?.name || '',
    category: editingItem?.category || '',
    vendor: '',
    price: editingItem?.price || '',
    stockQuantity: editingItem?.stockQuantity || '',
  }), [editingItem]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  return (
    <div className="w-full h-full bg-[#FAFBFF] min-h-screen p-8">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1C2E] mb-2">Inventory Management</h1>
          <p className="text-slate-500 text-sm">Track and manage your auto parts stock levels.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#4887FA] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition shadow-sm"
        >
          <FaPlus className="text-sm" /> Add Item
        </button>
      </div>

      {/* Filters Area */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 relative">
          <FaSearch className="absolute left-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by SKU or name..."
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-600 shadow-sm focus:border-[#4887FA] focus:outline-none focus:ring-2 focus:ring-[#4887FA]/20"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none"
          >
            {[5, 10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
          </select>
          <span>entries</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[10%] text-center">Image</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">SKU</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[30%]">Item Details</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[15%]">Category</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[10%]">Stock</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[10%]">Price</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-500">Loading data...</td></tr>
              ) : paginatedItems.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-500">No inventory items found.</td></tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 mx-auto">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaImage className="text-slate-300" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {item.sku}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0D1C2E]">{item.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {item.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600 font-medium">{item.category}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`text-sm font-bold ${item.stockQuantity <= 10 ? 'text-orange-500' : 'text-slate-700'}`}>
                        {item.stockQuantity}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                      Rs.{item.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="text-slate-400 hover:text-[#4887FA] transition-colors"
                          disabled={actionLoading}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          disabled={actionLoading}
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      {!loading && filteredItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between mt-6 gap-3">
          <p className="text-sm text-slate-500 font-medium">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredItems.length)} of {filteredItems.length} entries
          </p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-1.5 text-sm font-bold border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-1.5 text-sm font-bold border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Modal based on user screenshot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0D1C2E]">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            <Formik
              key={formKey}
              initialValues={initialValues}
              validationSchema={inventoryValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, status, errors, touched }) => (
                <Form className="p-6 space-y-5">
                  {/* Image Upload Placeholder - Centered */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center bg-[#F8FAFC] group hover:border-[#4887FA] transition-colors cursor-pointer overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <FaPlus className="text-[#94A3B8] mb-1" />
                          <span className="text-[10px] font-bold text-[#94A3B8] tracking-widest">IMAGE</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        onChange={handleImageChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1E293B]">SKU Code</label>
                      <Field
                        name="sku"
                        placeholder="SKU-001"
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                          touched.sku && errors.sku ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                      />
                      <ErrorMessage name="sku" component="div" className="text-[10px] text-red-500 font-bold ml-1" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1E293B]">Category</label>
                      <Field
                        name="category"
                        placeholder="Filters, Oil, etc."
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                          touched.category && errors.category ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                      />
                      <ErrorMessage name="category" component="div" className="text-[10px] text-red-500 font-bold ml-1" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1E293B]">Vendor</label>
                    <Field
                      as="select"
                      name="vendor"
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                        touched.vendor && errors.vendor ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                    >
                      <option value="">Select vendor</option>
                      {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                    </Field>
                    <ErrorMessage name="vendor" component="div" className="text-[10px] text-red-500 font-bold ml-1" />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1E293B]">Item Name</label>
                    <Field
                      name="name"
                      placeholder="Engine Oil 5L"
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.name && errors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                    />
                    <ErrorMessage name="name" component="div" className="text-[10px] text-red-500 font-bold ml-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1E293B]">Price (Rs.)</label>
                      <Field
                        name="price"
                        type="number"
                        placeholder="0.00"
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                          touched.price && errors.price ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                      />
                      <ErrorMessage name="price" component="div" className="text-[10px] text-red-500 font-bold ml-1" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1E293B]">Stock Quantity</label>
                      <Field
                        name="stockQuantity"
                        type="number"
                        placeholder="0"
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                          touched.stockQuantity && errors.stockQuantity ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                      />
                      <ErrorMessage name="stockQuantity" component="div" className="text-[10px] text-red-500 font-bold ml-1" />
                    </div>
                  </div>

                  {status && (
                    <div className="text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">
                      {status}
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-sm font-bold text-[#475569] hover:text-slate-800 transition"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#1D61FF] hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : (editingItem ? 'Save Changes' : 'Add Item')}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
