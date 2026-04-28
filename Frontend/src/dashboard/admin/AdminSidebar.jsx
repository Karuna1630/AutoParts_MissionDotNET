import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiLayout, 
  FiPieChart, 
  FiUsers, 
  FiBox, 
  FiTruck, 
  FiFileText
} from 'react-icons/fi';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      section: 'OVERVIEW',
      items: [
        { name: 'Dashboard', icon: <FiLayout />, path: '/admin' },
        { name: 'Financial Analytics', icon: <FiPieChart />, path: '/admin/analytics' },
      ]
    },
    {
      section: 'OPERATIONS',
      items: [
        { name: 'Staff Management', icon: <FiUsers />, path: '/admin/staff' },
        { name: 'Inventory', icon: <FiBox />, path: '/admin/inventory' },
        { name: 'Vendors', icon: <FiTruck />, path: '/admin/vendors' },
        { name: 'Purchase Invoices', icon: <FiFileText />, path: '/admin/invoices' },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col fixed h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          A
        </div>
        <div className="leading-none">
          <h1 className="text-white font-bold text-lg leading-tight">AutoParts</h1>
          <p className="text-[10px] text-slate-400 tracking-wider">VEHICLE MIS</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-8">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <h2 className="px-4 text-[11px] font-semibold text-slate-500 tracking-widest mb-4">
              {section.section}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
