import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, FiClock, FiCheckCircle, FiXCircle, 
  FiFilter, FiEye, FiUser, FiInfo, FiAlertCircle 
} from 'react-icons/fi';
import { FaCar, FaUserAlt, FaStar } from 'react-icons/fa';
import { 
  getAllAppointments, claimAppointment, 
  completeAppointment, staffCancelAppointment 
} from '../../services/appointmentService';
import { getApiErrorMessage } from '../../services/api';

const StaffAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [modal, setModal] = useState(null); // 'detail' | 'cancel'
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAllAppointments();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleClaim = async (id) => {
    try {
      setActionLoading(id);
      const res = await claimAppointment(id);
      if (res.success) {
        setSuccess('Appointment claimed and confirmed!');
        fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setTimeout(() => setError(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id) => {
    try {
      setActionLoading(id);
      const res = await completeAppointment(id);
      if (res.success) {
        setSuccess('Appointment marked as completed!');
        fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setTimeout(() => setError(null), 4000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStaffCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    try {
      setActionLoading(selectedAppt.id);
      const res = await staffCancelAppointment(selectedAppt.id, cancelReason);
      if (res.success) {
        setSuccess('Appointment cancelled.');
        setModal(null);
        setCancelReason('');
        fetchAppointments();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return a.status === 'Pending';
    if (filter === 'Confirmed') return a.status === 'Confirmed';
    if (filter === 'Completed') return a.status === 'Completed';
    if (filter === 'Cancelled') return a.status === 'Cancelled';
    return true;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'Urgent': return 'bg-amber-100 text-amber-700';
      case 'Emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Service Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">Manage customer bookings and service schedule.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-2">
          <FiCheckCircle /> {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm flex items-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse h-32" />
          ))}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map(a => (
            <div key={a.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${getStatusStyle(a.status).split(' ')[0]} ${getStatusStyle(a.status).split(' ')[1]}`}>
                  <FiCalendar size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{a.serviceType}</h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusStyle(a.status)}`}>
                      {a.status}
                    </span>
                    {a.priority !== 'Normal' && (
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${getPriorityStyle(a.priority)}`}>
                        {a.priority}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-2"><FaUserAlt className="text-slate-400" /> {a.customerName || 'Unknown Customer'}</span>
                    <span className="flex items-center gap-2"><FaCar className="text-slate-400" /> {a.vehicleName}</span>
                    <span className="flex items-center gap-2"><FiClock className="text-slate-400" /> {new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:border-l lg:border-slate-100 lg:pl-6">
                  <button 
                    onClick={() => { setSelectedAppt(a); setModal('detail'); }}
                    className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all"
                    title="View Details"
                  >
                    <FiEye size={18} />
                  </button>

                  {a.status === 'Pending' && (
                    <button 
                      onClick={() => handleClaim(a.id)}
                      disabled={actionLoading === a.id}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {actionLoading === a.id ? 'Claiming...' : 'Claim'}
                    </button>
                  )}

                  {a.status === 'Confirmed' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleComplete(a.id)}
                        disabled={actionLoading === a.id}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        Complete
                      </button>
                      <button 
                        onClick={() => { setSelectedAppt(a); setModal('cancel'); }}
                        className="bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {a.assignedStaffName && (
                    <div className="flex items-center gap-2 ml-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {a.assignedStaffName[0]}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{a.assignedStaffName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6"><FiCalendar size={40}/></div>
          <h3 className="text-2xl font-bold text-slate-800">No appointments found</h3>
          <p className="text-slate-500 mt-2 max-w-md">There are no appointments matching your current filter.</p>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modal === 'detail' && selectedAppt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Appointment Details</h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><FiXCircle size={24} className="text-slate-400"/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Service Info</h4>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-lg font-bold text-slate-800 mb-1">{selectedAppt.serviceType}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusStyle(selectedAppt.status)}`}>{selectedAppt.status}</span>
                    <div className="mt-4 space-y-2">
                      <p className="text-xs flex items-center gap-2 text-slate-600 font-medium"><FiCalendar className="text-slate-400"/> {new Date(selectedAppt.preferredDate).toLocaleDateString()}</p>
                      <p className="text-xs flex items-center gap-2 text-slate-600 font-medium"><FiClock className="text-slate-400"/> {selectedAppt.preferredTime}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer & Vehicle</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center border border-slate-100">
                        {selectedAppt.customerAvatarUrl ? (
                          <img src={selectedAppt.customerAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <FiUser size={16} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedAppt.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{selectedAppt.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center"><FaCar size={14}/></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedAppt.vehicleName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Vehicle Details</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer Notes</h4>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 min-h-[100px]">
                    <p className="text-sm text-amber-800 leading-relaxed italic">
                      {selectedAppt.notes || "No notes provided by the customer."}
                    </p>
                  </div>
                </div>

                {selectedAppt.cancellationReason && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3">Cancellation Reason</h4>
                    <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 text-sm text-red-800">
                      {selectedAppt.cancellationReason}
                    </div>
                  </div>
                )}

                {selectedAppt.review && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3">Customer Review</h4>
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <FaStar key={s} size={12} className={s <= selectedAppt.review.rating ? 'text-amber-400' : 'text-slate-100'} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 italic">"{selectedAppt.review.comment}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-8 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {modal === 'cancel' && selectedAppt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Cancel Appointment</h2>
            <p className="text-sm text-slate-500 mb-8">Please provide a reason for cancelling this appointment. The customer will be notified.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Cancellation Reason *</label>
                <textarea 
                  rows="4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
                  placeholder="e.g. Staff unavailable, Parts out of stock..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setModal(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleStaffCancel}
                  disabled={actionLoading === selectedAppt.id}
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {actionLoading === selectedAppt.id ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAppointments;
