import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiLayout, 
  FiUsers, 
  FiShoppingCart, 
  FiSearch, 
  FiBarChart2,
  FiCalendar,
  FiPackage,
  FiFileText
} from 'react-icons/fi';
import { FaCarSide } from 'react-icons/fa';

const StaffSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { 
      section: 'OVERVIEW',
      items: [
        { name: 'Dashboard', icon: <FiLayout />, path: '/staff' },
      ]
    },
    {
      section: 'DAILY OPERATIONS',
      items: [
        { name: 'Customers', icon: <FiUsers />, path: '/staff/customers' },
        { name: 'Bulk Orders', icon: <FiPackage />, path: '/staff/bulk-orders' },
        { name: 'Point of Sale', icon: <FiShoppingCart />, path: '/staff/pos' },
        { name: 'Global Search', icon: <FiSearch />, path: '/staff/search' },
        { name: 'Appointments', icon: <FiCalendar />, path: '/staff/appointments' },
        { name: 'Part Requests', icon: <FiFileText />, path: '/staff/part-requests' },
        { name: 'Reports', icon: <FiBarChart2 />, path: '/staff/reports' },
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-[#0F172A] text-slate-400">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/40">
          <FaCarSide className="text-lg text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold leading-none tracking-tight text-white">AutoParts</h2>
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Vehicle MIS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <h2 className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              {section.section}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">
          © AutoParts Systems
        </div>
      </div>
    </aside>
  );
};

export default StaffSidebar;
