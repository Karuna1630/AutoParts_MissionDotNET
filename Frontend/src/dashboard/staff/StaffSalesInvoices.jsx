import React, { useState, useEffect } from 'react';
import { FiFileText, FiSearch, FiDownload, FiEye, FiClock, FiUser, FiShoppingBag } from 'react-icons/fi';
import { apiClient } from '../../services/api';

const StaffSalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/Pos/invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales History</h1>
          <p className="text-slate-500 font-medium mt-1">Audit and track all finalized sales transactions.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search invoice or customer..."
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium w-80 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                        <FiUser />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{inv.customerName || 'Walk-in'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-900">
                      Rs. {inv.finalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <FiEye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInvoices.length === 0 && (
            <div className="p-20 text-center">
              <FiShoppingBag className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-500 font-bold">No sales records found.</p>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction Details</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white rounded-xl shadow-sm border border-slate-100 transition-all">
                <FiXCircle size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Info</p>
                  <p className="font-bold text-slate-800">{selectedInvoice.customerName || 'Guest Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date & Time</p>
                  <p className="font-bold text-slate-800">{new Date(selectedInvoice.invoiceDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 text-left">Item</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 text-center">Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{item.partName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{item.sku}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">Rs. {item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex justify-between w-64 text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>Rs. {selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 text-sm font-bold text-emerald-600">
                  <span>Discount</span>
                  <span>- Rs. {selectedInvoice.discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-64 pt-4 mt-2 border-t border-slate-100 text-xl font-black text-slate-900">
                  <span>Total</span>
                  <span>Rs. {selectedInvoice.finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2">
                <FiDownload /> Print PDF
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Re-using icon for close
const FiXCircle = ({ size, className }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export default StaffSalesInvoices;
