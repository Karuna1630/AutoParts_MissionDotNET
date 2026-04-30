import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaThLarge, FaUsers, FaUserTie,
  FaSignOutAlt, FaUserCog, FaCarSide, FaShieldAlt
} from 'react-icons/fa';

const sidebarGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: FaThLarge, path: '/admin' },
    ]
  },
  {
    title: 'USER MANAGEMENT',
    items: [
      { id: 'users', label: 'All Users', icon: FaUsers, path: '/admin/users' },
      { id: 'staff', label: 'Staff Management', icon: FaUserTie, path: '/admin/staff' },
    ]
  },
];

const AdminLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser') || '{"fullName": "Admin", "role": "Admin"}');

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-[#0a0a0f] text-slate-400 shadow-2xl">
        <div className="flex h-24 items-center gap-4 px-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-600/40 transition-transform hover:rotate-12">
            <FaShieldAlt className="text-xl text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black leading-none tracking-tight text-white">AutoParts</h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 opacity-80">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-10 overflow-y-auto px-6 py-10">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-6 px-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500/70">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/admin' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300 ${
                        isActive 
                          ? 'bg-violet-600 text-white shadow-2xl shadow-violet-600/40 scale-[1.02]' 
                          : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className={`text-lg ${isActive ? 'text-white' : 'text-slate-500 transition-colors group-hover:text-white'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-4 rounded-2xl bg-white/5 px-6 py-4 text-sm font-bold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500"
          >
            <FaSignOutAlt className="text-lg" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-24 items-center justify-end bg-white/80 px-10 backdrop-blur-md border-b border-slate-100">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group flex items-center gap-5 transition-all"
            >
              <div className="text-right">
                <p className="text-sm font-black uppercase tracking-widest text-slate-800 group-hover:text-violet-600 transition-colors">
                  {user.fullName || 'SYSTEM ADMIN'}
                </p>
                <span className="rounded-lg bg-violet-50 px-2 py-0.5 text-[10px] font-black text-violet-600 uppercase tracking-tighter">
                  {user.role || 'Admin'}
                </span>
              </div>
              <div className="flex h-12 w-12 overflow-hidden items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg transition-all group-hover:shadow-violet-200 group-hover:scale-105">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black">{user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-4 w-56 origin-top-right rounded-[2rem] border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-200/60 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Account</p>
                </div>
                <Link 
                  to="/admin" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-violet-600"
                >
                  <FaUserCog className="text-base" />
                  Admin Settings
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 transition hover:bg-rose-50"
                >
                  <FaSignOutAlt className="text-base" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
