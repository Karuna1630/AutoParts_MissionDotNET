import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiPlus, FiStar, FiCheckCircle, FiAlertCircle, FiX, FiEye, FiXCircle } from 'react-icons/fi';
import { FaCar, FaStar, FaRegStar } from 'react-icons/fa';
import { bookAppointment, getMyAppointments, submitReview, getSlotAvailability, cancelAppointment } from '../../services/appointmentService';
import { getMyVehicles } from '../../services/vehicleService';
import { getApiErrorMessage } from '../../services/api';

const SERVICE_TYPES = ['Oil Change','Brake Service','Engine Diagnostics','AC Repair','Tire Replacement','General Repair','Wheel Alignment','Full Service','Transmission Service','Other'];
const TIME_SLOTS = ['Morning (9 AM – 12 PM)','Afternoon (1 PM – 5 PM)','Evening (5 PM – 8 PM)'];
const PRIORITIES = [{v:'Normal',label:'Normal',color:'bg-slate-100 text-slate-600'},{v:'Urgent',label:'Urgent',color:'bg-amber-100 text-amber-700'},{v:'Emergency',label:'Emergency',color:'bg-red-100 text-red-700'}];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'book' | 'review' | 'detail' | 'summary'
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [slotInfo, setSlotInfo] = useState([]);

  const [form, setForm] = useState({ vehicleId:'', serviceType:'', customService:'', preferredDate:'', preferredTime:'', priority:'Normal', notes:'' });
  const [reviewForm, setReviewForm] = useState({ rating:0, comment:'', wouldRecommend:true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const v = await getMyVehicles();
      if (v.success && Array.isArray(v.data)) {
        setVehicles(v.data);
        const primary = v.data.find(x => x.isPrimary);
        if (primary && !form.vehicleId) setForm(f => ({...f, vehicleId: String(primary.id)}));
      }
    } catch (e) { console.error('Error fetching vehicles:', e); }
    try {
      const a = await getMyAppointments();
      if (a.success) setAppointments(a.data);
    } catch (e) { console.error('Error fetching appointments:', e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (form.preferredDate) {
      getSlotAvailability(form.preferredDate).then(r => { if (r.success) setSlotInfo(r.data); }).catch(() => {});
    } else { setSlotInfo([]); }
  }, [form.preferredDate]);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30*86400000).toISOString().split('T')[0];

  const openBook = () => { setModal('book'); setError(null); };
  const openSummary = () => {
    if (!form.vehicleId||!form.serviceType||!form.preferredDate||!form.preferredTime) { setError('Please fill all required fields.'); return; }
    if (form.serviceType==='Other' && !form.customService.trim()) { setError('Please specify the service type.'); return; }
    setError(null); setModal('summary');
  };

  const handleBook = async () => {
    setSubmitting(true); setError(null);
    try {
      const svc = form.serviceType==='Other' ? form.customService : form.serviceType;
      const res = await bookAppointment({ vehicleId:parseInt(form.vehicleId), serviceType:svc, preferredDate:form.preferredDate, preferredTime:form.preferredTime, priority:form.priority, notes:form.notes||null });
      if (res.success) { setSuccess('Appointment booked!'); setForm({vehicleId:'',serviceType:'',customService:'',preferredDate:'',preferredTime:'',priority:'Normal',notes:''}); setModal(null); fetchData(); setTimeout(()=>setSuccess(null),4000); }
    } catch (e) { setError(getApiErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await cancelAppointment(id);
      if (res.success) { setSuccess('Appointment cancelled.'); fetchData(); setTimeout(()=>setSuccess(null),4000); }
    } catch (e) { setError(getApiErrorMessage(e)); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating===0) { setError('Please select a rating.'); return; }
    if (reviewForm.comment.trim().length<10) { setError('Comment must be at least 10 characters.'); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await submitReview({ appointmentId:selectedAppt.id, rating:reviewForm.rating, comment:reviewForm.comment, wouldRecommend:reviewForm.wouldRecommend });
      if (res.success) { 
        setSuccess('Review submitted!'); 
        setModal(null); 
        setReviewForm({rating:0,comment:'',wouldRecommend:true}); 
        await fetchData(); 
        setSelectedAppt(null); // Clear selected state
        setTimeout(()=>setSuccess(null),4000); 
      }
    } catch (e) { setError(getApiErrorMessage(e)); }
    finally { setSubmitting(false); }
  };

  const stStyle = s => ({ Pending:'bg-amber-50 text-amber-600 border-amber-200', Confirmed:'bg-blue-50 text-blue-600 border-blue-200', Completed:'bg-emerald-50 text-emerald-600 border-emerald-200', Cancelled:'bg-red-50 text-red-600 border-red-200' }[s]||'bg-slate-50 text-slate-600 border-slate-200');
  const stIcon = s => ({ Pending:<FiClock/>, Confirmed:<FiCheckCircle/>, Completed:<FiCheckCircle/>, Cancelled:<FiAlertCircle/> }[s]||<FiClock/>);
  const priStyle = p => ({ Normal:'bg-slate-100 text-slate-600', Urgent:'bg-amber-100 text-amber-700', Emergency:'bg-red-100 text-red-700' }[p]||'bg-slate-100 text-slate-600');
  const selectedVehicle = vehicles.find(v => String(v.id)===form.vehicleId);

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none";
  const labelCls = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">Schedule service and track your vehicle appointments.</p>
        </div>
        <button onClick={openBook} className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
          <FiPlus /> Book Appointment
        </button>
      </div>

      {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 font-bold text-sm flex items-center gap-2"><FiCheckCircle /> {success}</div>}

      {/* BOOKING MODAL */}
      {modal==='book' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Book Appointment</h2>
              <button onClick={()=>{setModal(null);setError(null)}} className="p-2 hover:bg-slate-100 rounded-xl"><FiX size={20} className="text-slate-400"/></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Select Vehicle *</label>
                {vehicles.length>0 ? <select value={form.vehicleId} onChange={e=>setForm({...form,vehicleId:e.target.value})} className={inputCls}>
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map(v=><option key={v.id} value={v.id}>{v.vehicleMake} {v.vehicleModel} — {v.vehicleNumber} {v.isPrimary?'(Primary)':''}</option>)}
                </select> : <p className="text-sm text-slate-400 italic bg-slate-50 px-5 py-3.5 rounded-2xl border">No vehicles found. Add one first.</p>}
              </div>
              <div>
                <label className={labelCls}>Service Type *</label>
                <select value={form.serviceType} onChange={e=>setForm({...form,serviceType:e.target.value})} className={inputCls}>
                  <option value="">Choose a service...</option>
                  {SERVICE_TYPES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {form.serviceType==='Other' && <div>
                <label className={labelCls}>Specify Service *</label>
                <input value={form.customService} onChange={e=>setForm({...form,customService:e.target.value})} placeholder="Describe the service needed..." className={inputCls} />
              </div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Preferred Date *</label>
                  <input type="date" min={today} max={maxDate} value={form.preferredDate} onChange={e=>setForm({...form,preferredDate:e.target.value,preferredTime:''})} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Time Slot *</label>
                  <div className="space-y-2">
                    {TIME_SLOTS.map(t => {
                      const info = slotInfo.find(s=>s.slot===t);
                      const full = info?.isFull;
                      return <button key={t} type="button" disabled={full} onClick={()=>setForm({...form,preferredTime:t})}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${form.preferredTime===t?'bg-blue-600 text-white border-blue-600':'bg-slate-50 border-slate-200 hover:border-blue-400'} ${full?'opacity-40 cursor-not-allowed':''}`}>
                        {t} {info ? <span className="float-right">{info.available}/5 left</span> : null}
                      </button>;
                    })}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Priority Level</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p=><button key={p.v} type="button" onClick={()=>setForm({...form,priority:p.v})}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${form.priority===p.v?'border-blue-600 ring-2 ring-blue-100':' border-transparent'} ${p.color}`}>{p.label}</button>)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes <span className="normal-case font-medium">(max 500 chars)</span></label>
                <textarea rows="3" maxLength={500} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any specific concerns..." className={inputCls+" resize-none"} />
                <p className="text-right text-[10px] text-slate-400 mt-1">{form.notes.length}/500</p>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2"><FiAlertCircle/> {error}</div>}
              <button onClick={openSummary} disabled={vehicles.length===0} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">Review & Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING SUMMARY MODAL */}
      {modal==='summary' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Booking Summary</h2>
            <div className="space-y-4 mb-8">
              {[['Vehicle', selectedVehicle ? `${selectedVehicle.vehicleMake} ${selectedVehicle.vehicleModel} — ${selectedVehicle.vehicleNumber}` : ''],
                ['Service', form.serviceType==='Other'?form.customService:form.serviceType],
                ['Date', form.preferredDate],
                ['Time Slot', form.preferredTime],
                ['Priority', form.priority],
                ['Notes', form.notes||'—']
              ].map(([k,v])=><div key={k} className="flex justify-between items-start gap-4 py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{k}</span>
                <span className="text-sm font-bold text-slate-800 text-right">{v}</span>
              </div>)}
            </div>
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 mb-4"><FiAlertCircle/> {error}</div>}
            <div className="flex gap-3">
              <button onClick={()=>{setModal('book');setError(null)}} className="flex-1 py-3.5 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all">Edit</button>
              <button onClick={handleBook} disabled={submitting} className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50">{submitting?'Booking...':'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modal==='detail' && selectedAppt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900">Appointment Details</h2>
              <button onClick={()=>setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl"><FiX size={20} className="text-slate-400"/></button>
            </div>
            {selectedAppt.customerAvatarUrl && (
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img src={selectedAppt.customerAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="space-y-3 mb-6">
              {[['Service', selectedAppt.serviceType],['Vehicle', selectedAppt.vehicleName],
                ['Date', new Date(selectedAppt.preferredDate).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})],
                ['Time', selectedAppt.preferredTime],['Priority', selectedAppt.priority],
                ['Status', selectedAppt.status],['Notes', selectedAppt.notes||'—']
              ].map(([k,v])=><div key={k} className="flex justify-between items-start gap-4 py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{k}</span>
                <span className="text-sm font-bold text-slate-800 text-right">{k==='Status'?<span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase ${stStyle(v)}`}>{v}</span>:k==='Priority'?<span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${priStyle(v)}`}>{v}</span>:v}</span>
              </div>)}
            </div>
            {selectedAppt.review && <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-1 mb-1">{[1,2,3,4,5].map(s=><FaStar key={s} size={14} className={s<=selectedAppt.review.rating?'text-amber-400':'text-slate-200'}/>)}<span className="text-[10px] font-bold text-amber-600 ml-2">YOUR REVIEW</span></div>
              <p className="text-xs text-slate-600">"{selectedAppt.review.comment}"</p>
              <p className="text-[10px] text-slate-400 mt-1">{selectedAppt.review.wouldRecommend?'👍 Would recommend':'👎 Would not recommend'}</p>
            </div>}
            <div className="flex gap-3">
              {(selectedAppt.status==='Pending'||selectedAppt.status==='Confirmed') && <button onClick={()=>{handleCancel(selectedAppt.id);setModal(null)}} className="flex-1 py-3 rounded-2xl font-bold text-sm border border-red-200 text-red-600 hover:bg-red-50 transition-all">Cancel</button>}
              {selectedAppt.status==='Completed'&&!selectedAppt.review && <button onClick={()=>{setSelectedAppt(selectedAppt);setModal('review');setError(null)}} className="flex-1 bg-amber-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-1"><FiStar/> Review</button>}
              <button onClick={()=>setModal(null)} className="flex-1 py-3 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {modal==='review' && selectedAppt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900">Leave a Review</h2>
              <button onClick={()=>{setModal(null);setError(null);setReviewForm({rating:0,comment:'',wouldRecommend:true})}} className="p-2 hover:bg-slate-100 rounded-xl"><FiX size={20} className="text-slate-400"/></button>
            </div>
            <form onSubmit={handleReview} className="space-y-6">
              <div>
                <label className={labelCls}>Your Rating *</label>
                <div className="flex gap-2 justify-center">{[1,2,3,4,5].map(s=><button key={s} type="button" onClick={()=>setReviewForm({...reviewForm,rating:s})} className="transition-all hover:scale-125 active:scale-90">{s<=reviewForm.rating?<FaStar size={36} className="text-amber-400 drop-shadow-md"/>:<FaRegStar size={36} className="text-slate-200 hover:text-amber-300"/>}</button>)}</div>
                {reviewForm.rating>0 && <p className="text-center mt-2 text-sm font-bold text-amber-600">{['','Poor','Fair','Good','Very Good','Excellent'][reviewForm.rating]}</p>}
              </div>
              <div>
                <label className={labelCls}>Comment * <span className="normal-case font-medium">(min 10, max 1000 chars)</span></label>
                <textarea rows="4" maxLength={1000} value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm,comment:e.target.value})} placeholder="Share your experience..." className={inputCls+" resize-none"} />
                <p className="text-right text-[10px] text-slate-400 mt-1">{reviewForm.comment.length}/1000</p>
              </div>
              <div>
                <label className={labelCls}>Would you recommend us?</label>
                <div className="flex gap-3">
                  {[{v:true,l:'👍 Yes'},{v:false,l:'👎 No'}].map(o=><button key={String(o.v)} type="button" onClick={()=>setReviewForm({...reviewForm,wouldRecommend:o.v})}
                    className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${reviewForm.wouldRecommend===o.v?'border-blue-600 bg-blue-50 text-blue-700':'border-slate-200 hover:border-slate-300'}`}>{o.l}</button>)}
                </div>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2"><FiAlertCircle/> {error}</div>}
              <button type="submit" disabled={submitting} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"><FiStar/> {submitting?'Submitting...':'Submit Review'}</button>
            </form>
          </div>
        </div>
      )}

      {/* APPOINTMENTS LIST */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse"><div className="flex gap-4"><div className="w-14 h-14 rounded-2xl bg-slate-100"/><div className="flex-1 space-y-3"><div className="h-4 bg-slate-100 rounded w-1/3"/><div className="h-3 bg-slate-50 rounded w-1/2"/></div></div></div>)}</div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${a.status==='Completed'?'bg-emerald-50 text-emerald-600':a.status==='Confirmed'?'bg-blue-50 text-blue-600':a.status==='Cancelled'?'bg-red-50 text-red-500':'bg-amber-50 text-amber-600'}`}><FaCar size={22}/></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{a.serviceType}</h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1 ${stStyle(a.status)}`}>{stIcon(a.status)} {a.status}</span>
                    {a.priority&&a.priority!=='Normal'&&<span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${priStyle(a.priority)}`}>{a.priority}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><FaCar className="text-slate-400"/> {a.vehicleName}</span>
                    <span className="flex items-center gap-1.5"><FiCalendar className="text-slate-400"/> {new Date(a.preferredDate).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</span>
                    <span className="flex items-center gap-1.5"><FiClock className="text-slate-400"/> {a.preferredTime}</span>
                  </div>
                  {a.review && <div className="mt-3 flex items-center gap-1">{[1,2,3,4,5].map(s=><FaStar key={s} size={12} className={s<=a.review.rating?'text-amber-400':'text-slate-200'}/>)}<span className="text-[10px] font-bold text-amber-600 ml-1">Reviewed</span></div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={()=>{setSelectedAppt(a);setModal('detail')}} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all" title="View Details"><FiEye size={16}/></button>
                  {(a.status==='Pending'||a.status==='Confirmed')&&<button onClick={()=>handleCancel(a.id)} className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 transition-all" title="Cancel"><FiXCircle size={16}/></button>}
                  {a.status==='Completed'&&!a.review&&<button onClick={()=>{setSelectedAppt(a);setModal('review');setError(null)}} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"><FiStar/> Review</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6"><FiCalendar size={40}/></div>
          <h3 className="text-2xl font-bold text-slate-800">No appointments yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">Book your first service appointment and keep your vehicle in top shape.</p>
          <button onClick={openBook} className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"><FiPlus/> Book Appointment</button>
        </div>
      )}
    </div>
  );
};

export default Appointments;
