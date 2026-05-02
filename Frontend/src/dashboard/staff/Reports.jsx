import React from 'react';
import { FiBarChart2, FiTrendingUp, FiPieChart, FiDownload } from 'react-icons/fi';

const Reports = () => {
  const reportCategories = [
    { title: 'Sales Performance', desc: 'Daily, weekly and monthly sales trends.', icon: <FiTrendingUp className="text-emerald-500" /> },
    { title: 'Inventory Analytics', desc: 'Stock levels and turnover rates.', icon: <FiBarChart2 className="text-blue-500" /> },
    { title: 'Customer Insights', desc: 'Demographics and purchase behavior.', icon: <FiPieChart className="text-amber-500" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-slate-500 mt-2 font-medium">Analyze your business performance with detailed reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCategories.map((report, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
              {report.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{report.title}</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">{report.desc}</p>
            <button className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all">
              Generate Report
              <FiDownload />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#0F172A] rounded-[2rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Custom Report Builder</h2>
          <p className="text-slate-400 mt-2 max-w-md">Need something specific? Build a custom report by selecting your own parameters and data points.</p>
          <button className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
            Launch Builder
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
        <FiBarChart2 className="absolute -right-10 -bottom-10 text-white/5 text-[15rem] -rotate-12" />
      </div>
    </div>
  );
};

export default Reports;
