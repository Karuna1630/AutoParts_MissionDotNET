import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getStaff, deleteStaff, updateStaffRole } from '../../services/staffService';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaff();
      if (response.success) {
        setStaff(response.data.items);
      }
    } catch (err) {
      setError('Failed to fetch staff members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        setStaff(staff.filter(s => s.identityId !== id));
      } catch (err) {
        alert('Failed to delete staff member.');
      }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateStaffRole(id, newRole);
      setStaff(staff.map(s => s.identityId === id ? { ...s, role: newRole } : s));
    } catch (err) {
      alert('Failed to update role.');
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Team Members</h1>
          <p className="text-slate-500 font-medium mt-2">Manage access levels and monitor your administrative team.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/create-staff')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all active:scale-95"
        >
          <FiPlus size={20} /> Add New Staff
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm">
          {error}
        </div>
      )}

      {/* Stats Quick View (Optional but looks premium) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl text-xl">
            <FiUser />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff</p>
            <h3 className="text-2xl font-bold text-slate-900">{staff.length} Members</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl text-xl">
            <FiShield />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Admins</p>
            <h3 className="text-2xl font-bold text-slate-900">{staff.filter(s => s.role === 'ADMIN').length} Admins</h3>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profile</th>
                <th className="px-10 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contact & Identity</th>
                <th className="px-10 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-10 py-6 text-left text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-right text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.length > 0 ? staff.map((member) => (
                <tr key={member.identityId} className="hover:bg-slate-50/30 transition-colors group">
                  {/* Profile Column */}
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                          {member.profilePictureUrl ? (
                            <img src={member.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{member.firstName[0]}{member.lastName[0]}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg leading-tight">{member.firstName} {member.lastName}</p>
                        <p className="text-slate-400 text-xs font-medium mt-1 flex items-center gap-1.5">
                          <FiCalendar className="text-[10px]" /> 
                          Joined {new Date(member.registrationDate || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact Column */}
                  <td className="px-10 py-8">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FiMail className="text-slate-400" size={12} />
                        </div>
                        {member.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <div className="w-6 h-6 bg-transparent" />
                        ID: {member.identityId.toString().substring(0, 8)}...
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="px-10 py-8">
                    <div className="relative inline-block w-40">
                      <select 
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.identityId, e.target.value)}
                        className={`w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 appearance-none cursor-pointer ${
                          member.role === 'ADMIN' ? 'text-indigo-600' : 'text-slate-600'
                        }`}
                      >
                        <option value="STAFF">Standard Staff</option>
                        <option value="ADMIN">System Admin</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                        <FiShield size={14} />
                      </div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-10 py-8">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      ACCOUNT ACTIVE
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 transition-all">
                      <button 
                        onClick={() => handleDelete(member.identityId)}
                        className="w-11 h-11 flex items-center justify-center text-slate-400 bg-white border border-slate-100 shadow-sm hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-2xl transition-all active:scale-90"
                        title="Delete Member"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-2">
                        <FiUsers size={40} className="opacity-20" />
                      </div>
                      <p className="font-bold text-xl text-slate-400">No team members found</p>
                      <p className="text-sm text-slate-400 max-w-xs">Start building your team by adding your first staff member.</p>
                      <button onClick={fetchStaff} className="text-blue-600 font-bold hover:underline mt-2">Refresh database</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
