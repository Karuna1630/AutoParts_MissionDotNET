import React, { useState, useEffect } from 'react';
import { FiPlus, FiClock, FiCheckCircle, FiAlertCircle, FiMessageSquare, FiTruck } from 'react-icons/fi';
import { submitPartRequest, getMyPartRequests } from '../../services/partService';
import { getApiErrorMessage } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  partName: Yup.string().required('Part name is required'),
  description: Yup.string().required('Description is required'),
  vehicleInfo: Yup.string().required('Vehicle information is required'),
});

const PartRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await getMyPartRequests();
      if (response.success) setRequests(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await submitPartRequest(values);
      if (response.success) {
        setSuccess(true);
        resetForm();
        fetchRequests();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ordered': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <FiClock />;
      case 'approved': return <FiCheckCircle />;
      case 'ordered': return <FiTruck />;
      case 'completed': return <FiCheckCircle />;
      case 'cancelled': return <FiAlertCircle />;
      default: return <FiClock />;
    }
  };

  return (
    <div className='p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto'>
      <div className="mb-10">
        <h1 className='text-4xl font-black text-slate-900 tracking-tight'>Part Requests</h1>
        <p className='text-slate-500 font-medium mt-1'>Request specific parts that are not currently in our shop.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 sticky top-28">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiPlus className="text-blue-600" /> New Request
            </h2>

            <Formik
              initialValues={{ partName: '', description: '', vehicleInfo: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Part Name</label>
                    <Field 
                      name="partName" 
                      placeholder="e.g. Toyota Camry Brake Pads"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${touched.partName && errors.partName ? 'border-red-300' : ''}`}
                    />
                    <ErrorMessage name="partName" component="div" className="text-red-500 text-[10px] font-bold mt-1 ml-1" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Vehicle Info</label>
                    <Field 
                      name="vehicleInfo" 
                      placeholder="e.g. 2018 Toyota Camry XLE"
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${touched.vehicleInfo && errors.vehicleInfo ? 'border-red-300' : ''}`}
                    />
                    <ErrorMessage name="vehicleInfo" component="div" className="text-red-500 text-[10px] font-bold mt-1 ml-1" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Description / Details</label>
                    <Field 
                      as="textarea"
                      name="description" 
                      rows="4"
                      placeholder="Specify part numbers or additional details..."
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${touched.description && errors.description ? 'border-red-300' : ''}`}
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-[10px] font-bold mt-1 ml-1" />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <FiAlertCircle /> {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <FiCheckCircle /> Request submitted successfully!
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Request List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 h-full">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FiMessageSquare className="text-blue-600" /> My Requests
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map(req => (
                  <div key={req.id} className="group border border-slate-100 rounded-3xl p-6 hover:bg-slate-50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${getStatusColor(req.status)}`}>
                            {getStatusIcon(req.status)} {req.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <FiClock /> {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{req.partName}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">{req.vehicleInfo}</p>
                      </div>
                      
                      <div className="md:text-right">
                        <p className="text-xs text-slate-400 font-medium max-w-xs md:ml-auto">{req.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-300">
                <FiMessageSquare size={48} className="mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-widest text-xs">No requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartRequests;
