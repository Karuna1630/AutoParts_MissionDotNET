import React, { useState } from 'react';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiShield, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { createStaff } from '../../services/staffService';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import PasswordField from '../../components/PasswordField';

const CreateStaff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'STAFF',
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
      .required('Phone number is required'),
    role: Yup.string().required('Role is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createStaff(values);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/staff'), 2000);
      } else {
        setError(response.message || 'Failed to create staff member.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member. Please check your data.');
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xl">
          <FiCheckCircle size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Success!</h2>
          <p className="text-slate-500 mt-2 font-medium">New staff member has been registered.</p>
        </div>
        <p className="text-slate-400 text-sm italic">Redirecting to staff management...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/staff')}
          className="p-2.5 bg-white border border-slate-100 shadow-sm hover:bg-slate-50 rounded-xl transition-all active:scale-95"
        >
          <FiArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register New Staff</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Add a new member to your administrative team.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {error && (
          <div className="m-8 mb-0 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold text-sm">
            {error}
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="p-8 md:p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="group space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiUser size={14} className="text-blue-500" /> First Name
                  </label>
                  <div className="relative">
                    <Field
                      name="firstName"
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                      placeholder="e.g. John"
                    />
                    <div className="text-[10px] text-red-500 font-bold mt-1 px-1">
                      <ErrorMessage name="firstName" />
                    </div>
                  </div>
                </div>

                {/* Last Name */}
                <div className="group space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiUser size={14} className="text-blue-500" /> Last Name
                  </label>
                  <div className="relative">
                    <Field
                      name="lastName"
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                      placeholder="e.g. Doe"
                    />
                    <div className="text-[10px] text-red-500 font-bold mt-1 px-1">
                      <ErrorMessage name="lastName" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="group space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiMail size={14} className="text-blue-500" /> Email Address
                  </label>
                  <div className="relative">
                    <Field
                      name="email"
                      type="email"
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                      placeholder="john@autoparts.com"
                    />
                    <div className="text-[10px] text-red-500 font-bold mt-1 px-1">
                      <ErrorMessage name="email" />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="group space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiPhone size={14} className="text-blue-500" /> Phone Number
                  </label>
                  <div className="relative">
                    <Field
                      name="phoneNumber"
                      type="tel"
                      maxLength="10"
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all font-semibold text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                      placeholder="10 digit number"
                    />
                    <div className="text-[10px] text-red-500 font-bold mt-1 px-1">
                      <ErrorMessage name="phoneNumber" />
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="group space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiShield size={14} className="text-blue-500" /> Administrative Role
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="role"
                      className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 transition-all font-bold text-slate-700 cursor-pointer appearance-none"
                    >
                      <option value="STAFF">Standard Staff</option>
                      <option value="ADMIN">System Admin</option>
                    </Field>
                    <div className="absolute right-5 top-[22px] pointer-events-none text-slate-400">
                      <FiPlus className="rotate-45" />
                    </div>
                    <div className="text-[10px] text-red-500 font-bold mt-1 px-1">
                      <ErrorMessage name="role" />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="group space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiLock size={14} className="text-blue-500" /> Password
                  </label>
                    <div className="relative">
                      <PasswordField name="password" placeholder="••••••••" />
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="group space-y-2 md:col-span-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <FiLock size={14} className="text-blue-500" /> Confirm Password
                  </label>
                  <div className="relative">
                    <PasswordField name="confirmPassword" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/admin/staff')}
                  className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-all flex items-center gap-2"
                >
                  Cancel Registration
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading || isSubmitting ? 'Processing...' : (
                      <>
                        <FiCheckCircle /> Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateStaff;
