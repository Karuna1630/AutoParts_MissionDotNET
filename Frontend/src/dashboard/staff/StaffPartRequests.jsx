import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiTruck, FiInfo, FiPackage, FiAlertCircle, FiArrowRight, FiEdit, FiUser, FiX } from 'react-icons/fi';
import { apiClient as api, getApiErrorMessage } from '../../services/api';
import Pagination from '../../components/Pagination';

const StaffPartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Status Update Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [price, setPrice] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
    if (status === 'Arrived' && (!price || parseFloat(price) <= 0)) {
      alert('Please enter a valid price before marking as Arrived.');
      return;
    }
    try {
      setUpdating(true);
      const res = await api.patch(`/partrequests/${selectedRequest.id}/status`, { 
        status,
        price: price ? parseFloat(price) : null
      });
      if (res.data.success) {
        // If it's a procurement request, notify admins
        if (status === 'Procurement Required' || status === 'Requested') {
          await api.post('/notifications/notify-admins', {
            title: 'Procurement Needed',
            message: `Part "${selectedRequest.partName}" is unavailable for customer ${selectedRequest.customer?.user?.fullName}. Procurement required.`,
            type: 'Warning',
            relatedId: selectedRequest.id.toString()
          });
        }

        // If it's Arrived, notify the customer
        if (status === 'Arrived' && selectedRequest.customer?.userId) {
          await api.post('/notifications', {
            userId: selectedRequest.customer.userId,
            title: 'Part Arrived!',
            message: `Your requested part "${selectedRequest.partName}" has arrived! You can now complete your order from the requests page.`,
            type: 'Success',
            relatedId: selectedRequest.id.toString()
          });
        }

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
      case 'Requested': return { label: 'Requested', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: <FiTruck /> };
      case 'Arrived': return { label: 'Arrived', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <FiCheckCircle /> };
      case 'Rejected': return { label: 'Rejected', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <FiX /> };
      case 'Procurement Required': return { label: 'Procurement Needed', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <FiAlertCircle /> };
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {requests
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(req => {
                const status = getStatusInfo(req.status);
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 ${status.color.split(' ')[0]} ${status.color.split(' ')[1]}`}>
                        {req.imageUrl ? (
                          <img 
                            src={req.imageUrl} 
                            alt={req.partName} 
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" 
                            onClick={() => window.open(req.imageUrl, '_blank')}
                            title="Click to view full size"
                          />
                        ) : (
                          React.cloneElement(status.icon, { size: 24 })
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-slate-800">{req.partName}</h3>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-500 font-medium">
                          <p className="flex items-center gap-1.5"><FiUser className="text-slate-400"/> Customer: <span className="font-bold text-slate-700">{req.customer?.user?.fullName || 'Unknown'}</span></p>
                          <p className="flex items-center gap-1.5"><FiPackage className="text-slate-400"/> Qty: <span className="font-bold text-slate-700">{req.quantity}</span></p>
                          <p className="flex items-center gap-1.5"><FiClock className="text-slate-400"/> {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>

                        {req.vehicleInfo && <p className="mt-1 text-[11px] text-slate-400 font-bold uppercase tracking-wider">Vehicle: {req.vehicleInfo}</p>}
                      </div>

                      <button 
                        onClick={() => { 
                          setSelectedRequest(req); 
                          setPrice(req.price || '');
                          setShowModal(true); 
                        }}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all whitespace-nowrap"
                      >
                        <FiEdit size={14} /> Manage
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination Controls */}
          <Pagination 
            currentPage={currentPage} 
            totalPages={Math.ceil(requests.length / itemsPerPage)} 
            onPageChange={setCurrentPage} 
          />
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
            
            <div className="space-y-3">
              {['Pending', 'Requested', 'Arrived', 'Rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleUpdateStatus(s)}
                  disabled={updating}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-between px-5 transition-all ${
                    selectedRequest.status === s 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10 border-transparent' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {s}
                  {selectedRequest.status === s && <FiCheckCircle size={16} />}
                </button>
              ))}
              
              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => handleUpdateStatus('Procurement Required')}
                  disabled={updating}
                  className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    selectedRequest.status === 'Procurement Required'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'text-blue-600 hover:bg-blue-50 border border-blue-100 border-dashed bg-blue-50/30'
                  }`}
                >
                  <FiAlertCircle size={14} />
                  Notify Admin: Part Unavailable
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (Required for Arrived)</label>
                  {price > 0 ? (
                    <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><FiCheckCircle /> Ready for checkout</span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><FiInfo /> Enter price to enable checkout</span>
                  )}
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors">Rs.</span>
                  <input 
                    type="number"
                    className={`w-full bg-slate-50 border rounded-xl pl-12 pr-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${!price && selectedRequest?.status !== 'Arrived' ? 'border-slate-100' : price > 0 ? 'border-emerald-100 focus:border-emerald-500' : 'border-amber-100 focus:border-amber-500'}`}
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full mt-6 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPartRequests;
