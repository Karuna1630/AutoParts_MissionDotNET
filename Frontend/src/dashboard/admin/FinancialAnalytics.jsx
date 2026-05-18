import { useState, useEffect, useCallback } from 'react';
import { FiAlertCircle, FiDollarSign, FiTrendingUp, FiCreditCard, FiPackage, FiUsers, FiFileText, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { getFinancialReport, downloadFinancialReportPdf } from '../../services/adminService';

const padDatePart = (value) => String(value).padStart(2, '0');
const toDateInputValue = (date = new Date()) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`
);
const toMonthInputValue = (date = new Date()) => (
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}`
);
const currentYear = new Date().getFullYear();

const formatCurrency = (value = 0) => `Rs.${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})}`;

const emptyReport = {
  revenue: {
    totalSalesRevenue: 0,
    totalCashSales: 0,
    totalCreditSales: 0,
    averageOrderValue: 0,
  },
  costs: {
    totalCogs: 0,
    totalPurchaseCost: 0,
  },
  profit: {
    grossProfit: 0,
    grossProfitMarginPercentage: 0,
  },
  topPerformers: {
    topSellingParts: [],
    topCustomers: [],
  },
  transactions: {
    totalSalesInvoices: 0,
    totalCustomersServed: 0,
    totalPartsSold: 0,
  },
  credit: {
    totalOutstandingCreditBalance: 0,
    customersWithOverdueCredit: 0,
  },
  inventory: {
    totalInventoryValue: 0,
    lowStockPartsCount: 0,
  },
};

const normalizeTopCustomer = (customer = {}) => ({
  customerName: customer.customerName ?? customer.CustomerName ?? customer.name ?? 'Unknown Customer',
  totalSpent: Number(customer.totalSpent ?? customer.TotalSpent ?? customer.amount ?? 0),
  orderCount: Number(customer.orderCount ?? customer.OrderCount ?? customer.orders ?? 0),
});

const FinancialAnalytics = () => {
  const [reportType, setReportType] = useState('Monthly');
  const [selectedDate, setSelectedDate] = useState(toDateInputValue());
  const [selectedMonth, setSelectedMonth] = useState(toMonthInputValue());
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdfConfirm, setShowPdfConfirm] = useState(false);

  const buildReportParams = useCallback(() => {
    if (reportType === 'Daily') {
      return { date: selectedDate };
    }

    if (reportType === 'Monthly') {
      const [year, month] = selectedMonth.split('-');
      return { year: Number(year), month: Number(month) };
    }

    return { year: Number(selectedYear) };
  }, [reportType, selectedDate, selectedMonth, selectedYear]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getFinancialReport(reportType, buildReportParams());

      if (response.success) {
        setReportData(response.data);
      } else {
        setReportData(null);
        setError(response.message || 'Unable to load financial report.');
      }
    } catch (err) {
      console.error('Error fetching report', err);
      setReportData(null);
      setError('Unable to load live financial data. Please check the backend connection.');
    } finally {
      setLoading(false);
    }
  }, [buildReportParams, reportType]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]);

  const [downloading, setDownloading] = useState(false);

  const getReportPeriodLabel = () => {
    if (reportType === 'Daily') {
      return selectedDate;
    }

    if (reportType === 'Monthly') {
      return selectedMonth;
    }

    return selectedYear;
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setShowPdfConfirm(false);
      const blob = await downloadFinancialReportPdf(reportType, buildReportParams());
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FinancialReport_${reportType}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      alert('Could not download report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const renderPeriodControl = () => {
    if (reportType === 'Daily') {
      return (
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
        />
      );
    }

    if (reportType === 'Monthly') {
      return (
        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
        />
      );
    }

    return (
      <input
        type="number"
        min="2000"
        max="2100"
        value={selectedYear}
        onChange={(event) => setSelectedYear(event.target.value)}
        className="h-10 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
      />
    );
  };

  if (loading || !reportData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  const { revenue, costs, profit, topPerformers, transactions, credit, inventory } = reportData;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time business performance overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <div className="bg-slate-100 p-1 rounded-xl flex print:hidden">
            {['Daily', 'Monthly', 'Yearly'].map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  reportType === type 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 print:hidden">
            {renderPeriodControl()}
            <button
              onClick={fetchReport}
              className="h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center transition-all"
              title="Refresh report"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <button 
            onClick={() => setShowPdfConfirm(true)}
            disabled={downloading}
            className={`flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all shadow-sm print:hidden ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {downloading ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiDownload />
            )}
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {showPdfConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiAlertCircle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Generate financial report PDF?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This will create and download the {reportType.toLowerCase()} financial report for {getReportPeriodLabel()}.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPdfConfirm(false)}
                disabled={downloading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
                {downloading ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          label="Total Revenue" 
          value={`Rs.${revenue.totalSalesRevenue.toLocaleString()}`} 
          icon={FiDollarSign} 
          subtext={`${reportType} Sales`}
          color="blue"
        />
        <SummaryCard 
          label="Gross Profit" 
          value={`Rs.${profit.grossProfit.toLocaleString()}`} 
          icon={FiTrendingUp} 
          subtext={`${profit.grossProfitMarginPercentage}% Margin`}
          color="green"
        />
        <SummaryCard 
          label="Outstanding Credit" 
          value={`Rs.${credit.totalOutstandingCreditBalance.toLocaleString()}`} 
          icon={FiCreditCard} 
          subtext="Unpaid Balances"
          color="amber"
        />
        <SummaryCard 
          label="Inventory Value" 
          value={`Rs.${inventory.totalInventoryValue.toLocaleString()}`} 
          icon={FiPackage} 
          subtext={`${inventory.lowStockPartsCount} Low Stock Items`}
          color="indigo"
        />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Breakdown and Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiFileText className="text-blue-500" />
              Financial Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Streams</h3>
                <ProgressBar label="Cash Sales" value={revenue.totalCashSales} total={revenue.totalSalesRevenue} color="bg-blue-500" />
                <ProgressBar label="Credit Sales" value={revenue.totalCreditSales} total={revenue.totalSalesRevenue} color="bg-amber-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Indicators</h3>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-sm font-medium text-slate-600">Avg Order Value</span>
                  <span className="text-sm font-bold text-slate-800">Rs.{revenue.averageOrderValue}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                  <span className="text-sm font-medium text-slate-600">Total Invoices</span>
                  <span className="text-sm font-bold text-slate-800">{transactions.totalSalesInvoices}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Top Selling Parts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[400px]">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    <th className="pb-4">Part Name</th>
                    <th className="pb-4 text-center">Quantity</th>
                    <th className="pb-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topPerformers?.topSellingParts?.map((part, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-semibold text-slate-700">{part.partName}</td>
                      <td className="py-4 text-center font-medium text-slate-500">{part.quantitySold}</td>
                      <td className="py-4 text-right font-bold text-blue-600">Rs.{part.revenueGenerated.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Top Customers */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FiUsers className="text-indigo-500" />
            Top Customers
          </h2>
          <div className="space-y-4">
            {topPerformers?.topCustomers?.length > 0 ? topPerformers.topCustomers.map((cust, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{cust.customerName}</p>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">
                    {cust.orderCount} {cust.orderCount === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Rs.{cust.totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase">Spent</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm">No customer data available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, subtext, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${colors[color]}`}>
        <Icon />
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      <p className="text-[11px] font-medium text-slate-500 mt-2">{subtext}</p>
    </div>
  );
};

const ProgressBar = ({ label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-800">Rs.{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-700 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
