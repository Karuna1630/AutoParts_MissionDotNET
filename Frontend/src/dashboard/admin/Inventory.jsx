import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiAlertCircle, FiTrash2, FiX, FiLoader, FiSearch } from 'react-icons/fi';
import { getInventory, addInventoryItem, deleteInventoryItem, updateInventoryItem } from '../../services/inventoryService';
import { getVendors } from '../../services/vendorService';
import { useFormik } from 'formik';
import { inventorySchema } from '../../utils/validation/inventoryValidation';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const itemsPerPage = 4;

  const formik = useFormik({
    initialValues: {
      sku: '',
      name: '',
      category: '',
      vendor: '',
      price: '',
      stock: '',
    },
    validationSchema: inventorySchema,
    onSubmit: async (values) => {
      try {
        const data = new FormData();
        data.append('sku', values.sku);
        data.append('name', values.name);
        data.append('category', values.category);
        data.append('vendor', values.vendor);
        data.append('price', values.price);
        data.append('stock', values.stock);
        if (imageFile) {
          data.append('image', imageFile);
        }
        
        if (editingItem) {
          const response = await updateInventoryItem(editingItem.id, data);
          if (response.success) {
            setItems(items.map(i => i.id === editingItem.id ? { ...response.data, vendor: response.data.vendor || response.data.vendorName || values.vendor } : i));
            setIsModalOpen(false);
          }
        } else {
          const response = await addInventoryItem(data);
          if (response.success) {
            setItems([...items, { ...response.data, vendor: response.data.vendor || response.data.vendorName || values.vendor }]);
            setIsModalOpen(false);
          }
        }
      } catch (error) {
        console.error('Failed to save item:', error);
      }
    },
  });

  useEffect(() => {
    fetchInventory();
    fetchVendors();
  }, []);

  // Filter Logic
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getInventory();
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchVendors = async () => {
    try {
      const response = await getVendors(1, 1000);
      const responseData = response?.data || response?.Data || {};
      const items = responseData.items || responseData.Items || [];
      const normalizedVendors = items
        .map((vendor) => ({
          id: vendor.id || vendor.Id,
          companyName: vendor.companyName || vendor.CompanyName
        }))
        .filter((vendor) => vendor.id && vendor.companyName);
      setVendorOptions(normalizedVendors);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setVendorOptions([]);
    }
  };
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      formik.setValues({
        sku: item.sku,
        name: item.name,
        category: item.category || '',
        vendor: item.vendor || item.vendorName || '',
        price: item.price,
        stock: item.stock,
      });
      setImagePreview(item.imageUrl);
      setImageFile(null);
    } else {
      setEditingItem(null);
      formik.resetForm();
      setImagePreview(null);
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await deleteInventoryItem(itemToDelete.id);
      if (response.success) {
        setItems(items.filter(item => item.id !== itemToDelete.id));
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Loading Inventory...</p>
      </div>
    );
  }

  // Alert Logic
  const lowStockCount = items.filter(item => item.stock < 10).length;

  return (
    <div className="space-y-2 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 mt-1">Manage parts catalog. Rows highlighted in red are below the stock alert threshold.</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="group relative flex items-center bg-[#EF4444] text-white rounded-full font-bold shadow-lg shadow-red-200 transition-all duration-300 w-12 hover:w-44 h-12 overflow-hidden cursor-help">
              <div className="flex items-center justify-center min-w-[48px] h-full">
                <FiAlertCircle size={24} className="animate-pulse" />
              </div>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-6">
                {lowStockCount} low stock
              </span>
            </div>
          )}
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200"
          >
            <FiPlus size={24} /> Add part
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-50">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name, category, SKU..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-slate-600"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600 w-16">Image</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Item Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Category</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Price</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No items found in inventory. Start by adding one!
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                   <tr 
                    key={item.id} 
                    className={`group transition-all duration-200 ${
                      item.stock < 10 
                        ? 'bg-rose-50/30 hover:bg-rose-100/70 border-l-4 border-l-rose-500' 
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold">NO IMG</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.sku}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium uppercase tracking-tight">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.vendor || item.vendorName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">Rs.{item.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      <span className={item.stock < 10 ? 'text-rose-600 font-bold' : ''}>
                        {item.stock}
                      </span> <span className="text-slate-400 font-normal text-xs">units</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredItems.length > itemsPerPage && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-bold text-slate-700">
                {Math.min(indexOfLastItem, filteredItems.length)}
              </span> of{' '}
              <span className="font-bold text-slate-700">{filteredItems.length}</span> items
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  currentPage === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm'
                }`}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                  currentPage === totalPages
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <FiX className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('item-image').click()}>
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <FiPlus className="mx-auto text-slate-400 mb-1" size={24} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Image</span>
                      </div>
                    )}
                  </div>
                  <input 
                    id="item-image"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    name="sku"
                    type="text"
                    placeholder="SKU-001"
                    className={`w-full px-4 py-2 rounded-xl border ${formik.touched.sku && formik.errors.sku ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    {...formik.getFieldProps('sku')}
                  />
                  {formik.touched.sku && formik.errors.sku && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formik.errors.sku}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <input
                    name="category"
                    type="text"
                    placeholder="Filters, Oil, etc."
                    className={`w-full px-4 py-2 rounded-xl border ${formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    {...formik.getFieldProps('category')}
                  />
                  {formik.touched.category && formik.errors.category && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formik.errors.category}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Vendor</label>
                <select
                  name="vendor"
                  className={`w-full px-4 py-2 rounded-xl border ${formik.touched.vendor && formik.errors.vendor ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  {...formik.getFieldProps('vendor')}
                >
                  <option value="">Select vendor</option>
                  {vendorOptions.map((vendor) => (
                    <option key={vendor.id} value={vendor.companyName}>
                      {vendor.companyName}
                    </option>
                  ))}
                </select>
                {formik.touched.vendor && formik.errors.vendor && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formik.errors.vendor}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Engine Oil 5L"
                  className={`w-full px-4 py-2 rounded-xl border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                  {...formik.getFieldProps('name')}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formik.errors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price (Rs.)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-4 py-2 rounded-xl border ${formik.touched.price && formik.errors.price ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    {...formik.getFieldProps('price')}
                  />
                  {formik.touched.price && formik.errors.price && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formik.errors.price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    name="stock"
                    type="number"
                    placeholder="0"
                    className={`w-full px-4 py-2 rounded-xl border ${formik.touched.stock && formik.errors.stock ? 'border-red-500' : 'border-slate-200'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                    {...formik.getFieldProps('stock')}
                  />
                  {formik.touched.stock && formik.errors.stock && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formik.errors.stock}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? 'Saving...' : (editingItem ? 'Save Changes' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrash2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Confirm Delete</h2>
              <p className="text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-700">{itemToDelete?.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition shadow-lg shadow-rose-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;



