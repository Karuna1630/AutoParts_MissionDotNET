import React from 'react';
import { 
  FiDollarSign, 
  FiPackage, 
  FiUsers, 
  FiAlertTriangle, 
  FiTrendingUp, 
  FiShoppingCart
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const stats = [
    { 
      label: 'TOTAL REVENUE', 
      value: '$31,939', 
      subtext: '7 invoices', 
      icon: <FiDollarSign />, 
      bgColor: 'bg-green-50', 
      iconColor: 'text-green-500' 
    },
    { 
      label: 'INVENTORY SKUS', 
      value: '12', 
      subtext: '240 units', 
      icon: <FiPackage />, 
      bgColor: 'bg-blue-50', 
      iconColor: 'text-blue-500' 
    },
    { 
      label: 'CUSTOMERS', 
      value: '4', 
      subtext: '2 staff members', 
      icon: <FiUsers />, 
      bgColor: 'bg-indigo-50', 
      iconColor: 'text-indigo-500' 
    },
    { 
      label: 'ALERTS', 
      value: '6', 
      subtext: '5 low stock • 1 overdue', 
      icon: <FiAlertTriangle />, 
      bgColor: 'bg-orange-50', 
      iconColor: 'text-orange-500' 
    },
  ];

  const chartData = [
    { name: '2025-10', revenue: 2000 },
    { name: '2025-11', revenue: 5500 },
    { name: '2025-12', revenue: 6300 },
    { name: '2026-01', revenue: 6500 },
    { name: '2026-02', revenue: 13500 },
    { name: '2026-03', revenue: 13000 },
    { name: '2026-04', revenue: 14000 },
  ];

  const recentSales = [
    { name: 'James Carter', date: '4/23/2026', amount: '$2,690', status: 'Paid', statusColor: 'bg-slate-100 text-slate-600' },
    { name: 'Sara Lee', date: '4/17/2026', amount: '$9,720', status: 'Paid', statusColor: 'bg-slate-100 text-slate-600' },
    { name: 'Tom Becker', date: '3/11/2026', amount: '$6,480', status: 'Overdue', statusColor: 'bg-red-500 text-white' },
    { name: 'Maya Iyer', date: '4/10/2026', amount: '$880', status: 'Credit', statusColor: 'bg-orange-100 text-orange-700' },
    { name: 'James Carter', date: '2/24/2026', amount: '$6,219', status: 'Paid', statusColor: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">System-wide health, revenue and inventory at a glance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.iconColor} text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <FiTrendingUp className="text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900">Revenue trend</h2>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-8">
              <FiShoppingCart className="text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900">Recent sales</h2>
            </div>

            <div className="space-y-6 flex-1">
              {recentSales.map((sale, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">{sale.name}</p>
                    <p className="text-xs text-slate-400">{sale.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-slate-800">{sale.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sale.statusColor}`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
