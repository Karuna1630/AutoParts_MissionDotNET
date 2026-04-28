import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFinancialReport } from '../../services/adminService';

const FinancialAnalytics = () => {
  const [reportType, setReportType] = useState('Monthly'); // 'Daily', 'Monthly', 'Yearly'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getFinancialReport(reportType);
      if (response.success) {
        setReportData(response.data);
      }
    } catch (err) {
      console.error('Error fetching report', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !reportData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { revenue, costs, profit, chartData, topPerformers } = reportData;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Analytics</h1>
          <p className="text-slate-500 mt-1">Revenue, expenses, and profit analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 rounded-lg flex p-1">
            {['Daily', 'Monthly', 'Yearly'].map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  reportType === type 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <FiDownload /> Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Total Revenue" 
          value={`$${revenue.totalSalesRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={FiTrendingUp} 
          color="blue"
        />
        <MetricCard 
          label="Total Expenses" 
          value={`$${costs.totalCogs.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={FiBarChart2} 
          color="red"
        />
        <MetricCard 
          label="Gross Profit" 
          value={`$${profit.grossProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          icon={FiTrendingUp} 
          color="green"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <FiBarChart2 className="text-blue-500" />
          <h2 className="text-xl font-bold text-slate-900">{reportType} Performance</h2>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={val => `$${val}`} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={reportType === 'Yearly' ? 40 : 20} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={reportType === 'Yearly' ? 40 : 20} />
              <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={reportType === 'Yearly' ? 40 : 20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Top Selling Parts</h2>
          <div className="space-y-6 flex-1">
            {topPerformers.topSellingParts.map((part, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">{part.partName}</p>
                    <p className="text-xs text-slate-500">{part.quantitySold} units sold</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  ${part.revenueGenerated.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Other Metrics</h2>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <SmallMetric label="AVG ORDER VALUE" value={`$${revenue.averageOrderValue}`} />
            <SmallMetric label="TOTAL INVOICES" value={reportData.transactions.totalSalesInvoices} />
            <SmallMetric label="CREDIT BALANCE" value={`$${reportData.credit.totalOutstandingCreditBalance}`} />
            <SmallMetric label="PROFIT MARGIN" value={`${profit.grossProfitMarginPercentage}%`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-500',
    red: 'bg-red-50 text-red-500',
    green: 'bg-green-50 text-green-500',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl text-xl ${colorMap[color]}`}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

const SmallMetric = ({ label, value }) => (
  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{label}</p>
    <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default FinancialAnalytics;
