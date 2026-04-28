import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiLayout, 
  FiPieChart, 
  FiUsers, 
  FiBox, 
  FiTruck, 
  FiFileText,
  FiLogOut
} from 'react-icons/fi';
import { FaCarSide } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-[#0F172A] text-slate-400 print:hidden">
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

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:bg-red-500/10 hover:text-red-500"
        >
          <FiLogOut />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
