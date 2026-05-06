import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaThLarge, FaCar, FaCalendarCheck, FaBell, 
  FaShoppingBag, FaFileAlt, FaHistory, FaWaveSquare,
  FaWallet, FaGift, FaUserCog, FaSignOutAlt, FaCarSide
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import CartDrawer from './CartDrawer';
import { FiShoppingBag } from 'react-icons/fi';

const sidebarGroups = [
  {
    title: 'MY ACCOUNT',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: FaThLarge, path: '/dashboard' },
      { id: 'vehicles', label: 'My Vehicles', icon: FaCar, path: '/dashboard/vehicles' },
      { id: 'appointments', label: 'Appointments', icon: FaCalendarCheck, path: '/dashboard/appointments' },
      { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/dashboard/notifications' },
    ]
  },
  {
    title: 'SERVICE',
    items: [
      { id: 'shop', label: 'Parts Shop', icon: FaShoppingBag, path: '/dashboard/shop' },
      { id: 'requests', label: 'Part Requests', icon: FaFileAlt, path: '/dashboard/requests' },
      { id: 'history', label: 'Transaction History', icon: FaHistory, path: '/dashboard/history' },
      { id: 'predictor', label: 'Health Predictor', icon: FaWaveSquare, path: '/dashboard/predictor' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { id: 'wallet', label: 'Points Wallet', icon: FaWallet, path: '/dashboard/wallet' },
      { id: 'rewards', label: 'Rewards', icon: FaGift, path: '/dashboard/rewards' },
      { id: 'profile', label: 'Profile & Settings', icon: FaUserCog, path: '/dashboard/profile' },
    ]
  }
];

const CustomerLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const { itemCount } = useCart();
  const dropdownRef = React.useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('authUser') || '{"fullName": "Pukar Bohara", "role": "Customer"}');

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
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-[#0F172A] text-slate-400">
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
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                          : 'hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className={isActive ? 'text-white' : 'text-slate-400'} />
                      {item.label}
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
            <FaSignOutAlt />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-end bg-white/80 px-8 backdrop-blur-md gap-6">
          {/* Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 group"
          >
            <FiShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg shadow-blue-600/30 animate-in zoom-in">
                {itemCount}
              </span>
            )}
          </button>

          <div className="h-8 w-px bg-slate-100" />

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group flex items-center gap-4 transition-all"
            >
              <div className="text-right">
                <p className="text-sm font-black uppercase tracking-tight text-slate-800 group-hover:text-blue-600">{user.fullName}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {user.role || 'Customer'}
                </span>
              </div>
              <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-sm transition-all group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:shadow-md border-2 border-transparent group-hover:border-blue-100">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black">{user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-200">
                <Link 
                  to="/dashboard/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                >
                  <FaUserCog className="text-xs" />
                  View Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  <FaSignOutAlt className="text-xs" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
