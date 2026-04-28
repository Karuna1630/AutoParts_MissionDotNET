import React from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Vendors = () => {
  const [vendors] = React.useState([
    { id: 1, name: 'AutoParts Ltd', contact: 'John Doe', phone: '+1-555-0123', email: 'john@autopartsltd.com', items: 24 },
    { id: 2, name: 'Global Motors Inc', contact: 'Sarah Smith', phone: '+1-555-0456', email: 'sarah@globalmotors.com', items: 18 },
    { id: 3, name: 'Precision Parts Co', contact: 'Mike Johnson', phone: '+1-555-0789', email: 'mike@precisionparts.com', items: 32 },
    { id: 4, name: 'QuickShip Supplies', contact: 'Emily Davis', phone: '+1-555-1012', email: 'emily@quickship.com', items: 15 },
  ]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-slate-500 mt-1">Manage all your suppliers and vendors</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FiPlus /> Add Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 w-96">
        <FiSearch className="text-slate-400" />
        <input
          type="text"
          placeholder="Search vendors..."
          className="bg-transparent border-none focus:outline-none ml-3 text-sm w-full"
        />
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Vendor Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Contact</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Items</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{vendor.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{vendor.contact}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{vendor.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{vendor.email}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{vendor.items}</td>
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

export default Vendors;
