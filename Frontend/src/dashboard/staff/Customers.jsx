import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiUserPlus, FiUser, FiPhone, 
  FiMail, FiChevronRight, FiCreditCard,
  FiFilter, FiRefreshCw, FiX, FiLock,
  FiCalendar, FiDroplet, FiHash, FiSave, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getAllCustomers, searchCustomers, registerCustomer } from '../../services/staffService';
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

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCustomers();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      try {
        const response = await searchCustomers(query);
        if (response.success) {
          setCustomers(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      }
    } else if (query.length === 0) {
      fetchCustomers();
    }
  };

  const handleRegisterSuccess = () => {
    setIsModalOpen(false);
    fetchCustomers();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 mt-2 font-medium">View and manage registered customers and their vehicles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
        >
          <FiUserPlus size={20} /> Register New Customer
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, email, phone or vehicle number..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition">
            <FiFilter /> Filters
          </button>
          <button 
            onClick={fetchCustomers}
            className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Customer List */}
      {error && (
        <div className="p-8 bg-red-50 text-red-700 rounded-3xl border border-red-100 font-bold text-center">
          {error}
        </div>
      )}

      {loading && customers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-white rounded-[2rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100">
          <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-300 mb-4">
            <FiUser size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No customers found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or register a new customer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} onClick={() => navigate(`/staff/customers/${customer.id}`)} />
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <RegisterModal onClose={() => setIsModalOpen(false)} onSuccess={handleRegisterSuccess} />
      )}
    </div>
  );
};

const RegisterModal = ({ onClose, onSuccess }) => {
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      setStatus(null);
      const response = await registerCustomer(values);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setStatus({ type: 'error', message: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue('vehicleImage', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white w-full max-w-sm rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Success!</h2>
          <p className="text-slate-500 mt-1">Customer registered successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl my-8 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <FiUserPlus className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Register New Customer</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <Formik
            initialValues={{
              fullName: '',
              email: '',
              phone: '',
              password: 'Password123',
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Section */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Personal Details</h3>
                    <FormItem label="Full Name" name="fullName" icon={FiUser} placeholder="John Doe" />
                    <FormItem label="Email Address" name="email" icon={FiMail} type="email" placeholder="john@example.com" />
                    <FormItem label="Phone Number" name="phone" icon={FiPhone} placeholder="98XXXXXXXX" />
                    <FormItem label="Password" name="password" icon={FiLock} type="password" />
                  </div>

                  {/* Vehicle Section */}
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Vehicle Details</h3>
                    <FormItem label="Plate Number" name="vehicleNumber" icon={FiHash} placeholder="BA 1 PA 1234" />
                    <div className="grid grid-cols-2 gap-4">
                      <FormItem label="Make" name="vehicleMake" icon={FaCar} placeholder="Toyota" />
                      <FormItem label="Model" name="vehicleModel" icon={FaCar} placeholder="Corolla" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormItem label="Year" name="vehicleYear" icon={FiCalendar} type="number" />
                      <FormItem label="Color" name="vehicleColor" icon={FiDroplet} placeholder="White" />
                    </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Vehicle Photo</h3>
                  <div className="relative h-48 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <FiUserPlus size={24} className="mb-2" />
                        <span className="text-sm font-medium">Click to upload photo</span>
                      </div>
                    )}
                  </div>
                </div>

                {status?.message && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {status.message}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
                  >
                    {isSubmitting ? 'Saving...' : 'Register Customer'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

const FormItem = ({ label, name, icon: Icon, type = "text", placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={16} />
      </div>
      <Field 
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
      />
    </div>
    <ErrorMessage name={name} component="div" className="text-[10px] text-red-500 font-bold ml-1" />
  </div>
);




const CustomerCard = ({ customer, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
    >
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          {customer.avatarUrl ? (
            <img src={customer.avatarUrl} alt={customer.fullName} className="w-14 h-14 rounded-2xl object-cover shadow-inner" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              {customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{customer.fullName}</h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">Customer ID: #{customer.id}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <FiMail className="text-slate-400" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
            <FiPhone className="text-slate-400" />
            <span>{customer.phone}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FiCreditCard size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Balance</p>
              <p className="text-sm font-black text-slate-800">Rs.{customer.creditBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <FaCar size={14} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Vehicles</p>
              <p className="text-sm font-black text-slate-800">{customer.vehicles?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 py-3 px-8 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
        <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-widest">View Full Profile</span>
        <FiChevronRight className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default Customers;
