import React, { useState } from 'react';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiShield, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { createStaff } from '../../services/staffService';

const CreateStaff = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'STAFF',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await createStaff(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/staff'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff member. Please check your data.');
      console.error(err);
    } finally {
      setLoading(false);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/admin/staff')}
          className="p-3 bg-white border border-slate-100 shadow-sm hover:bg-slate-50 rounded-2xl transition active:scale-90"
        >
          <FiArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register New Staff</h1>
          <p className="text-slate-500 font-medium mt-1">Onboard a new team member to the administrative panel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Helper Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <FiShield className="text-blue-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">Security Protocol</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Staff members will receive an email confirmation. Ensure their phone number is correct for two-factor authentication.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" /> Min 8 characters password
                </li>
                <li className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" /> Unique email address
                </li>
              </ul>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Form Container */}
        <div className="lg:col-span-2">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            {error && (
              <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold text-sm animate-in shake duration-500">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiUser /> First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiUser /> Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    placeholder="Doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiMail /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    placeholder="john@autoparts.com"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiPhone /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    placeholder="10 digit number"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiShield /> Administrative Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="STAFF">Standard Staff</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiLock /> Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    placeholder="••••••••"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FiLock /> Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-10">
                <button
                  type="button"
                  onClick={() => navigate('/admin/staff')}
                  className="flex-1 px-8 py-4 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStaff;
