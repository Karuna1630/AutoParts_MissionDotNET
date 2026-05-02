import { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaEdit, FaTrashAlt, FaPlus, FaEye } from 'react-icons/fa';
import * as Yup from 'yup';
import { getPagedStaff, updateStaff, updateStaffRole, uploadStaffProfileImage } from '../../services/staffAuthService';
import { createStaff } from '../../services/adminService';
import { getApiErrorMessage } from '../../services/api';

const staffCreateValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const staffEditValidationSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
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
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchStaff = useCallback(async (pageNumber = 1, query = debouncedSearch) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPagedStaff(pageNumber, 10, query);
      setStaffList(res.items || []);
      setTotalPages(res.totalPages || 1);
      setPage(res.pageNumber || 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load staff members.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchStaff(page, debouncedSearch);
  }, [fetchStaff, page, debouncedSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleRoleChange = async (id, newRole) => {
    try {
      setActionLoading(id);
      const roleValue = newRole === 'Admin' ? 0 : 1;
      await updateStaffRole(id, roleValue);
      // Update local state instead of doing full refresh to be snappy
      setStaffList(prev => prev.map(s => {
        if(s.identityId === id || s.id === id) {
          return { ...s, role: newRole, userRole: roleValue };
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
    setEditingStaff(null);
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setFormKey((prev) => prev + 1);
  };

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setProfileImagePreview(staff?.profilePictureUrl || null);
    setIsModalOpen(true);
  };

  const handleOpenView = (staff) => {
    setViewingStaff(staff);
  };

  const handleCloseView = () => {
    setViewingStaff(null);
  };

  const initialValues = useMemo(() => ({
    firstName: editingStaff?.firstName || '',
    lastName: editingStaff?.lastName || '',
    email: editingStaff?.email || '',
    phoneNumber: editingStaff?.phoneNumber || '',
    password: '',
    confirmPassword: '',
  }), [editingStaff]);

  const formatDate = (value) => {
    if (!value) return 'Not available';
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime()) || dateValue.getFullYear() <= 1) {
      return 'Not available';
    }
    return dateValue.toLocaleString();
  };

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      setStatus(null);
      if (editingStaff) {
        const staffId = editingStaff.identityId || editingStaff.id;
        if (!staffId) {
          setStatus('Unable to update staff profile. Missing staff identifier.');
          return;
        }
        const roleValue = typeof editingStaff?.userRole === 'number'
          ? editingStaff.userRole
          : editingStaff?.role === 'Admin'
            ? 0
            : 1;
        const payload = {
          identityId: staffId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          profilePictureUrl: editingStaff.profilePictureUrl || null,
          userRole: roleValue,
        };
       await updateStaff(payload.identityId, payload);
        if (profileImageFile) {
          await uploadStaffProfileImage(payload.identityId, profileImageFile);
        }
      } else {
        const payload = { ...values, userRole: 1 };
        const res = await createStaff(payload);
        if (res?.success === false) {
          setStatus(res?.message || 'Failed to create staff account.');
          return;
        }
        if (profileImageFile && res?.identityId) {
          await uploadStaffProfileImage(res.identityId, profileImageFile);
        }
      }

      resetForm();
      handleCloseModal();
      setPage(1);
      await fetchStaff(1, debouncedSearch);
    } catch (err) {
      setStatus(getApiErrorMessage(err, editingStaff ? 'Failed to update staff profile.' : 'Failed to create staff account.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="w-full h-full bg-[#FAFBFF] min-h-screen p-8">
      {/* Header Container */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1C2E] mb-2">Staff Management</h1>
          <p className="text-slate-500 text-sm">Register staff members. Roles are assigned automatically.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#4887FA] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition"
        >
          <FaPlus className="text-sm" /> Add member
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name..."
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm focus:border-[#4887FA] focus:outline-none focus:ring-2 focus:ring-[#4887FA]/20"
          />
        </div>
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
                staffList.map((staff, idx) => {
                  const roleLabel = staff.role || (staff.userRole === 0 ? 'Admin' : 'Staff');
                  return (
                  <tr key={staff.identityId || staff.id || idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-5 px-6">
                      <div className="font-semibold text-slate-800">{staff.firstName} {staff.lastName}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{staff.email}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{staff.phoneNumber || staff.phone}</div>
                    </td>
                    <td className="py-5 px-6">
                      <select 
                        value={roleLabel} 
                        onChange={(e) => handleRoleChange(staff.identityId || staff.id, e.target.value)}
                        disabled={actionLoading === (staff.identityId || staff.id)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer appearance-none outline-none ${
                          roleLabel === 'Admin' 
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
                        <button
                          className="text-slate-500 hover:text-slate-700 transition"
                          onClick={() => handleOpenEdit(staff)}
                          disabled={actionLoading === (staff.identityId || staff.id)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-slate-500 hover:text-slate-700 transition"
                          onClick={() => handleOpenView(staff)}
                          disabled={actionLoading === (staff.identityId || staff.id)}
                        >
                          <FaEye />
                        </button>
                        <button className="text-red-400 hover:text-red-600 transition">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })
              )}

      {viewingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Staff profile</h2>
              <button
                type="button"
                onClick={handleCloseView}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Name</div>
                <div className="mt-1 text-slate-800">{viewingStaff.firstName} {viewingStaff.lastName}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Email</div>
                <div className="mt-1 text-slate-800 break-all">{viewingStaff.email}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Phone</div>
                <div className="mt-1 text-slate-800">{viewingStaff.phoneNumber || viewingStaff.phone}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Role</div>
                <div className="mt-1 text-slate-800">{viewingStaff.role || (viewingStaff.userRole === 0 ? 'Admin' : 'Staff')}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Registered</div>
                <div className="mt-1 text-slate-800">{formatDate(viewingStaff.registrationDate)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last managed date</div>
                <div className="mt-1 text-slate-800">{formatDate(viewingStaff.lastManagedDate)}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Last managed by</div>
                <div className="mt-1 text-slate-800">{viewingStaff.lastManagedBy ? viewingStaff.lastManagedBy : 'Not available'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Profile image</div>
                <div className="mt-1">
                  {viewingStaff.profilePictureUrl ? (
                    <a
                      href={viewingStaff.profilePictureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4887FA] hover:text-blue-600 font-semibold"
                    >
                      View image
                    </a>
                  ) : (
                    <span className="text-slate-500">Not available</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCloseView}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-800">{editingStaff ? 'Edit staff profile' : 'Add new member'}</h2>
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
              initialValues={initialValues}
              validationSchema={editingStaff ? staffEditValidationSchema : staffCreateValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, status, errors, touched }) => (
                <Form className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">First name</label>
                    <Field
                      name="firstName"
                      className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.firstName && errors.firstName
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="John"
                    />
                    <ErrorMessage name="firstName" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Last name</label>
                    <Field
                      name="lastName"
                      className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.lastName && errors.lastName
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="Doe"
                    />
                    <ErrorMessage name="lastName" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
                    <Field
                      name="email"
                      type="email"
                      className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.email && errors.email
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="john@example.com"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Phone</label>
                    <Field
                      name="phoneNumber"
                      className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.phoneNumber && errors.phoneNumber
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="+1 234 567 890"
                    />
                    <ErrorMessage name="phoneNumber" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Profile image</label>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center text-[10px] font-semibold text-slate-500">
                          {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Staff" className="h-full w-full object-cover" />
                          ) : (
                            'N/A'
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          JPG, PNG up to 5MB
                        </div>
                      </div>
                      <label className="text-xs font-semibold text-[#4887FA] cursor-pointer">
                        Upload image
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
                    <Field
                      name="password"
                      type="password"
                      className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.password && errors.password
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="••••••••"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Confirm password</label>
                    <Field
                      name="confirmPassword"
                      type="password"
                      className={`w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.confirmPassword && errors.confirmPassword
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="••••••••"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  {status && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 sm:col-span-2">
                      {status}
                    </div>
                  )}

                  <div className="mt-2 flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-[#4887FA] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isSubmitting ? (editingStaff ? 'Saving...' : 'Creating...') : editingStaff ? 'Save' : 'Create'}
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
