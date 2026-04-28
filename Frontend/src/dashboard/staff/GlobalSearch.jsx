import React from 'react';
import { FiSearch, FiBox, FiUsers, FiCalendar, FiFileText } from 'react-icons/fi';

const GlobalSearch = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 pt-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">Global Search</h1>
        <p className="text-slate-500 font-medium text-lg">Quickly find anything across the system.</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 group-focus-within:opacity-20 transition-opacity rounded-full"></div>
        <div className="relative bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] flex items-center p-2">
          <div className="pl-6 pr-4">
            <FiSearch size={28} className="text-blue-500" />
          </div>
          <input 
            type="text" 
            autoFocus
            placeholder="Search by ID, name, license plate, or part number..." 
            className="flex-1 bg-transparent border-none py-6 text-xl font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
          />
          <div className="pr-4 hidden md:block">
            <span className="bg-slate-50 text-slate-400 text-xs font-black px-3 py-1.5 rounded-xl border border-slate-100">
              ESC TO CLEAR
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
        {[
          { label: 'Parts', icon: <FiBox />, count: '2,450' },
          { label: 'Customers', icon: <FiUsers />, count: '128' },
          { label: 'Bookings', icon: <FiCalendar />, count: '42' },
          { label: 'Invoices', icon: <FiFileText />, count: '890' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-2 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group">
            <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
              {React.cloneElement(item.icon, { size: 24 })}
            </div>
            <span className="text-slate-900 font-bold">{item.label}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.count} items</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalSearch;
