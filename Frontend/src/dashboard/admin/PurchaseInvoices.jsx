import React, { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiDownload, FiX, FiLoader, FiCalendar, FiDollarSign, FiTruck } from 'react-icons/fi';
import { getInvoices, addInvoice, deleteInvoice } from '../../services/invoiceService';
import { getVendors } from '../../services/vendorService';
import { getApiErrorMessage } from '../../services/api';

const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNo: '',
    vendorName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchInvoices();
    fetchVendors();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInvoices();
      if (response.success) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError(getApiErrorMessage(error, 'Failed to fetch invoices.'));
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
      setVendors(normalizedVendors);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setVendors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await addInvoice({
        ...formData,
        totalAmount: parseFloat(formData.totalAmount)
      });
      if (response.success) {
        setInvoices([...invoices, response.data]);
        setIsModalOpen(false);
        setFormData({
          invoiceNo: '',
          vendorName: '',
          date: new Date().toISOString().split('T')[0],
          dueDate: '',
          totalAmount: '',
          status: 'Pending'
        });
      }
    } catch (error) {
      console.error('Failed to add invoice:', error);
      setError(getApiErrorMessage(error, 'Failed to create invoice.'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await deleteInvoice(id);
        if (response.success) {
          setInvoices(invoices.filter(inv => inv.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete invoice:', error);
      }
    }
  };

  const stats = [
    { label: 'Total Invoices', value: invoices.length },
    { label: 'Total Amount', value: `$${invoices.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}` },
    { label: 'Paid', value: `$${invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}` },
    { label: 'Pending', value: `$${invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}` },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Loading Invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchase Invoices</h1>
          <p className="text-slate-500 mt-1">Track and manage all purchase invoices</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200"
        >
          <FiPlus size={24} /> New Invoice
        </button>
      </div>

      {/* Stats */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Invoice No</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Vendor</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Status</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No invoices found. Create your first invoice!
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{invoice.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{invoice.vendorName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${invoice.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        invoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedInvoice(invoice); setIsViewModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <FiEye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <FiDownload size={16} />
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

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">New Purchase Invoice</h2>
                <p className="text-slate-500 text-sm mt-1">Enter invoice details to record a new purchase</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <FiX size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FiDollarSign className="text-blue-500" /> Invoice Number
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="INV-2026-001"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FiTruck className="text-blue-500" /> Vendor Name
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.companyName}>
                        {vendor.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FiCalendar className="text-blue-500" /> Invoice Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FiCalendar className="text-rose-500" /> Due Date
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none transition"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FiDollarSign className="text-emerald-500" /> Total Amount
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition font-bold"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Invoice Details</h2>
                <p className="text-slate-500 text-sm mt-1">{selectedInvoice.invoiceNo}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <FiX size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-slate-500">Vendor Name</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{selectedInvoice.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                    selectedInvoice.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Invoice Date</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">Due Date</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-lg font-bold text-slate-700">Total Amount</span>
                <span className="text-3xl font-bold text-emerald-600">${selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;
