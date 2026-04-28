import React from 'react';
import {
  FaUsers,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
  FaTrashAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaFilter,
  FaSpinner,
} from 'react-icons/fa';
import { getAllUsers, toggleUserStatus, deleteUser } from '../../services/adminService';
import { getApiErrorMessage } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = React.useState([]);
  const [filteredUsers, setFilteredUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllUsers();
      if (res?.success) {
        setUsers(res.data);
        setFilteredUsers(res.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    let result = users;
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      );
    }
    setFilteredUsers(result);
  }, [search, roleFilter, users]);

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(id);
      const res = await toggleUserStatus(id);
      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update user status.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(id);
      const res = await deleteUser(id);
      if (res?.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete user.'));
    } finally {
      setActionLoading(null);
    }
  };

  const roleCounts = React.useMemo(() => {
    const counts = { All: users.length, Customer: 0, Staff: 0, Admin: 0 };
    users.forEach((u) => {
      if (counts[u.role] !== undefined) counts[u.role]++;
    });
    return counts;
  }, [users]);

  return (
    <div className="space-y-6 animate-[fade-in_0.45s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">User Management</h1>
          <p className="text-sm text-slate-400">View and manage all platform users</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5">
          <FaUsers className="text-violet-600" />
          <span className="text-sm font-bold text-violet-700">{users.length}</span>
          <span className="text-sm text-violet-500">total users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <FaFilter className="text-slate-400" />
          {['', 'Customer', 'Staff', 'Admin'].map((role) => {
            const label = role || 'All';
            const isActive = roleFilter === role;
            return (
              <button
                key={label}
                onClick={() => setRoleFilter(role)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label} ({roleCounts[label] ?? 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-semibold underline">Dismiss</button>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-slate-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-56 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200" />
                <div className="h-8 w-20 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FaUsers className="mb-3 text-4xl" />
            <p className="font-semibold">No users found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Table Header */}
            <div className="hidden items-center gap-4 bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 lg:flex">
              <div className="w-10" />
              <div className="flex-1">User</div>
              <div className="w-24 text-center">Role</div>
              <div className="w-36">Contact</div>
              <div className="w-24 text-center">Status</div>
              <div className="w-28 text-center">Joined</div>
              <div className="w-28 text-center">Actions</div>
            </div>

            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="group flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-slate-50/80 lg:flex-nowrap"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                  {u.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>

                {/* Name & Email */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-800">{u.fullName}</h4>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                    <FaEnvelope className="text-[10px]" /> {u.email}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="w-24 text-center">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                      u.role === 'Admin'
                        ? 'bg-violet-100 text-violet-700'
                        : u.role === 'Staff'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                {/* Phone */}
                <div className="hidden w-36 items-center gap-1 text-xs text-slate-500 lg:flex">
                  <FaPhone className="text-[10px] text-slate-400" /> {u.phone || '—'}
                </div>

                {/* Status */}
                <div className="w-24 text-center">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                      <FaCheckCircle className="text-[8px]" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-500">
                      <FaTimesCircle className="text-[8px]" /> Inactive
                    </span>
                  )}
                </div>

                {/* Joined */}
                <div className="hidden w-28 text-center text-xs text-slate-400 lg:block">
                  <FaClock className="mb-0.5 inline text-[10px]" />{' '}
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex w-28 items-center justify-center gap-2">
                  {u.role !== 'Admin' && (
                    <>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        disabled={actionLoading === u.id}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        className={`rounded-lg p-2 text-sm transition ${
                          u.isActive
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        } disabled:opacity-50`}
                      >
                        {actionLoading === u.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : u.isActive ? (
                          <FaToggleOn />
                        ) : (
                          <FaToggleOff />
                        )}
                      </button>

                      {deleteConfirm === u.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={actionLoading === u.id}
                            className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            {actionLoading === u.id ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 transition hover:bg-slate-200"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(u.id)}
                          title="Delete user"
                          className="rounded-lg p-2 text-sm text-red-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
