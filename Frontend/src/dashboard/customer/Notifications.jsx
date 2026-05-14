import React, { useState, useEffect } from 'react';
import { FiBell, FiClock, FiCheckCircle, FiInfo, FiAlertCircle, FiTrash2, FiMail, FiInbox } from 'react-icons/fi';
import { apiClient as api } from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const getIcon = (type) => {
    switch (type) {
      case 'Success': return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FiCheckCircle size={18} /></div>;
      case 'LowStock': return <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiAlertCircle size={18} /></div>;
      case 'Warning': return <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiAlertCircle size={18} /></div>;
      case 'Error': return <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FiTrash2 size={18} /></div>;
      default: return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiInfo size={18} /></div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Stay updated with your account activity and part requests.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'unread' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Unread
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 w-full bg-white rounded-[24px] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((n) => (
            <div 
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={`group relative bg-white rounded-[32px] p-6 border transition-all duration-300 flex gap-5 cursor-pointer ${
                !n.isRead 
                ? 'border-blue-100 shadow-xl shadow-blue-500/5 bg-gradient-to-br from-white to-blue-50/20' 
                : 'border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex-shrink-0">
                {getIcon(n.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-bold leading-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    <p className="text-slate-500 mt-1.5 leading-relaxed text-sm">
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FiClock size={12} />
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {n.title === 'Procurement Needed' && n.type === 'Warning' && n.relatedId && !n.isRead && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await api.patch(`/partrequests/${n.relatedId}/status`, { status: 'Arrived' });
                          await markAsRead(n.id);
                          alert('Part status updated to Arrived. Customer has been notified.');
                        } catch (err) {
                          alert('Failed to update status.');
                        }
                      }}
                      className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Mark as Arrived
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <FiInbox size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No notifications yet</h3>
          <p className="text-slate-500 mt-2 max-w-sm font-medium">
            When you receive alerts about your orders or requests, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
