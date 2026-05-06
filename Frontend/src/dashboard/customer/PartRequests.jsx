import { FiClock, FiCheckCircle, FiTruck, FiInfo, FiPackage, FiAlertCircle, FiArrowRight, FiPlus } from 'react-icons/fi';
import { getMyPartRequests, createPartRequest } from '../../services/partService';
import { getApiErrorMessage } from '../../services/api';

const PartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Special Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    partName: '',
    quantity: 1,
    urgency: 'Normal',
    description: '',
    vehicleInfo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getMyPartRequests();
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = () => {
    setRequestForm({
      partName: '',
      quantity: 1,
      urgency: 'Normal',
      description: '',
      vehicleInfo: ''
    });
    setShowModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createPartRequest(requestForm);
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
      case 'Checking': return { label: 'Checking', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: <FiInfo /> };
      case 'Ordered': return { label: 'Ordered', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: <FiTruck /> };
      case 'Arrived': return { label: 'Arrived', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: <FiCheckCircle /> };
      case 'Notified': return { label: 'Notified', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <FiCheckCircle /> };
      default: return { label: status, color: 'bg-slate-50 text-slate-500 border-slate-100', icon: <FiInfo /> };
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
        <div className="grid grid-cols-1 gap-6">
          {requests.map(req => {
            const status = getStatusInfo(req.status);
            return (
              <div key={req.id} className="bg-white rounded-[32px] border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/30 transition-all group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  {/* Status Icon */}
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 ${status.color.split(' ')[0]} ${status.color.split(' ')[1]}`}>
                    {React.cloneElement(status.icon, { size: 28 })}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{req.partName}</h3>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 ${getUrgencyColor(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
                      <p className="flex items-center gap-2"><FiPackage className="text-slate-400"/> Qty: <span className="font-bold text-slate-700">{req.quantity}</span></p>
                      {req.vehicleInfo && <p className="flex items-center gap-2"><FiArrowRight className="text-slate-400"/> {req.vehicleInfo}</p>}
                      <p className="flex items-center gap-2"><FiClock className="text-slate-400"/> {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>

                    {req.description && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 italic border border-slate-100">
                        {req.description}
                      </div>
                    )}
                  </div>

                  {/* Progress Indicator (Mobile hidden or simplified) */}
                  <div className="hidden xl:flex items-center gap-2 px-6 border-l border-slate-100">
                    {['Pending', 'Checking', 'Ordered', 'Arrived', 'Notified'].map((s, idx, arr) => {
                      const statusList = ['Pending', 'Checking', 'Ordered', 'Arrived', 'Notified'];
                      const currentIdx = statusList.indexOf(req.status);
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      
                      return (
                        <React.Fragment key={s}>
                          <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isPast ? 'bg-emerald-500' : isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'}`} title={s} />
                          {idx < arr.length - 1 && <div className={`w-6 h-0.5 transition-all duration-500 ${isPast ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>
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
          <p className="text-slate-500 mt-2 max-w-md">You haven't submitted any special part requests yet.</p>
        </div>
      )}
      {/* Special Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Special Request</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <FiPackage size={20} className="text-slate-400" />
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

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Vehicle Info (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="e.g. 2022 Honda Civic"
                  value={requestForm.vehicleInfo}
                  onChange={(e) => setRequestForm({...requestForm, vehicleInfo: e.target.value})}
                />
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
