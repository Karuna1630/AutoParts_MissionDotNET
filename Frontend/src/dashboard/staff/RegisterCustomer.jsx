import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  FiUser, FiMail, FiPhone, FiLock, 
  FiCalendar, FiDroplet, FiHash,
  FiArrowLeft, FiCheckCircle, FiSave, FiAlertCircle
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { registerCustomer } from '../../services/staffService';
import { getApiErrorMessage } from '../../services/api';

const registrationSchema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  vehicleNumber: Yup.string().required('Vehicle number is required'),
  vehicleModel: Yup.string().required('Vehicle model is required'),
  vehicleMake: Yup.string().required('Vehicle make is required'),
  vehicleYear: Yup.number()
    .min(1950, 'Invalid year')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .required('Vehicle year is required'),
  vehicleColor: Yup.string().nullable()
});

const RegisterCustomer = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      setStatus(null);
      const response = await registerCustomer(values);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/staff/customers'), 2000);
      }
    } catch (err) {
      setStatus({ type: 'error', message: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50">
          <FiCheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Registration Successful!</h2>
        <p className="text-slate-500 mt-2 font-medium">Redirecting you to the customer list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/staff/customers')}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition shadow-sm"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Register Customer</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Create a new customer account and register their first vehicle.</p>
        </div>
      </div>

      <Formik
        initialValues={{
          fullName: '',
          email: '',
          phone: '',
          password: 'Password123', // Default password for manual registration
          vehicleNumber: '',
          vehicleModel: '',
          vehicleMake: '',
          vehicleYear: new Date().getFullYear(),
          vehicleColor: '',
          vehicleImage: null
        }}
        validationSchema={registrationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status, setFieldValue, values }) => (
          <Form className="space-y-8">
            {/* Customer Information Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <FiUser className="text-blue-600" size={20} />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Personal Information</h3>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormItem label="FULL NAME" name="fullName" icon={FiUser} placeholder="e.g. John Doe" />
                <FormItem label="EMAIL ADDRESS" name="email" icon={FiMail} type="email" placeholder="john@example.com" />
                <FormItem label="PHONE NUMBER" name="phone" icon={FiPhone} placeholder="+1 (555) 000-0000" />
                <FormItem label="ACCOUNT PASSWORD" name="password" icon={FiLock} type="password" placeholder="••••••••" />
              </div>
            </div>

            {/* Vehicle Information Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <FaCar className="text-amber-600" size={20} />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Vehicle Information</h3>
              </div>
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormItem label="VEHICLE NUMBER" name="vehicleNumber" icon={FiHash} placeholder="e.g. ABC-1234" />
                <FormItem label="MAKE / BRAND" name="vehicleMake" icon={FaCar} placeholder="e.g. Toyota" />
                <FormItem label="MODEL" name="vehicleModel" icon={FaCar} placeholder="e.g. Corolla" />
                <FormItem label="MANUFACTURE YEAR" name="vehicleYear" icon={FiCalendar} type="number" />
                <div className="md:col-span-2">
                  <FormItem label="VEHICLE COLOR" name="vehicleColor" icon={FiDroplet} placeholder="e.g. Metallic Black" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VEHICLE IMAGE</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFieldValue('vehicleImage', e.target.files[0])}
                      className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 transition focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {values.vehicleImage && (
                    <div className="mt-2 text-xs font-bold text-green-600 ml-1">
                      Selected: {values.vehicleImage.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {status?.message && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 font-bold animate-in shake duration-300">
                <FiAlertCircle /> {status.message}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button"
                onClick={() => navigate('/staff/customers')}
                className="px-8 py-4 bg-white text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition border border-slate-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/30 transition active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                {isSubmitting ? 'Registering...' : <><FiSave /> Confirm Registration</>}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const FormItem = ({ label, name, icon: Icon, type = "text", placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <Field 
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-800 transition focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none placeholder:text-slate-300"
      />
    </div>
    <ErrorMessage name={name} component="div" className="text-[10px] text-red-500 font-black ml-1 uppercase" />
  </div>
);

export default RegisterCustomer;
