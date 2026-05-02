import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, 
  FiCreditCard, FiPlus, FiCheck,
  FiCalendar, FiDroplet, FiHash, FiSave, FiX
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getCustomerDetails, addVehicleToCustomer } from '../../services/staffService';
import { getApiErrorMessage } from '../../services/api';

const vehicleSchema = Yup.object({
  vehicleNumber: Yup.string().required('Required'),
  vehicleModel: Yup.string().required('Required'),
  vehicleMake: Yup.string().required('Required'),
  vehicleYear: Yup.number().required('Required').min(1950).max(new Date().getFullYear() + 1),
  vehicleColor: Yup.string().nullable()
});

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await getCustomerDetails(id);
      if (response.success) {
        setCustomer(response.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (values, { setSubmitting, resetForm, setStatus }) => {
    try {
      const response = await addVehicleToCustomer(id, values);
      if (response.success) {
        setCustomer(response.data);
        setIsAddVehicleOpen(false);
        resetForm();
      }
    } catch (err) {
      setStatus({ type: 'error', message: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-2xl border border-red-100 font-bold">{error}</div>;
  if (!customer) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff/customers')} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:bg-slate-50 transition shadow-sm">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Customer Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {customer.avatarUrl ? (
                <img src={customer.avatarUrl} alt={customer.fullName} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg shadow-blue-200" />
              ) : (
                <div className="w-24 h-24 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-200">
                  {customer.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{customer.fullName}</h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">ID: #{customer.id}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <DetailItem icon={FiMail} label="Email Address" value={customer.email} />
              <DetailItem icon={FiPhone} label="Phone Number" value={customer.phone} />
              <DetailItem icon={FiCreditCard} label="Credit Balance" value={`$${customer.creditBalance.toFixed(2)}`} />
            </div>
          </div>
        </div>

        {/* Right Column: Vehicles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiCar className="text-blue-600" size={20} />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Registered Vehicles</h3>
              </div>
              <button 
                onClick={() => setIsAddVehicleOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-100 transition"
              >
                <FiPlus /> Add Vehicle
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 group transition-all hover:bg-white hover:shadow-lg">
                    {vehicle.imageUrl && (
                      <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                        <img src={vehicle.imageUrl} alt={`${vehicle.vehicleMake} ${vehicle.vehicleModel}`} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                        <FiCar size={20} />
                      </div>
                      {vehicle.isPrimary && (
                        <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Primary</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{vehicle.vehicleMake} {vehicle.vehicleModel}</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        <FiHash size={12} /> {vehicle.vehicleNumber}
                      </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                       <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg">YEAR: {vehicle.vehicleYear}</span>
                       <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg uppercase">{vehicle.vehicleColor || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add New Vehicle</h3>
              <button onClick={() => setIsAddVehicleOpen(false)} className="p-2 hover:bg-white rounded-full transition"><FiX size={20} /></button>
            </div>
            <Formik
              initialValues={{ vehicleNumber: '', vehicleModel: '', vehicleMake: '', vehicleYear: new Date().getFullYear(), vehicleColor: '', vehicleImage: null }}
              validationSchema={vehicleSchema}
              onSubmit={handleAddVehicle}
            >
              {({ isSubmitting, status, setFieldValue, values }) => (
                <Form className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <ModalFormItem label="NUMBER" name="vehicleNumber" icon={FiHash} placeholder="ABC-123" />
                    <ModalFormItem label="YEAR" name="vehicleYear" icon={FiCalendar} type="number" />
                    <ModalFormItem label="MAKE" name="vehicleMake" icon={FiCar} placeholder="e.g. Toyota" />
                    <ModalFormItem label="MODEL" name="vehicleModel" icon={FiCar} placeholder="e.g. Camry" />
                    <div className="col-span-2">
                      <ModalFormItem label="COLOR" name="vehicleColor" icon={FiDroplet} placeholder="e.g. White" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">IMAGE</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFieldValue('vehicleImage', e.target.files[0])}
                        className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {values.vehicleImage && (
                        <div className="mt-1 text-[10px] font-bold text-green-600 ml-1">
                          {values.vehicleImage.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {status?.message && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl">{status.message}</div>}

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsAddVehicleOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition disabled:opacity-50 uppercase tracking-widest text-xs">
                      {isSubmitting ? 'Saving...' : 'Add Vehicle'}
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

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
    </div>
  </div>
);

const ModalFormItem = ({ label, name, icon: Icon, type="text", placeholder }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
      <Field 
        type={type} 
        name={name} 
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition"
      />
    </div>
    <ErrorMessage name={name} component="div" className="text-[9px] text-red-500 font-bold ml-1" />
  </div>
);

export default CustomerDetails;
