import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaUser, FaPhone, FaLock, FaArrowRight, FaCheck, FaCarSide, FaArrowLeft } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { registerValidationSchema } from '../utils/RegisterValidation';
import { getApiErrorMessage } from '../services/api';
import { registerCustomer } from '../services/authService';

const fieldConfigs = [
  {
    id: 'fullName',
    name: 'fullName',
    label: 'Full name',
    type: 'text',
    placeholder: 'James Carter',
    Icon: FaUser,
  },
  {
    id: 'email',
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    Icon: MdEmail,
  },
  {
    id: 'phone',
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: '+1 555 0123',
    Icon: FaPhone,
  },
  {
    id: 'password',
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    Icon: FaLock,
  },
  {
    id: 'confirmPassword',
    name: 'confirmPassword',
    label: 'Confirm password',
    type: 'password',
    placeholder: '••••••••',
    Icon: FaLock,
  },
];

const initialValues = fieldConfigs.reduce((accumulator, field) => {
  accumulator[field.name] = '';
  return accumulator;
}, {});

const Register = () => {
  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    setStatus(undefined);

    try {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      };

      const response = await registerCustomer(payload);

      if (!response?.success) {
        setStatus({
          type: 'error',
          message:
            (Array.isArray(response?.errors) && response.errors.length > 0
              ? response.errors.join(' ')
              : response?.message) || 'Registration failed. Please try again.',
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
            avatarUrl: response.data.avatarUrl,
            coverUrl: response.data.coverUrl,
            expiresAtUtc: response.data.expiresAtUtc,
          }),
        );
      }

      resetForm();
      setStatus({
        type: 'success',
        message: response?.message || 'Registration successful.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error, 'Registration failed. Please try again.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-16 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/40">
            <FaCarSide className="text-xl text-white" />
          </div>
          <div>
            <h2>AutoParts</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Vehicle MIS</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">Your garage, supercharged.</h1>
          <p className="mb-10 text-lg leading-relaxed text-white/80">
            Track every vehicle, book service in one tap, get smart failure alerts before a part fails - all in one place.
          </p>

          <ul className="space-y-5">
            <li className="flex items-center gap-4 text-base font-medium text-white/95">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-xs text-blue-300">
                <FaCheck />
              </span>
              Genuine parts with 12-month warranty
            </li>
            <li className="flex items-center gap-4 text-base font-medium text-white/95">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-xs text-blue-300">
                <FaCheck />
              </span>
              Predictive maintenance alerts
            </li>
            <li className="flex items-center gap-4 text-base font-medium text-white/95">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300/30 bg-blue-400/20 text-xs text-blue-300">
                <FaCheck />
              </span>
              Loyalty rewards on every visit
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-sm text-white/50">
          © AutoParts Systems
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-slate-50 p-4 sm:p-8 lg:flex-[1.2]">
        <div className="w-full max-w-xl animate-[fade-in_0.45s_ease-out] rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-10">
          <div className="mb-8">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800">
              <FaArrowLeft /> Back to home
            </Link>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-800">Create your account</h2>
            <p className="text-sm text-slate-500">
              Already a member?{' '}
              <Link to="/login" className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={registerValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, touched, errors, status }) => (
              <Form className="space-y-5">
                {fieldConfigs.map((field) => {
                  const { id, name, label, type, placeholder, Icon } = field;
                  const hasError = Boolean(touched[name] && errors[name]);

                  return (
                    <div key={id}>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600" htmlFor={id}>
                        <Icon /> {label}
                      </label>
                      <div className="relative flex items-center">
                        <Icon className="pointer-events-none absolute left-4 text-slate-400" />
                        <Field
                          type={type}
                          id={id}
                          name={name}
                          className={`w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-4 ${
                            hasError
                              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-100'
                              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                          }`}
                          placeholder={placeholder}
                        />
                      </div>
                      <ErrorMessage
                        name={name}
                        component="p"
                        className="mt-1.5 ml-1 text-xs font-medium text-red-600"
                      />
                    </div>
                  );
                })}

                {status?.message ? (
                  <p
                    className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
                      status.type === 'error'
                        ? 'border-red-200 bg-red-50 text-red-800'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                    role="alert"
                  >
                    {status.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'} {!isSubmitting ? <FaArrowRight /> : null}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-sm text-slate-500">
            You can add your vehicles anytime from <strong>My Garage</strong>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
