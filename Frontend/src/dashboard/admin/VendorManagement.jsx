import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaEdit, FaPlus, FaTrashAlt } from 'react-icons/fa';
import * as Yup from 'yup';
import { createVendor, deleteVendor, getVendors, updateVendor } from '../../services/vendorService';
import { getApiErrorMessage } from '../../services/api';

const vendorValidationSchema = Yup.object().shape({
  companyName: Yup.string().required('Company name is required'),
  contactName: Yup.string().required('Contact person is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone is required'),
  address: Yup.string().required('Address is required'),
});

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVendors = useCallback(async (pageNumber = 1, size = pageSize, query = debouncedSearch) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getVendors(pageNumber, size, query);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to load vendors.');
      }
      setVendors(res.data?.items || []);
      const totalItems = res.data?.totalCount || 0;
      setTotalCount(totalItems);
      const computedTotalPages = res.data?.totalPages ?? Math.max(1, Math.ceil(totalItems / size));
      setTotalPages(computedTotalPages);
      const nextPage = res.data?.pageNumber || 1;
      if (computedTotalPages > 0 && nextPage > computedTotalPages) {
        setPage(computedTotalPages);
        return;
      }
      setPage(nextPage);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load vendors.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pageSize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    fetchVendors(page, pageSize, debouncedSearch);
  }, [fetchVendors, page, pageSize, debouncedSearch]);

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
    setFormKey((prev) => prev + 1);
  };

  const initialValues = useMemo(
    () => ({
      companyName: editingVendor?.companyName || '',
      contactName: editingVendor?.contactName || '',
      email: editingVendor?.email || '',
      phone: editingVendor?.phone || '',
      address: editingVendor?.address || '',
    }),
    [editingVendor]
  );

  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      setStatus(null);
      setActionLoading(true);
      const payload = { ...values };
      const res = editingVendor
        ? await updateVendor(editingVendor.id, payload)
        : await createVendor(payload);

      if (!res?.success) {
        const message = Array.isArray(res?.errors) && res.errors.length > 0
          ? res.errors.join(' ')
          : res?.message || 'Failed to save vendor.';
        setStatus(message);
        return;
      }

      resetForm();
      handleCloseModal();
        await fetchVendors(1, pageSize, debouncedSearch);
      setPage(1);
    } catch (err) {
      setStatus(getApiErrorMessage(err, 'Failed to save vendor.'));
    } finally {
      setSubmitting(false);
      setActionLoading(false);
    }
  };

  const handleDelete = async (vendor) => {
    const confirmed = window.confirm(`Delete ${vendor.companyName}?`);
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await deleteVendor(vendor.id);
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to delete vendor.');
      }
      await fetchVendors(page, pageSize, debouncedSearch);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete vendor.'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#FAFBFF] min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1C2E] mb-2">Vendor Portal</h1>
          <p className="text-slate-500 text-sm">Manage suppliers, points of contact and procurement details.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#4887FA] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition"
        >
          <FaPlus className="text-sm" /> Add vendor
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
            placeholder="Search vendors..."
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm focus:border-[#4887FA] focus:outline-none focus:ring-2 focus:ring-[#4887FA]/20"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-[#4887FA] focus:outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[22%]">Company</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[18%]">Contact</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[20%]">Email</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[14%]">Phone</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[18%]">Address</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-500 w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No vendors found.</td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="py-5 px-6">
                      <div className="font-semibold text-slate-800">{vendor.companyName}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{vendor.contactName}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{vendor.email}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{vendor.phone}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="text-slate-500 text-sm">{vendor.address}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-700 transition"
                          onClick={() => handleOpenEdit(vendor)}
                          disabled={actionLoading}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="text-red-400 hover:text-red-600 transition"
                          onClick={() => handleDelete(vendor)}
                          disabled={actionLoading}
                        >
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

      {!loading && totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-between mt-6 gap-3">
          <p className="text-sm text-slate-500">
            Showing {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}-{totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded text-slate-600 disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">{editingVendor ? 'Edit vendor' : 'Add vendor'}</h2>
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
              validationSchema={vendorValidationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, status, errors, touched }) => (
                <Form className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Company name</label>
                    <Field
                      name="companyName"
                      className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                        touched.companyName && errors.companyName
                          ? 'border-red-300 focus:ring-red-100'
                          : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                      }`}
                      placeholder="BoschParts Co."
                    />
                    <ErrorMessage name="companyName" component="div" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Contact person</label>
                      <Field
                        name="contactName"
                        className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                          touched.contactName && errors.contactName
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                        placeholder="Hans Muller"
                      />
                      <ErrorMessage name="contactName" component="div" className="mt-1 text-xs text-red-500" />
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
                        placeholder="sales@bosch.example"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-xs text-red-500" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
                      <Field
                        name="phone"
                        className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                          touched.phone && errors.phone
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                        placeholder="+49 30 1234"
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-xs text-red-500" />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
                      <Field
                        name="address"
                        className={`w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 ${
                          touched.address && errors.address
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-slate-200 focus:border-[#4887FA] focus:ring-[#4887FA]/20'
                        }`}
                        placeholder="Berlin, DE"
                      />
                      <ErrorMessage name="address" component="div" className="mt-1 text-xs text-red-500" />
                    </div>
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
                      {isSubmitting ? (editingVendor ? 'Saving...' : 'Creating...') : editingVendor ? 'Save' : 'Create'}
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

export default VendorManagement;
