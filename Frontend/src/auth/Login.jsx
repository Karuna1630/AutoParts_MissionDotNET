import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaLock, FaArrowRight, FaCheck, FaCarSide } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { loginValidationSchema } from '../utils/LoginValidation';
import { getApiErrorMessage } from '../services/api';
import { login } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus(undefined);

    try {
      const response = await login({
        email: values.email.trim(),
        password: values.password,
      });

      if (!response?.success) {
        setStatus({
          type: 'error',
          message: response?.message || 'Login failed. Please check your credentials.',
        });
        return;
      }

      if (response?.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem(
          'authUser',
          JSON.stringify({
            userId: response.data.userId,
            email: response.data.email,
            fullName: response.data.fullName,
            role: response.data.role,
          })
        );
        
        // Redirect based on role
        if (response.data.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error, 'Login failed. Please try again.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Left Branding Section (Desktop) */}
      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-16 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/40">
            <FaCarSide className="text-xl text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AutoParts</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Vehicle MIS</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">Welcome back!</h1>
          <p className="mb-10 text-lg leading-relaxed text-white/80">
            Sign in to manage your vehicles, view service history, and keep your garage running at peak performance.
          </p>

          <ul className="space-y-5">
            <li className="flex items-center gap-4 text-base font-medium text-white/95">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-xs text-blue-300">
                <FaCheck />
              </span>
              Access your full vehicle service history
            </li>
            <li className="flex items-center gap-4 text-base font-medium text-white/95">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-xs text-blue-300">
                <FaCheck />
              </span>
              Manage appointments and AI maintenance alerts
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-white/50">
          © AutoParts Systems
        </div>
      </section>

      {/* Right Form Section */}
      <section className="flex flex-1 items-center justify-center bg-slate-50 p-6 sm:p-12 lg:flex-[1.2]">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/60 sm:p-10">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-800">Sign in</h2>
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">
                Create one now
              </Link>
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors, status }) => (
              <Form className="space-y-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600" htmlFor="email">
                    <MdEmail /> Email address
                  </label>
                  <div className="relative flex items-center">
                    <MdEmail className="pointer-events-none absolute left-4 text-slate-400" />
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 transition focus:outline-none focus:ring-4 ${
                        touched.email && errors.email
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1.5 ml-1 text-xs font-medium text-red-600" />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600" htmlFor="password">
                      <FaLock /> Password
                    </label>
                    <Link to="/forgot-password" weights="semibold" className="text-xs font-semibold text-blue-600 hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <FaLock className="pointer-events-none absolute left-4 text-slate-400" />
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 transition focus:outline-none focus:ring-4 ${
                        touched.password && errors.password
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100'
                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1.5 ml-1 text-xs font-medium text-red-600" />
                </div>

                {status?.message ? (
                  <p className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
                    status.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`} role="alert">
                    {status.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'} {!isSubmitting && <FaArrowRight />}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Authorized personnel only. <br />
              <span className="text-xs text-slate-400 mt-1 block">Your IP and access attempts are being logged.</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
