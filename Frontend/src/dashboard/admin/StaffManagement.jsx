import React from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const StaffManagement = () => {
  const [staff] = React.useState([
    { id: 1, name: 'John Smith', email: 'john@autoparts.com', role: 'Staff', joinDate: '2025-08-15', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@autoparts.com', role: 'Staff', joinDate: '2025-10-20', status: 'Active' },
    { id: 3, name: 'Mike Davis', email: 'mike@autoparts.com', role: 'Staff', joinDate: '2025-09-10', status: 'Active' },
    { id: 4, name: 'Emily Wilson', email: 'emily@autoparts.com', role: 'Staff', joinDate: '2025-11-05', status: 'Inactive' },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage your team members and staff</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FiPlus /> Add Staff Member
        </button>
      </div>



      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Role</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Join Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{member.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{member.role}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(member.joinDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
                    <FiEdit2 size={16} />
                  </button>
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
