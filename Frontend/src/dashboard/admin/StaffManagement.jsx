import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import * as Yup from 'yup';
import { getPagedStaff, updateStaffRole } from '../../services/staffAuthService';
import { createStaff } from '../../services/adminService';
import { getApiErrorMessage } from '../../services/api';

const staffValidationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const fetchStaff = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPagedStaff(pageNumber, 10);
      setStaffList(res.items || []);
      setTotalPages(res.totalPages || 1);
      setPage(res.pageNumber || 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load staff members.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff(page);
  }, [fetchStaff, page]);

  const handleRoleChange = async (id, newRole) => {
    try {
      setActionLoading(id);
      await updateStaffRole(id, newRole);
      // Update local state instead of doing full refresh to be snappy
      setStaffList(prev => prev.map(s => {
        if(s.identityId === id || s.id === id) {
          return { ...s, role: newRole };
        }
        return s;
      }));
    } catch(err) {
      console.error(err);
      alert('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormKey((prev) => prev + 1);
  };

  const handleCreateStaff = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      setStatus(null);
      const res = await createStaff(values);
      if (res?.success === false) {
        setStatus(res?.message || 'Failed to create staff account.');
        return;
      }

      resetForm();
      handleCloseModal();
      setPage(1);
      await fetchStaff(1);
    } catch (err) {
      setStatus(getApiErrorMessage(err, 'Failed to create staff account.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#FAFBFF] min-h-screen p-8">
      {/* Header Container */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1C2E] mb-2">Staff Management</h1>
          <p className="text-slate-500 text-sm">Register administrators and staff members. Roles control which modules they can access.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#4887FA] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition"
        >
          <FaPlus className="text-sm" /> Add member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[25%]">Name</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[25%]">Email</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[20%]">Phone</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[15%]">Role</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                   <td colSpan="5" className="py-8 text-center text-slate-500">No staff found.</td>
                </tr>
              ) : (
                staffList.map((staff, idx) => (
                  <tr key={staff.identityId || staff.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-5 px-6">
                      <div className="font-semibold text-slate-800">{staff.firstName} {staff.lastName}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{staff.email}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{staff.phone}</div>
                    </td>
                    <td className="py-5 px-6">
                      <select 
                        value={staff.role || 'Staff'} 
                        onChange={(e) => handleRoleChange(staff.identityId || staff.id, e.target.value)}
                        disabled={actionLoading === (staff.identityId || staff.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer appearance-none outline-none ${
                          staff.role === 'Admin' 
                            ? 'bg-[#0F172A] text-white' 
                            : 'bg-[#64748B] text-white'
                        }`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-4">
                        <button className="text-slate-500 hover:text-slate-700 transition">
                          <FaEdit />
                        </button>
                        <button className="text-red-400 hover:text-red-600 transition">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Add new member</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <Formik
              key={formKey}
              initialValues={{ fullName: '', email: '', phone: '', password: '' }}
              validationSchema={staffValidationSchema}
              onSubmit={handleCreateStaff}
            >
              {({ isSubmitting, status, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Full name</label>
                    <Field
                      name="fullName"
                      className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.fullName && errors.fullName
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="John Doe"
                    />
                    <ErrorMessage name="fullName" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                    <Field
                      name="email"
                      type="email"
                      className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.email && errors.email
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="john@example.com"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                    <Field
                      name="phone"
                      className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.phone && errors.phone
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="+1 234 567 890"
                    />
                    <ErrorMessage name="phone" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
                    <Field
                      name="password"
                      type="password"
                      className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.password && errors.password
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="��������"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  {status && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                      {status}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-[#4887FA] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
