import React from 'react';
import { FiShoppingCart, FiUsers, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const StaffDashboard = () => {
  const stats = [
    { label: 'SALES TODAY', value: '$0', subValue: '0 invoices', icon: <FiShoppingCart />, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'CUSTOMERS', value: '4', icon: <FiUsers />, color: 'bg-blue-100 text-blue-600' },
    { label: 'OPEN APPOINTMENTS', value: '3', icon: <FiCalendar />, color: 'bg-amber-100 text-amber-600' },
    { label: 'PENDING REQUESTS', value: '1', icon: <FiMessageSquare />, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const appointments = [
    {
      title: 'Brake Inspection',
      customer: 'James Carter',
      vehicle: 'Toyota Corolla (AB-1234)',
      date: '4/27/2026, 11:35:49 AM',
      status: 'Pending'
    },
    {
      title: 'Oil Change',
      customer: 'Sara Lee',
      vehicle: 'Ford Focus (CD-9999)',
      date: '4/30/2026, 11:35:49 AM',
      status: 'Pending'
    },
    {
      title: 'Tire Rotation',
      customer: 'Tom Becker',
      vehicle: 'Hyundai Tucson (EF-2020)',
      date: '4/24/2026, 11:35:49 AM',
      status: 'Active'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome, Priya</h1>
        <p className="text-slate-500 mt-2 font-medium">Daily operations dashboard for retail and service desk.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                {stat.subValue && <p className="text-xs text-slate-400 font-medium">{stat.subValue}</p>}
              </div>
              <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                {React.cloneElement(stat.icon, { size: 24 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-slate-800">Upcoming appointments</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {appointments.map((apt, idx) => (
            <div key={idx} className="p-8 hover:bg-slate-50/50 transition-colors group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{apt.title}</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    {apt.customer} · <span className="text-slate-400">{apt.vehicle}</span>
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    apt.status === 'Active' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {apt.status}
                  </span>
                  <p className="text-xs text-slate-400 font-medium">{apt.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
