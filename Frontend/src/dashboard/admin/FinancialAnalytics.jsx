import React from 'react';
import { FiBarChart2, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialAnalytics = () => {
  const monthlyData = [
    { month: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', revenue: 5300, expenses: 2210, profit: 3090 },
    { month: 'Mar', revenue: 6200, expenses: 2290, profit: 3910 },
    { month: 'Apr', revenue: 8900, expenses: 3300, profit: 5600 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Analytics</h1>
          <p className="text-slate-500 mt-1">Revenue, expenses, and profit analysis</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FiDownload /> Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: '$31,939', change: '+12.5%', icon: FiTrendingUp },
          { label: 'Total Expenses', value: '$8,240', change: '+5.2%', icon: FiBarChart2 },
          { label: 'Net Profit', value: '$23,699', change: '+18.3%', icon: FiTrendingUp },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{metric.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{metric.value}</h3>
            <p className="text-sm text-green-600 font-semibold mt-2">{metric.change}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Monthly Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" />
            <Bar dataKey="expenses" fill="#ef4444" />
            <Bar dataKey="profit" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
