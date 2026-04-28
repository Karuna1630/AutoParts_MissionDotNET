import React from 'react';
import { FiPlus, FiEye, FiDownload } from 'react-icons/fi';

const PurchaseInvoices = () => {
  const [invoices] = React.useState([
    { id: 1, invoiceNo: 'INV-001', vendor: 'AutoParts Ltd', date: '2026-04-15', amount: '$4,250', status: 'Paid', dueDate: '2026-05-15' },
    { id: 2, invoiceNo: 'INV-002', vendor: 'Global Motors Inc', date: '2026-04-12', amount: '$3,890', status: 'Pending', dueDate: '2026-05-12' },
    { id: 3, invoiceNo: 'INV-003', vendor: 'Precision Parts Co', date: '2026-04-10', amount: '$5,120', status: 'Paid', dueDate: '2026-05-10' },
    { id: 4, invoiceNo: 'INV-004', vendor: 'QuickShip Supplies', date: '2026-04-08', amount: '$2,750', status: 'Overdue', dueDate: '2026-04-30' },
    { id: 5, invoiceNo: 'INV-005', vendor: 'AutoParts Ltd', date: '2026-04-05', amount: '$6,340', status: 'Paid', dueDate: '2026-05-05' },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchase Invoices</h1>
          <p className="text-slate-500 mt-1">Track and manage all purchase invoices</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FiPlus /> New Invoice
        </button>
      </div>



      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Invoices', value: '124' },
          { label: 'Total Amount', value: '$58,920' },
          { label: 'Paid', value: '$42,500' },
          { label: 'Pending', value: '$16,420' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Invoice No</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Vendor</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Due Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{invoice.invoiceNo}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{invoice.vendor}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{invoice.date}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{invoice.dueDate}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{invoice.amount}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    invoice.status === 'Paid'
                      ? 'bg-green-100 text-green-700'
                      : invoice.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
                    <FiEye size={16} />
                  </button>
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
                    <FiDownload size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseInvoices;
