import React from 'react';
import { FiPlus, FiEdit2, FiAlertCircle } from 'react-icons/fi';

const Inventory = () => {
  const [items] = React.useState([
    { id: 1, sku: 'SKU001', name: 'Engine Oil 5L', quantity: 45, minStock: 20, status: 'In Stock' },
    { id: 2, sku: 'SKU002', name: 'Air Filter', quantity: 8, minStock: 15, status: 'Low Stock' },
    { id: 3, sku: 'SKU003', name: 'Spark Plugs Set', quantity: 32, minStock: 10, status: 'In Stock' },
    { id: 4, sku: 'SKU004', name: 'Battery 12V', quantity: 5, minStock: 10, status: 'Critical' },
    { id: 5, sku: 'SKU005', name: 'Brake Pads', quantity: 22, minStock: 15, status: 'In Stock' },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Track and manage all inventory items</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FiPlus /> Add Item
        </button>
      </div>



      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Items', value: '240' },
          { label: 'Low Stock', value: '8' },
          { label: 'Total SKUs', value: '12' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">SKU</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Item Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Quantity</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Min Stock</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{item.sku}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.minStock}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                    item.status === 'In Stock'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'Low Stock'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'Critical' && <FiAlertCircle size={14} />}
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
                    <FiEdit2 size={16} />
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

export default Inventory;
