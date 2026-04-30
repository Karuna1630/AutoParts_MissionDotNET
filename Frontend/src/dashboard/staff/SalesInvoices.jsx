import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiX, FiLoader } from 'react-icons/fi';
import { getCustomers } from '../../services/customerService';
import { getInventory } from '../../services/inventoryService';
import { createSalesInvoice, getSalesInvoices } from '../../services/salesInvoiceService';
import { getApiErrorMessage } from '../../services/api';

const createEmptyItem = () => ({ inventoryItemId: '', quantity: 1 });

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    paidAmount: '',
    items: [createEmptyItem()],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [invoiceResponse, customerResponse, inventoryResponse] = await Promise.all([
          getSalesInvoices(),
          getCustomers(),
          getInventory(),
        ]);
        setInvoices(invoiceResponse?.data || []);
        setCustomers(customerResponse?.data || []);
        setInventory(inventoryResponse?.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load sales data.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const inventoryMap = useMemo(() => {
    return new Map(inventory.map((item) => [item.id, item]));
  }, [inventory]);

  const computedTotals = useMemo(() => {
    let subtotal = 0;
    formData.items.forEach((item) => {
      const inventoryItem = inventoryMap.get(Number(item.inventoryItemId));
      const quantity = Number(item.quantity) || 0;
      if (inventoryItem) {
        subtotal += inventoryItem.price * quantity;
      }
    });
    const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;
    const paidAmount = Math.min(Number(formData.paidAmount) || 0, total);
    const dueAmount = total - paidAmount;
    return { subtotal, discount, total, paidAmount, dueAmount };
  }, [formData.items, formData.paidAmount, inventoryMap]);

  const handleItemChange = (index, key, value) => {
    setFormData((prev) => {
      const items = prev.items.map((item, idx) => (idx === index ? { ...item, [key]: value } : item));
      return { ...prev, items };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(null);
      const payload = {
        customerId: Number(formData.customerId),
        paidAmount: Number(formData.paidAmount) || 0,
        items: formData.items
          .filter((item) => item.inventoryItemId)
          .map((item) => ({
            inventoryItemId: Number(item.inventoryItemId),
            quantity: Number(item.quantity) || 0,
          })),
      };

      const response = await createSalesInvoice(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create invoice.');
      }

      setInvoices((prev) => [response.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ customerId: '', paidAmount: '', items: [createEmptyItem()] });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create invoice.'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Loading sales invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales Invoices</h1>
          <p className="text-slate-500 mt-1">Create sales invoices and track payments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-2xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-200"
        >
          <FiPlus size={24} /> New Sale
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Invoice No</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Total</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Paid</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Due</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No sales invoices yet.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{invoice.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{invoice.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${invoice.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${invoice.paidAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${invoice.dueAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        invoice.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : invoice.paymentStatus === 'Partial'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                      }`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">New Sales Invoice</h2>
                <p className="text-slate-500 text-sm mt-1">Select customer and parts to complete the sale</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <FiX size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700">Customer</label>
                  <select
                    required
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={formData.customerId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, customerId: event.target.value }))}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">Paid amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={formData.paidAmount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, paidAmount: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Items</h3>
                  <button type="button" onClick={handleAddItem} className="text-sm font-bold text-blue-600">
                    + Add item
                  </button>
                </div>
                {formData.items.map((item, index) => {
                  const inventoryItem = inventoryMap.get(Number(item.inventoryItemId));
                  return (
                    <div key={`item-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Part</label>
                        <select
                          required
                          className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                          value={item.inventoryItemId}
                          onChange={(event) => handleItemChange(index, 'inventoryItemId', event.target.value)}
                        >
                          <option value="">Select part</option>
                          {inventory.map((part) => (
                            <option key={part.id} value={part.id}>
                              {part.name} (Stock: {part.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Qty</label>
                        <input
                          type="number"
                          min="1"
                          className="mt-2 w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                          value={item.quantity}
                          onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          {inventoryItem ? `$${(inventoryItem.price * item.quantity).toFixed(2)}` : '�'}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-xs font-bold text-rose-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-500 font-bold">Subtotal</p>
                  <p className="text-lg font-bold text-slate-900">${computedTotals.subtotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 font-bold">Discount</p>
                  <p className="text-lg font-bold text-slate-900">${computedTotals.discount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 font-bold">Total</p>
                  <p className="text-lg font-bold text-slate-900">${computedTotals.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500 font-bold">Due</p>
                  <p className="text-lg font-bold text-slate-900">${computedTotals.dueAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#3B82F6] px-6 py-3 text-sm font-bold text-white hover:bg-blue-600"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;
