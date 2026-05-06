import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSearch, FiBell } from 'react-icons/fi';
import StaffSidebar from './StaffSidebar';

const StaffLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const navigate = useNavigate();
  const [staff, setStaff] = React.useState({ fullName: '', role: 'Staff' });

  React.useEffect(() => {
    const loadStaffData = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          setStaff(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error parsing authUser:', error);
      }
    };

    loadStaffData();

    window.addEventListener('profileUpdated', loadStaffData);
    window.addEventListener('storage', loadStaffData);

    return () => {
      window.removeEventListener('profileUpdated', loadStaffData);
      window.removeEventListener('storage', loadStaffData);
    };
  }, []);

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url; 
  };

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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <StaffSidebar />

      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <header className="sticky top-0 z-40 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96">
            <FiSearch className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers, appointments..." 
              className="bg-transparent border-none focus:outline-none ml-3 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </button>

            <div className="relative border-l border-slate-200 pl-6" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group flex items-center gap-3 transition-all"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{staff.fullName || 'Staff Member'}</p>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                    {staff.role || 'Staff'}
                  </span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105 overflow-hidden border-2 border-slate-700 shadow-inner">
                  {staff.avatarUrl ? (
                    <img 
                      src={getAvatarUrl(staff.avatarUrl)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null;
                        setStaff(prev => ({ ...prev, avatarUrl: null }));
                      }}
                    />
                  ) : (
                    <span>{staff.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}</span>
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-200">
                  <Link 
                    to="/staff/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 w-full"
                  >
                    <FiUser className="text-xs" />
                    View Profile
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <button 
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <FiLogOut className="text-xs" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
