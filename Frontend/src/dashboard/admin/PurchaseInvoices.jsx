import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEye,
  FiX,
  FiLoader,
  FiCalendar,
  FiDollarSign,
  FiTruck,
  FiHash,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import { getInvoices, addInvoice } from "../../services/invoiceService";
import { getVendors } from "../../services/vendorService";
import { getAllParts } from "../../services/partService";
import { getApiErrorMessage } from "../../services/api";
import Pagination from "../../components/Pagination";

const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [newInvoice, setNewInvoice] = useState({
    vendorId: "",
    notes: "",
    items: [],
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInvoices();
      if (response.success) {
        setInvoices(response.data);
      }
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to fetch invoices."));
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await getVendors(1, 100);
      const data = response?.data || response?.Data || [];
      const vendorList = Array.isArray(data) ? data : data.items || [];
      setVendors(vendorList);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await getAllParts();
      if (response.success) {
        setParts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    }
  };

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { partId: "", quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...newInvoice.items];
    updatedItems.splice(index, 1);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index][field] =
      field === "partId" ? parseInt(value) : parseFloat(value);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const calculateTotal = () => {
    return newInvoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
  };

  useEffect(() => {
    fetchInvoices();
    fetchVendors();
    fetchParts();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newInvoice.items.length === 0) {
      setError("Please add at least one part.");
      return;
    }

    try {
      setLoading(true);
      const response = await addInvoice(newInvoice);
      if (response.success) {
        setInvoices([response.data, ...invoices]);
        setIsModalOpen(false);
        setNewInvoice({ vendorId: "", notes: "", items: [] });
      }
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to create invoice."));
    } finally {
      setLoading(false);
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Syncing Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stock Purchase</h1>
          <p className="text-slate-500 mt-1">
            Manage vendor invoices and inventory updates.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 shadow-sm"
        >
          <FiPlus size={20} /> New Purchase
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-semibold text-sm flex items-center gap-3">
          <FiX className="shrink-0" /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Spent"
          value={`Rs.${invoices.reduce((a, b) => a + b.totalAmount, 0).toLocaleString()}`}
          icon={FiDollarSign}
          color="blue"
        />
        <StatCard
          label="Invoices"
          value={invoices.length}
          icon={FiHash}
          color="slate"
        />
        <StatCard
          label="Active Vendors"
          value={vendors.length}
          icon={FiTruck}
          color="emerald"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No purchase records found.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {invoice.vendorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                        {invoice.items?.length || 0} Items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      Rs.{invoice.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {invoices.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* New Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                New Purchase Record
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    Vendor
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={newInvoice.vendorId}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        vendorId: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    value={newInvoice.notes}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-700 uppercase">
                    Items
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FiPlus /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {newInvoice.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-slate-50 p-4 rounded-xl relative"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                          Part
                        </label>
                        <select
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                          value={item.partId}
                          onChange={(e) =>
                            handleItemChange(idx, "partId", e.target.value)
                          }
                        >
                          <option value="">Select Part</option>
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stockQuantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                          Qty
                        </label>
                        <input
                          required
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                          Cost (Rs.)
                        </label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, "unitPrice", e.target.value)
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Grand Total
                </p>
                <p className="text-xl font-bold text-slate-900">
                  Rs.{calculateTotal().toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-slate-500 font-bold hover:bg-white rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || newInvoice.items.length === 0}
                  className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiCheckCircle />
                  )}{" "}
                  Save Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {selectedInvoice.invoiceNumber}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {selectedInvoice.vendorName}
                </p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                <InfoItem
                  label="Date"
                  value={new Date(
                    selectedInvoice.invoiceDate,
                  ).toLocaleDateString()}
                  icon={FiCalendar}
                />
                <InfoItem
                  label="Vendor"
                  value={selectedInvoice.vendorName}
                  icon={FiTruck}
                />
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Procured Parts
                </p>
                <div className="space-y-2">
                  {selectedInvoice.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm border border-slate-100"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.partName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity} x Rs.{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900">
                        Rs.{item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase">
                  Total Procurement
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs.{selectedInvoice.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    slate: "text-slate-600 bg-slate-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <h3 className="text-xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex gap-3">
    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 h-fit">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

export default PurchaseInvoices;
