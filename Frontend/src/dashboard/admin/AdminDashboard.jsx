import React from 'react';
import {
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaChartLine,
  FaArrowRight,
  FaUserPlus,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAdminStats, getAllUsers } from '../../services/adminService';
import { getApiErrorMessage } from '../../services/api';

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('authUser') || '{"fullName": "Admin"}');
  const firstName = user.fullName?.split(' ')[0] || 'Admin';

  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalAdmins: 0,
  });
  const [recentUsers, setRecentUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          getAdminStats(),
          getAllUsers(),
        ]);
        if (statsRes?.success) setStats(statsRes.data);
        if (usersRes?.success) setRecentUsers(usersRes.data.slice(0, 5));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load dashboard data.'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, accent: 'violet', gradient: 'from-violet-500 to-indigo-600' },
    { label: 'Customers', value: stats.totalCustomers, icon: FaChartLine, accent: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Staff', value: stats.totalStaff, icon: FaUserTie, accent: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Admins', value: stats.totalAdmins, icon: FaUserShield, accent: 'amber', gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-[fade-in_0.45s_ease-out]">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a103d] via-[#2d1b69] to-[#4c1d95] p-8 text-white shadow-2xl shadow-violet-950/20 sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-size-[20px_20px]" />
        
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
              <FaUserShield className="text-violet-300" />
              Admin Panel
            </div>
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Welcome, {firstName}
            </h1>
            <p className="max-w-xl text-lg font-medium text-violet-100/70">
              Manage your AutoParts platform — users, staff, and system operations from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/admin/create-staff"
              className="flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-bold text-violet-900 shadow-xl transition hover:-translate-y-1 hover:shadow-white/10"
            >
              <FaUserPlus className="text-violet-600" />
              Add Staff
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 rounded-2xl bg-[#312e81]/40 px-7 py-4 text-sm font-bold text-white backdrop-blur-md border border-white/10 transition hover:bg-[#312e81]/60"
            >
              <FaUsers className="text-violet-200" />
              View Users
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative flex items-center justify-between rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-4xl font-black text-slate-800">
                {loading ? (
                  <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-slate-100" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${
              stat.accent === 'violet' ? 'bg-violet-600 shadow-violet-200' :
              stat.accent === 'blue' ? 'bg-blue-500 shadow-blue-200' :
              stat.accent === 'emerald' ? 'bg-emerald-500 shadow-emerald-200' :
              'bg-orange-500 shadow-orange-200'
            } text-white`}>
              <stat.icon className="text-2xl" />
            </div>
          </div>
        ))}
      </section>

      {/* Recent Users Section */}
      <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Users</h2>
            <p className="text-sm font-medium text-slate-400">Latest registered users across the platform</p>
          </div>
          <Link
            to="/admin/users"
            className="group flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-800 transition"
          >
            View all <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex h-20 w-full animate-pulse rounded-2xl bg-slate-50" />
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <FaUsers className="mb-4 text-5xl opacity-20" />
            <p className="font-bold">No registered users yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="group flex items-center gap-5 rounded-2xl border border-slate-50 bg-white p-5 transition-all hover:bg-slate-50/50 hover:shadow-md"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-sm font-black text-white shadow-lg">
                  {u.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-violet-600 transition-colors">{u.fullName}</h4>
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'Admin' ? 'bg-violet-100 text-violet-700' :
                      u.role === 'Staff' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium text-slate-400">{u.email}</p>
                </div>

                {/* Status & Date */}
                <div className="flex items-center gap-8">
                  <div className="hidden sm:block">
                    {u.isActive ? (
                      <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-rose-500 border border-rose-100">
                        <FaTimesCircle className="text-[10px]" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="hidden text-right text-xs font-bold text-slate-400 lg:flex items-center gap-2">
                    <FaClock className="text-[10px]" />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
