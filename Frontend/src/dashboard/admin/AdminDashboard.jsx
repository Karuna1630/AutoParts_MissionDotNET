import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiPackage, 
  FiUsers, 
  FiAlertTriangle, 
  FiActivity,
  FiShoppingCart,
  FiArrowRight
} from 'react-icons/fi';
import { getAdminStats } from '../../services/adminService';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getAdminStats();
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'TOTAL REVENUE', 
      value: `Rs.${(data?.totalRevenue ?? 0).toLocaleString()}`, 
      subtext: `${data?.invoiceCount ?? 0} total invoices`, 
      icon: <FiDollarSign />, 
      bgColor: 'bg-emerald-50', 
      iconColor: 'text-emerald-600' 
    },
    { 
      label: 'INVENTORY', 
      value: data?.totalParts ?? 0, 
      subtext: `${data?.totalStock ?? 0} total units`, 
      icon: <FiPackage />, 
      bgColor: 'bg-blue-50', 
      iconColor: 'text-blue-600' 
    },
    { 
      label: 'CUSTOMERS', 
      value: data?.totalCustomers ?? 0, 
      subtext: 'Registered users', 
      icon: <FiUsers />, 
      bgColor: 'bg-indigo-50', 
      iconColor: 'text-indigo-600' 
    },
    { 
      label: 'SYSTEM ALERTS', 
      value: (data?.lowStockCount ?? 0) + (data?.unpaidInvoices ?? 0), 
      subtext: `${data?.lowStockCount ?? 0} low stock • ${data?.unpaidInvoices ?? 0} unpaid`, 
      icon: <FiAlertTriangle />, 
      bgColor: 'bg-rose-50', 
      iconColor: 'text-rose-600' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Snapshot of your business performance</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <FiActivity className="animate-pulse text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Live System Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-500">{stat.subtext}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.iconColor} text-xl transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Health Section */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <FiActivity className="text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Operational Health</h2>
            </div>
            <Link to="/admin/reports" className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
              View Reports <FiArrowRight />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-5">
              <StatusRow label="Inventory Integrity" value="98%" color="text-emerald-600" />
              <StatusRow label="System Uptime" value="100%" color="text-blue-600" />
              <StatusRow label="Data Sync" value="Real-time" color="text-indigo-600" />
              <StatusRow label="Active Staff" value="Online" color="text-emerald-500" />
            </div>
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <FiActivity className="text-xl" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">System Healthy</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                All core services are running optimally. No critical errors detected in the last 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <FiShoppingCart className="text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Recent Sales</h2>
            </div>
          </div>

          <div className="space-y-5 flex-1">
            {data?.recentSales?.length > 0 ? data.recentSales.map((sale, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{sale.Name}</p>
                  <p className="text-[10px] font-medium text-slate-400">{sale.Date}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-slate-800">{sale.Amount}</p>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                    sale.Status === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {sale.Status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <FiShoppingCart className="text-3xl mb-2" />
                <p className="text-xs font-bold">No recent sales</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
    <span className="text-sm font-medium text-slate-600">{label}</span>
    <span className={`text-sm font-bold ${color}`}>{value}</span>
  </div>
);

export default AdminDashboard;

