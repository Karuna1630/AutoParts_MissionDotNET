import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiShoppingBag, FiTool, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';
import { customerHistoryService } from '../../services/customerHistoryService';

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState('purchases');
  const [purchases, setPurchases] = useState([]);
  const [services, setServices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summaryRes = await customerHistoryService.getSummary();
      if (summaryRes.success) setSummary(summaryRes.data);

      const combinedRes = await customerHistoryService.getCombinedHistory();
      if (combinedRes.success) {
        setPurchases(combinedRes.data.purchases);
        setServices(combinedRes.data.services);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const blob = await customerHistoryService.downloadInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleExportAll = async () => {
    try {
      const blob = await customerHistoryService.exportHistoryPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CustomerHistory_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting history:', error);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Purchase & Service History</h1>
          <p className="text-slate-500 mt-1 font-medium">Review your past orders, invoices, and service appointments.</p>
        </div>
        <button 
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          <FiDownload /> Export Summary
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard icon={<FiShoppingBag />} label="Total Invoices" value={summary.totalInvoices} color="blue" />
        <SummaryCard icon={<FiFileText />} label="Total Spent" value={`Rs.${summary.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}`} color="emerald" />
        <SummaryCard icon={<FiTool />} label="Total Appointments" value={summary.totalAppointments} color="purple" />
        <SummaryCard icon={<FiCheckCircle />} label="Completed Services" value={summary.completedAppointments} color="blue" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 px-2">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'purchases' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiShoppingBag /> Purchase History
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'services' 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiTool /> Service History
          </button>
        </div>

        <div className="p-6 bg-slate-50/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 'purchases' ? 'Recent Purchases' : 'Service Appointments'}
            </h2>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <FiFilter /> Filter
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'purchases' && purchases.map((purchase) => (
              <PurchaseCard 
                key={purchase.invoiceId} 
                purchase={purchase} 
                onDownload={() => handleDownloadInvoice(purchase.invoiceId)} 
              />
            ))}

            {activeTab === 'services' && services.map((service) => (
              <ServiceCard 
                key={service.appointmentId} 
                service={service} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl text-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

const PurchaseCard = ({ purchase, onDownload }) => {
  const isCredit = purchase.paymentStatus === 'Credit';
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900">Invoice #{purchase.invoiceId}</h3>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              isCredit ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {purchase.paymentStatus}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <FiClock className="text-xs" /> 
            {new Date(purchase.invoiceDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-xs text-slate-500 font-semibold">{purchase.items.length} items</p>
            <p className="font-bold text-slate-900 text-lg">Rs.{purchase.finalAmount.toLocaleString()}</p>
          </div>
          <button 
            onClick={onDownload}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Download Invoice PDF"
          >
            <FiDownload size={20} />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {purchase.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
            <span className="text-sm font-medium text-slate-700 truncate mr-2">{item.partName}</span>
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{item.quantity} x ${item.unitPrice}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceCard = ({ service }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900">{service.serviceType}</h3>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusColor(service.status)}`}>
              {service.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <FiClock className="text-xs" /> 
            {new Date(service.appointmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Appointment ID</p>
          <p className="font-bold text-slate-800">#{service.appointmentId}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-600"><strong className="text-slate-800">Notes:</strong> {service.notes}</p>
        {service.rating && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs font-bold text-slate-500 mr-1">Rating:</span>
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < service.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
