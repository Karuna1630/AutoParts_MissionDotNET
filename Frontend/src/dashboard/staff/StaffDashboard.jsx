import { useState, useEffect } from 'react';
import { FiShoppingCart, FiUsers, FiPackage, FiActivity, FiArrowRight, FiCheckCircle, FiClock } from 'react-icons/fi';
import { getStaffDashboardStats } from '../../services/staffService';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStaffDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch staff stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  const metricCards = [
    { 
      label: 'Sales Today', 
      value: `Rs.${stats.salesToday.toLocaleString()}`, 
      subtext: `${stats.invoicesTodayCount} Invoices`,
      icon: FiShoppingCart, 
      color: 'blue' 
    },
    { 
      label: 'Total Customers', 
      value: stats.totalCustomers, 
      subtext: 'Registered Base',
      icon: FiUsers, 
      color: 'emerald' 
    },
    { 
      label: 'Low Stock Parts', 
      value: stats.lowStockCount, 
      subtext: 'Action Required',
      icon: FiPackage, 
      color: 'amber' 
    },
    { 
      label: 'Pending Requests', 
      value: stats.pendingRequests, 
      subtext: 'Special Orders',
      icon: FiActivity, 
      color: 'indigo' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome, {user.fullName?.split(' ')[0] || 'Staff'}</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Here's what's happening at the store today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/staff/pos" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2">
            <FiShoppingCart /> New Sale
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Transactions Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiActivity className="text-blue-500" />
              Recent Transactions
            </h2>
            <Link to="/staff/sales" className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentSales.map((sale, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-700">{sale.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">Rs.{sale.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit ${
                        sale.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {sale.status === 'Paid' ? <FiCheckCircle size={10} /> : <FiClock size={10} />}
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, subtext, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${colors[color]}`}>
        <Icon />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      <p className="text-[11px] font-medium text-slate-500 mt-2">{subtext}</p>
    </div>
  );
};

export default StaffDashboard;
