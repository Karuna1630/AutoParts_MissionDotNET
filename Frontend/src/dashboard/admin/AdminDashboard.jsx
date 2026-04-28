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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1035] via-[#1e1145] to-[#4c1d95] p-6 text-white shadow-xl shadow-violet-950/30 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-size-[14px_14px]" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              <FaUserShield className="text-violet-300" />
              Admin Panel
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome, {firstName}
            </h1>
            <p className="max-w-xl text-base text-violet-100/80 sm:text-lg">
              Manage your AutoParts platform — users, staff, and system operations from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/create-staff"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50 active:translate-y-0"
            >
              <FaUserPlus className="text-violet-600" />
              Add Staff
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
            >
              <FaUsers className="text-violet-200" />
              View Users
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800">
                  {loading ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                <stat.icon className="text-lg" />
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
          </div>
        ))}
      </section>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Recent Users Table */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Recent Users</h2>
            <p className="text-sm text-slate-400">Latest registered users across the platform</p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            View all <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-3 w-48 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <FaUsers className="mb-3 text-3xl" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="group flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50 sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                  {u.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-800">{u.fullName}</h4>
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      u.role === 'Admin'
                        ? 'bg-violet-100 text-violet-700'
                        : u.role === 'Staff'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-400">{u.email}</p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  {u.isActive ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                      <FaCheckCircle className="text-[8px]" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-500">
                      <FaTimesCircle className="text-[8px]" /> Inactive
                    </span>
                  )}
                </div>
                <div className="hidden text-right text-xs text-slate-400 lg:block">
                  <FaClock className="mb-0.5 inline text-[10px]" />{' '}
                  {new Date(u.createdAt).toLocaleDateString()}
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
