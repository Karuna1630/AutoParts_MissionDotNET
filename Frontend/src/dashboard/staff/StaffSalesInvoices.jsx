import React, { useState, useEffect, useRef } from 'react';
import { FiFileText, FiSearch, FiDownload, FiEye, FiClock, FiUser, FiShoppingBag, FiChevronLeft, FiChevronRight, FiPrinter } from 'react-icons/fi';
import { apiClient } from '../../services/api';

const ITEMS_PER_PAGE = 10;

const StaffSalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const printRef = useRef(null);

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

  const customerCounts = invoices.reduce((acc, inv) => {
    if (inv.customerName && inv.customerName !== 'Walk-in') {
      acc[inv.customerName] = (acc[inv.customerName] || 0) + 1;
    }
    return acc;
  }, {});

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                          inv.customerName?.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'high_spenders') matchesFilter = inv.finalAmount >= 5000;
    if (filterType === 'pending_credits') matchesFilter = inv.paymentStatus === 'Credit';
    if (filterType === 'regulars') matchesFilter = inv.customerName && customerCounts[inv.customerName] >= 2;

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType]);

  const printInvoice = (invoice) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .brand { font-size: 24px; font-weight: 800; color: #0f172a; }
        .brand-sub { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
        .inv-num { font-size: 18px; font-weight: 700; text-align: right; }
        .inv-date { font-size: 12px; color: #64748b; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
        .info-box p { font-size: 14px; font-weight: 600; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f8fafc; padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .totals { text-align: right; margin-top: 20px; }
        .totals .row { display: flex; justify-content: flex-end; gap: 40px; padding: 6px 0; font-size: 13px; }
        .totals .row.total { font-size: 18px; font-weight: 800; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
        .totals .row.discount { color: #10b981; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <div><div class="brand">AutoParts</div><div class="brand-sub">Vehicle MIS</div></div>
        <div><div class="inv-num">${invoice.invoiceNumber}</div><div class="inv-date">${new Date(invoice.invoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div>
      </div>
      <div class="info-grid">
        <div class="info-box"><label>Customer</label><p>${invoice.customerName || 'Walk-in'}</p></div>
        <div class="info-box"><label>Payment</label><p>${invoice.paymentStatus} — ${invoice.paymentMethod || 'Cash'}</p></div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>SKU</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>
          ${invoice.items?.map(item => `
            <tr>
              <td style="font-weight:600">${item.partName || 'Unknown'}</td>
              <td style="color:#64748b">${item.sku || 'N/A'}</td>
              <td style="text-align:center">${item.quantity}</td>
              <td style="text-align:right">Rs. ${item.unitPrice?.toLocaleString()}</td>
              <td style="text-align:right;font-weight:700">Rs. ${item.subtotal?.toLocaleString()}</td>
            </tr>
          `).join('') || '<tr><td colspan="5">No items</td></tr>'}
        </tbody>
      </table>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>Rs. ${invoice.subtotal?.toLocaleString()}</span></div>
        ${invoice.discountAmount > 0 ? `<div class="row discount"><span>Loyalty Discount (10%)</span><span>- Rs. ${invoice.discountAmount?.toLocaleString()}</span></div>` : ''}
        <div class="row total"><span>Total</span><span>Rs. ${invoice.finalAmount?.toLocaleString()}</span></div>
      </div>
      <div class="footer">Thank you for your business! — AutoParts Vehicle MIS</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };

  const exportAllPdf = () => {
    const win = window.open('', '_blank');
    const rows = filteredInvoices.map(inv => `
      <tr>
        <td style="font-weight:600">${inv.invoiceNumber}</td>
        <td>${inv.customerName || 'Walk-in'}</td>
        <td>${new Date(inv.invoiceDate).toLocaleDateString()}</td>
        <td>${inv.items?.length || 0} items</td>
        <td style="text-align:right">Rs. ${inv.subtotal?.toLocaleString()}</td>
        <td style="text-align:right;color:#10b981">- Rs. ${inv.discountAmount?.toLocaleString()}</td>
        <td style="text-align:right;font-weight:700">Rs. ${inv.finalAmount?.toLocaleString()}</td>
        <td><span style="background:${inv.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7'};color:${inv.paymentStatus === 'Paid' ? '#065f46' : '#92400e'};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">${inv.paymentStatus}</span></td>
      </tr>
    `).join('');

    const totalRevenue = filteredInvoices.reduce((sum, i) => sum + (i.finalAmount || 0), 0);
    const totalDiscount = filteredInvoices.reduce((sum, i) => sum + (i.discountAmount || 0), 0);
    const filterTitle = filterType === 'high_spenders' ? 'High Spenders Report' :
                        filterType === 'pending_credits' ? 'Pending Credits Report' :
                        filterType === 'regulars' ? 'Regular Customers Report' : 'Sales Report';

    win.document.write(`
      <html><head><title>Sales Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .brand { font-size: 24px; font-weight: 800; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
        .summary { display: flex; gap: 30px; margin-bottom: 30px; }
        .stat { background: #f8fafc; padding: 16px 24px; border-radius: 8px; }
        .stat label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
        .stat p { font-size: 20px; font-weight: 800; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <div class="brand">AutoParts — ${filterTitle}</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${filteredInvoices.length} invoices</div>
      </div>
      <div class="summary">
        <div class="stat"><label>Total Revenue</label><p>Rs. ${totalRevenue.toLocaleString()}</p></div>
        <div class="stat"><label>Total Discounts</label><p>Rs. ${totalDiscount.toLocaleString()}</p></div>
        <div class="stat"><label>Total Invoices</label><p>${filteredInvoices.length}</p></div>
      </div>
      <table>
        <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Items</th><th style="text-align:right">Subtotal</th><th style="text-align:right">Discount</th><th style="text-align:right">Final</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer">AutoParts Vehicle MIS — Confidential</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>
          <p className="text-slate-500 text-sm mt-0.5">Audit and track all finalized sales transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium w-64 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
          >
            <option value="all">All Sales</option>
            <option value="regulars">Regular Customers</option>
            <option value="high_spenders">High Spenders (Rs. 5000+)</option>
            <option value="pending_credits">Pending Credits</option>
          </select>
          <button
            onClick={exportAllPdf}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all"
          >
            <FiDownload size={14} /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice #</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[9px] font-bold">
                          {inv.customerName?.[0] || '?'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{inv.customerName || 'Walk-in'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-medium text-slate-400">{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-bold text-slate-900">Rs. {inv.finalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          onClick={() => printInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Print PDF"
                        >
                          <FiPrinter size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="p-16 text-center">
                <FiShoppingBag className="mx-auto text-slate-200 mb-3" size={36} />
                <p className="text-slate-500 font-semibold text-sm">No sales records found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className="text-xs text-slate-400 font-medium">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <FiChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transaction Details</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-white rounded-lg border border-slate-200 transition-all">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="18" width="18" className="text-slate-400"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </button>
            </div>

            <div className="p-6 max-h-[55vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-sm font-bold text-slate-800">{selectedInvoice.customerName || 'Walk-in'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(selectedInvoice.invoiceDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 text-left uppercase">Item</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 text-center uppercase">Qty</th>
                      <th className="px-4 py-3 text-[9px] font-bold text-slate-400 text-right uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-800">{item.partName}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">Rs. {item.subtotal?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex justify-between w-56 text-xs font-semibold text-slate-500">
                  <span>Subtotal</span>
                  <span>Rs. {selectedInvoice.subtotal?.toLocaleString()}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between w-56 text-xs font-semibold text-emerald-600">
                    <span>Discount</span>
                    <span>- Rs. {selectedInvoice.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between w-56 pt-3 mt-1.5 border-t border-slate-100 text-base font-bold text-slate-900">
                  <span>Total</span>
                  <span>Rs. {selectedInvoice.finalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => printInvoice(selectedInvoice)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <FiPrinter size={14} /> Print PDF
              </button>
              <button onClick={() => setSelectedInvoice(null)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold text-xs hover:bg-slate-800 transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSalesInvoices;
