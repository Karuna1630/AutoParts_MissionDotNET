import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useField, ErrorMessage } from 'formik';

const PasswordField = ({ name, placeholder = '••••••••', className = '' , id }) => {
  let inFormik = true;
  let field;
  try {
    field = useField(name)[0];
  } catch (e) {
    inFormik = false;
  }

  const [show, setShow] = useState(false);

  const inputProps = inFormik
    ? { ...field, id: id || name }
    : { name, id: id || name };

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 transition focus:outline-none focus:ring-4 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
      {inFormik && (
        <div className="text-xs text-rose-600 mt-1">
          <ErrorMessage name={name} />
        </div>
      )}
    </div>
  );
};

export default PasswordField;
