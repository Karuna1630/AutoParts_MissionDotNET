import React from 'react';
import { FiUsers, FiPlus, FiFilter } from 'react-icons/fi';

const Customers = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and view your customer directory.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
          <FiPlus />
          New Customer
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
            <FiFilter />
            Filter
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
            <FiUsers size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No customers found</h3>
          <p className="text-slate-500 mt-2 max-w-xs">Start by adding your first customer to the system.</p>
        </div>
      </div>
    </div>
  );
};

export default Customers;
