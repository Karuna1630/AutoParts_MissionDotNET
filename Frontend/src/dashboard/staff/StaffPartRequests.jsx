import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiTruck, FiInfo, FiPackage, FiAlertCircle, FiArrowRight, FiEdit, FiUser } from 'react-icons/fi';
import { apiClient as api, getApiErrorMessage } from '../../services/api';

const StaffPartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Status Update Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partrequests/all');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      setUpdating(true);
      // Assuming a PATCH endpoint for status update exists or we add it
      const res = await api.patch(`/partrequests/${selectedRequest.id}/status`, { status });
      if (res.data.success) {
        setSuccess(`Request status updated to ${status}!`);
        setShowModal(false);
        fetchRequests();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <FiClock /> };
      case 'Checking': return { label: 'Checking', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <FiInfo /> };
      case 'Ordered': return { label: 'Ordered', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: <FiTruck /> };
      case 'Arrived': return { label: 'Arrived', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <FiCheckCircle /> };
      case 'Notified': return { label: 'Notified', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <FiCheckCircle /> };
      default: return { label: status, color: 'bg-slate-50 text-slate-500 border-slate-100', icon: <FiInfo /> };
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Part Requests Management</h1>
        <p className="text-slate-500 font-medium mt-1">Manage and track special part requests from customers.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-3">
          <FiCheckCircle size={20} /> {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm flex items-center gap-3">
          <FiAlertCircle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 animate-pulse h-32" />
          ))}
        </div>
      ) : requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {requests.map(req => {
            const status = getStatusInfo(req.status);
            return (
              <div key={req.id} className="bg-white rounded-[32px] border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/30 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 ${status.color.split(' ')[0]} ${status.color.split(' ')[1]}`}>
                    {React.cloneElement(status.icon, { size: 28 })}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{req.partName}</h3>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500">
                        {req.urgency}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
                      <p className="flex items-center gap-2"><FiUser className="text-slate-400"/> Customer: <span className="font-bold text-slate-700">{req.customer?.user?.fullName || 'Unknown'}</span></p>
                      <p className="flex items-center gap-2"><FiPackage className="text-slate-400"/> Qty: <span className="font-bold text-slate-700">{req.quantity}</span></p>
                      <p className="flex items-center gap-2"><FiClock className="text-slate-400"/> {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>

                    {req.vehicleInfo && <p className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-wider">Vehicle: {req.vehicleInfo}</p>}
                  </div>

                  <button 
                    onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                    className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    <FiEdit size={16} /> Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <FiTruck size={40}/>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No requests yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">There are no special part requests from customers at the moment.</p>
        </div>
      )}

      {/* Status Update Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Update Status</h2>
            <p className="text-slate-500 mb-8 font-medium italic">"{selectedRequest.partName}" for {selectedRequest.customer?.user?.fullName}</p>
            
            <div className="grid grid-cols-1 gap-3">
              {['Pending', 'Checking', 'Ordered', 'Arrived', 'Notified'].map(s => (
                <button
                  key={s}
                  onClick={() => handleUpdateStatus(s)}
                  disabled={updating}
                  className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-between px-6 transition-all ${
                    selectedRequest.status === s 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {s}
                  {selectedRequest.status === s && <FiCheckCircle size={18} />}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPartRequests;
