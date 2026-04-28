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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your team members and their administrative access.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/create-staff')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition active:scale-95"
        >
          <FiPlus /> Add Staff Member
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-semibold">
          {error}
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Role & Access</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.length > 0 ? staff.map((member) => (
                <tr key={member.identityId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {member.profilePictureUrl ? (
                          <img src={member.profilePictureUrl} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{member.firstName[0]}{member.lastName[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{member.firstName} {member.lastName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <FiCalendar className="text-[10px]" /> 
                          Joined {new Date(member.registrationDate || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiMail className="text-slate-400" size={14} />
                        {member.email}
                      </div>
                      <p className="text-xs text-slate-400 ml-5">{member.phoneNumber || 'No phone'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.identityId, e.target.value)}
                      className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    >
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 w-fit">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(member.identityId)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition"
                        title="Delete Member"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FiUser size={48} className="opacity-20" />
                      <p className="font-medium text-lg">No staff members found</p>
                      <button onClick={fetchStaff} className="text-blue-600 font-bold hover:underline">Refresh list</button>
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
