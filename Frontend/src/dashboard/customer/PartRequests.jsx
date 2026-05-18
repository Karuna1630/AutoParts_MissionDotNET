import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiTruck, FiInfo, FiPackage, FiAlertCircle, FiArrowRight, FiPlus, FiX, FiImage, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getMyPartRequests, createPartRequest } from '../../services/partService';
import { getMyVehicles } from '../../services/vehicleService';
import { getApiErrorMessage } from '../../services/api';
import { useCart } from '../../context/CartContext';

const PartRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Special Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    partName: '',
    quantity: 1,
    urgency: 'Normal',
    description: '',
    vehicleInfo: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqRes, vehRes] = await Promise.all([
        getMyPartRequests(),
        getMyVehicles()
      ]);
      
      if (reqRes.success) setRequests(reqRes.data);
      if (vehRes.success) setVehicles(vehRes.data);
      
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = () => {
    setError(null);
    setSuccess(null);
    setRequestForm({
      partName: '',
      quantity: 1,
      urgency: 'Normal',
      description: '',
      vehicleInfo: '',
      image: null
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('partName', requestForm.partName);
      formData.append('quantity', requestForm.quantity);
      formData.append('urgency', requestForm.urgency);
      if (requestForm.description) formData.append('description', requestForm.description);
      if (requestForm.vehicleInfo) formData.append('vehicleInfo', requestForm.vehicleInfo);
      if (requestForm.image) formData.append('image', requestForm.image);

      const res = await createPartRequest(formData);
      if (res.success) {
        setSuccess('Your special request has been submitted successfully!');
        setShowModal(false);
        fetchRequests(); // Refresh list
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setTimeout(() => setError(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { label: 'Pending', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <FiClock /> };
      case 'Requested': return { label: 'Requested', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: <FiTruck /> };
      case 'Arrived': return { label: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <FiCheckCircle /> };
      case 'Rejected': return { label: 'Rejected', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <FiX /> };
      case 'Procurement Required': return { label: 'Procurement Needed', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <FiAlertCircle /> };
      default: return { label: status, color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <FiClock /> };
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Urgent': return 'text-red-600';
      case 'Soon': return 'text-amber-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Part Requests</h1>
          <p className="text-slate-500 font-medium mt-1">Track the status of your special part requests.</p>
        </div>
        <button 
          onClick={handleOpenRequest}
          className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FiPlus size={18} />
          New Special Request
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-bold text-sm flex items-center gap-3">
          <FiAlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-3">
          <FiCheckCircle size={20} /> {success}
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
                      {/* Status Icon or Image */}
                      <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 ${status.color.split(' ')[0]} ${status.color.split(' ')[1]}`}>
                        {req.imageUrl ? (
                          <img src={req.imageUrl} alt={req.partName} className="w-full h-full object-cover" />
                        ) : (
                          React.cloneElement(status.icon, { size: 24 })
                        )}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-slate-800">{req.partName}</h3>
                          <div className="flex gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${status.color}`}>
                              {status.label}
                            </span>
                            {!['Arrived', 'Completed'].includes(req.status) && (
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 ${getUrgencyColor(req.urgency)}`}>
                                {req.urgency}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-500 font-medium">
                          <p className="flex items-center gap-1.5"><FiPackage className="text-slate-400"/> Qty: <span className="font-bold text-slate-700">{req.quantity}</span></p>
                          {req.price > 0 && (
                            <p className="flex items-center gap-1.5">
                              <span className="text-blue-600 font-bold">Rs. {req.price.toLocaleString()}</span>
                            </p>
                          )}
                          {req.vehicleInfo && <p className="flex items-center gap-1.5"><FiArrowRight className="text-slate-400"/> {req.vehicleInfo}</p>}
                          <p className="flex items-center gap-1.5"><FiClock className="text-slate-400"/> {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>

                        {req.description && (
                          <div className="mt-2 p-3 bg-slate-50/50 rounded-xl text-[12px] text-slate-500 italic border border-slate-100/50">
                            {req.description}
                          </div>
                        )}
                      </div>

                      {/* Actions & Progress */}
                      <div className="flex items-center gap-4 md:pl-6 md:border-l md:border-slate-100">
                        {req.status === 'Arrived' && (
                          <button 
                            onClick={() => {
                              addToCart({
                                id: req.partId || `req-${req.id}`,
                                partName: req.partName,
                                sku: `REQ-${req.id}`,
                                price: req.price || 0,
                                imageUrl: req.imageUrl,
                                stockQuantity: 999
                              }, req.quantity);
                              setSuccess(`"${req.partName}" added to your cart!`);
                              setTimeout(() => setSuccess(null), 3000);
                            }}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2 whitespace-nowrap"
                          >
                            <FiShoppingBag size={14} />
                            Add to Cart
                          </button>
                        )}
                        
                        <div className="hidden xl:flex items-center gap-1.5">
                          {['Pending', 'Arrived'].map((s, idx, arr) => {
                            const statusList = ['Pending', 'Arrived', 'Completed'];
                            const currentIdx = statusList.indexOf(req.status);
                            const isPast = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            
                            return (
                              <React.Fragment key={s}>
                                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                  isPast ? 'bg-emerald-500' : 
                                  isCurrent ? `bg-blue-500 ${!['Arrived', 'Completed'].includes(req.status) ? 'animate-pulse' : ''}` : 
                                  'bg-slate-200'
                                }`} title={s} />
                                {idx < arr.length - 1 && <div className={`w-4 h-0.5 transition-all duration-500 ${isPast ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination Controls */}
          {requests.length > itemsPerPage && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(requests.length / itemsPerPage) }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-500 hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(requests.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(requests.length / itemsPerPage)}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <FiTruck size={40}/>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">No requests yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">You haven't submitted any special part requests yet.</p>
        </div>
      )}
      {/* Special Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Special Request</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <FiX size={24} className="text-slate-400 hover:text-slate-700" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Part Name *</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    placeholder="e.g. BMW M5 Brake Pads"
                    value={requestForm.partName}
                    onChange={(e) => setRequestForm({...requestForm, partName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Quantity *</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm({...requestForm, quantity: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Urgency *</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
                  >
                    <option value="Normal">Not Urgent</option>
                    <option value="Soon">Need Soon</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Vehicle Info (Optional)</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                    value={requestForm.vehicleInfo}
                    onChange={(e) => setRequestForm({...requestForm, vehicleInfo: e.target.value})}
                  >
                    <option value="">Select a vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={`${v.vehicleYear} ${v.vehicleMake} ${v.vehicleModel} (${v.vehicleNumber})`}>
                        {v.vehicleYear} {v.vehicleMake} {v.vehicleModel} - {v.vehicleNumber}
                      </option>
                    ))}
                    <option value="Other">Other (Not listed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Part Image (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file"
                      accept="image/*"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setRequestForm({...requestForm, image: file});
                        if (file) {
                          setImagePreview(URL.createObjectURL(file));
                        } else {
                          setImagePreview(null);
                        }
                      }}
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-3 relative group w-fit">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setRequestForm({...requestForm, image: null});
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow-lg border border-red-50 hover:bg-red-50 transition-colors"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Additional Notes</label>
                <textarea 
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                  placeholder="Any extra details..."
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartRequests;
