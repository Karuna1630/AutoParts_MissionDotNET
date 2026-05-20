import { useEffect, useState } from 'react';
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiPackage,
  FiShoppingCart,
  FiUsers,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';

const money = (value = 0) => `Rs.${Number(value || 0).toLocaleString()}`;

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminStats();
        if (isMounted && response.success) {
          setData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching dashboard stats', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  const alertCount = (data.lowStockCount ?? 0) + (data.outOfStockCount ?? 0) + (data.unpaidInvoices ?? 0);
  const stats = [
    {
      label: 'TOTAL REVENUE',
      value: money(data.totalRevenue),
      subtext: `${data.invoiceCount ?? 0} total invoices`,
      icon: <FiDollarSign />,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'INVENTORY',
      value: data.totalParts ?? 0,
      subtext: `${data.totalStock ?? 0} total units`,
      icon: <FiPackage />,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'CUSTOMERS',
      value: data.totalCustomers ?? 0,
      subtext: `${data.totalUsers ?? 0} registered users`,
      icon: <FiUsers />,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'ALERTS',
      value: alertCount,
      subtext: `${data.lowStockCount ?? 0} low stock, ${data.unpaidInvoices ?? 0} unpaid`,
      icon: <FiAlertTriangle />,
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Snapshot of your business performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
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
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Needs Attention</h2>
            </div>
            <Link to="/admin/analytics" className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
              View Reports <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardTile
              label="Pending Appointments"
              value={data.pendingAppointments ?? 0}
              subtext="Service bookings waiting for action"
              icon={<FiCalendar />}
              to="/admin/analytics"
            />
            <DashboardTile
              label="Part Requests"
              value={data.pendingPartRequests ?? 0}
              subtext="Customer special requests to review"
              icon={<FiPackage />}
              to="/admin/inventory"
            />
            <DashboardTile
              label="Order Requests"
              value={data.pendingOrderRequests ?? 0}
              subtext="Customer part orders not yet completed"
              icon={<FiShoppingCart />}
              to="/admin/analytics"
            />
            <DashboardTile
              label="Inventory Value"
              value={money(data.totalInventoryValue)}
              subtext={`${data.outOfStockCount ?? 0} out of stock, ${data.lowStockCount ?? 0} low stock`}
              icon={<FiDollarSign />}
              to="/admin/inventory"
            />
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <FiShoppingCart className="text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Recent Sales</h2>
            </div>
          </div>

          <div className="space-y-5 flex-1">
            {data.recentSales?.length > 0 ? data.recentSales.map((sale, idx) => {
              const status = sale.status ?? sale.Status;
              return (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{sale.name ?? sale.Name}</p>
                    <p className="text-[10px] font-medium text-slate-400">{sale.date ?? sale.Date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-bold text-slate-800">{sale.amount ?? sale.Amount}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                      status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <EmptyState icon={<FiShoppingCart />} label="No recent sales" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <FiUsers className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">Business Directory</h2>
          </div>
          <div className="space-y-4">
            <InfoRow label="Total Users" value={data.totalUsers ?? 0} />
            <InfoRow label="Customers" value={data.totalCustomers ?? 0} />
            <InfoRow label="Staff Members" value={data.totalStaff ?? 0} />
            <InfoRow label="Vendors" value={data.totalVendors ?? 0} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <FiFileText className="text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Recent Purchases</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {data.purchaseInvoiceCount ?? 0} invoices, {money(data.totalPurchaseAmount)}
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {data.recentPurchases?.length > 0 ? data.recentPurchases.map((purchase, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 py-3.5 text-sm">
                <div>
                  <p className="font-bold text-slate-700">{purchase.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{purchase.date}</p>
                </div>
                <p className="font-medium text-slate-600">{purchase.vendorName}</p>
                <p className="sm:text-right font-bold text-slate-800">{purchase.amount}</p>
              </div>
            )) : (
              <EmptyState icon={<FiFileText />} label="No recent purchases" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardTile = ({ label, value, subtext, icon, to }) => (
  <Link to={to} className="block rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition hover:border-blue-100 hover:bg-blue-50/40">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        <p className="mt-2 text-xs font-medium text-slate-500">{subtext}</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
        {icon}
      </div>
    </div>
  </Link>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
    <span className="text-sm font-medium text-slate-600">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

const EmptyState = ({ icon, label }) => (
  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-xs font-bold">{label}</p>
  </div>
);

export default AdminDashboard;
