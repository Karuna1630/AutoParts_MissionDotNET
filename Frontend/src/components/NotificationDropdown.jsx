import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiClock, FiCheckCircle, FiInfo, FiAlertCircle, FiX } from 'react-icons/fi';
import { apiClient as api } from '../services/api';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Success': return <FiCheckCircle className="text-emerald-500" />;
      case 'Warning': return <FiAlertCircle className="text-amber-500" />;
      case 'Error': return <FiX className="text-red-500" />;
      default: return <FiInfo className="text-blue-500" />;
    }
  };

  const getNotificationsLink = () => {
    try {
      const user = JSON.parse(localStorage.getItem('authUser'));
      if (user?.role === 'Admin') return '/admin/notifications';
      if (user?.role === 'Staff') return '/staff/notifications';
    } catch (e) {}
    return '/dashboard/notifications';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-[24px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Notifications</h3>
            {unreadCount > 0 && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
                      <FiClock size={10} /> {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />}
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <FiBell size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications.</p>
              </div>
            )}
          </div>

          <Link 
            to={getNotificationsLink()} 
            onClick={() => setIsOpen(false)}
            className="block p-3 text-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-all border-t border-slate-50"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
