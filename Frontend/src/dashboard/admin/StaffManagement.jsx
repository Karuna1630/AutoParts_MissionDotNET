import React from 'react';
import {
  FaUserTie,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
  FaTrashAlt,
  FaUserPlus,
  FaEnvelope,
  FaPhone,
  FaSpinner,
  FaShieldAlt,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAllUsers, toggleUserStatus, deleteUser } from '../../services/adminService';
import { getApiErrorMessage } from '../../services/api';

const StaffManagement = () => {
  const [staff, setStaff] = React.useState([]);
  const [filteredStaff, setFilteredStaff] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);

  const fetchStaff = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // We filter by 'Staff' role on the frontend or backend. 
      // Our adminService.getAllUsers('Staff') already supports this.
      const res = await getAllUsers('Staff');
      if (res?.success) {
        setStaff(res.data);
        setFilteredStaff(res.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load staff members.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  React.useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      setFilteredStaff(
        staff.filter(
          (s) =>
            s.fullName?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredStaff(staff);
    }
  }, [search, staff]);

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(id);
      const res = await toggleUserStatus(id);
      if (res?.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: res.data.isActive } : s))
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update staff status.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(id);
      const res = await deleteUser(id);
      if (res?.success) {
        setStaff((prev) => prev.filter((s) => s.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete staff member.'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.45s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Staff Management</h1>
          <p className="text-sm text-slate-400">Manage your team members and their access levels</p>
        </div>
        <Link
          to="/admin/create-staff"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
        >
          <FaUserPlus />
          Add New Staff
        </Link>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="relative lg:col-span-3">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
          />
        </div>
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FaUserTie />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 leading-none">Active Staff</p>
            <p className="text-xl font-black text-slate-800">{staff.filter(s => s.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
          <FaUserTie className="mb-4 text-5xl opacity-20" />
          <p className="font-semibold">No staff members found</p>
          <Link to="/admin/create-staff" className="mt-4 text-sm font-bold text-violet-600 hover:underline">
            Create your first staff account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredStaff.map((s) => (
            <div
              key={s.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-xl hover:-translate-y-1"
            >
              {/* Status Indicator */}
              <div className="absolute right-6 top-6">
                {s.isActive ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Avatar & Basic Info */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-violet-200">
                  {s.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{s.fullName}</h3>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <FaShieldAlt className="text-violet-400" /> STAFF MEMBER
                </p>
              </div>

              {/* Contact Info */}
              <div className="mb-8 space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                    <FaEnvelope className="text-xs" />
                  </div>
                  <p className="truncate text-xs font-medium text-slate-600">{s.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                    <FaPhone className="text-xs" />
                  </div>
                  <p className="text-xs font-medium text-slate-600">{s.phone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(s.id)}
                  disabled={actionLoading === s.id}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                    s.isActive
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {actionLoading === s.id ? (
                    <FaSpinner className="animate-spin" />
                  ) : s.isActive ? (
                    <>
                      <FaToggleOn /> Deactivate
                    </>
                  ) : (
                    <>
                      <FaToggleOff /> Activate
                    </>
                  )}
                </button>

                {deleteConfirm === s.id ? (
                  <div className="flex animate-in fade-in slide-in-from-right-2">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="rounded-l-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-r-xl bg-slate-800 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-900"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(s.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white shadow-sm"
                  >
                    <FaTrashAlt />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
