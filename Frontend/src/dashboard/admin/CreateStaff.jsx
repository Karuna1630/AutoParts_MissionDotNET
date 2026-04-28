import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaArrowRight, FaCheckCircle, FaUserShield } from 'react-icons/fa';
import * as Yup from 'yup';
import { createStaff } from '../../services/adminService';
import { getApiErrorMessage } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const staffValidationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const CreateStaff = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = React.useState(null);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const res = await createStaff(values);
      if (res?.success) {
        setSuccess('Staff account created successfully!');
        setTimeout(() => navigate('/admin/users?role=Staff'), 2000);
      }
    } catch (err) {
      setStatus(getApiErrorMessage(err, 'Failed to create staff account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-[fade-in_0.45s_ease-out]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Create Staff Account</h1>
        <p className="text-sm text-slate-400">Add a new staff member with restricted administrative access.</p>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <FaCheckCircle className="text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{success}</h2>
            <p className="mt-2 text-sm text-slate-500">Redirecting to user list...</p>
          </div>
        ) : (
          <Formik
            initialValues={{ fullName: '', email: '', phone: '', password: '' }}
            validationSchema={staffValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status, errors, touched }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-600">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Field
                        name="fullName"
                        className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-4 ${
                          touched.fullName && errors.fullName ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    <ErrorMessage name="fullName" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Field
                        name="email"
                        type="email"
                        className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-4 ${
                          touched.email && errors.email ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                        }`}
                        placeholder="john@example.com"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Field
                        name="phone"
                        className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-4 ${
                          touched.phone && errors.phone ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                        }`}
                        placeholder="+1234567890"
                      />
                    </div>
                    <ErrorMessage name="phone" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-600">Temporary Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Field
                        name="password"
                        type="password"
                        className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-4 ${
                          touched.password && errors.password ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-xs text-red-500" />
                  </div>
                </div>

                {status && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {status}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-sm font-bold text-white shadow-lg shadow-violet-600/30 transition hover:-translate-y-0.5 hover:bg-violet-700 active:translate-y-0 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Staff Account'}
                  {!isSubmitting && <FaArrowRight />}
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-amber-50 p-5 border border-amber-100">
        <div className="flex gap-3">
          <FaUserShield className="text-amber-500 mt-1 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Note on Staff Privileges</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Staff members can manage orders, inventory, and customer appointments but cannot access system settings or manage other administrative accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStaff;
