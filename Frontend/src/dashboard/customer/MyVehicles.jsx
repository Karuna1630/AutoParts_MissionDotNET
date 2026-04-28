import React, { useState, useEffect, useRef } from 'react';
import { 
  FaCar, FaPlus, FaEllipsisV, FaStar, 
  FaRegStar, FaTrash, FaEdit, FaTimes, 
  FaCheck, FaExclamationTriangle, FaCamera 
} from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  getMyVehicles, addVehicle, updateVehicle, 
  deleteVehicle, setPrimaryVehicle 
} from '../../services/vehicleService';
import { getApiErrorMessage } from '../../services/api';

const vehicleValidationSchema = Yup.object({
  vehicleMake: Yup.string().trim().required('Make is required'),
  vehicleModel: Yup.string().trim().required('Model is required'),
  vehicleNumber: Yup.string().trim().required('Number plate is required'),
  vehicleYear: Yup.number()
    .min(1950, 'Year must be after 1950')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .required('Year is required'),
  vehicleColor: Yup.string().trim(),
});

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getMyVehicles();
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setImagePreview(vehicle?.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
    setImagePreview(null);
    setIsModalOpen(false);
  };

  const handleImageChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('VehicleMake', values.vehicleMake);
      formData.append('VehicleModel', values.vehicleModel);
      formData.append('VehicleNumber', values.vehicleNumber);
      formData.append('VehicleYear', values.vehicleYear);
      formData.append('VehicleColor', values.vehicleColor || '');
      formData.append('IsPrimary', values.isPrimary);
      
      if (values.image) {
        formData.append('Image', values.image);
      }

      let response;
      if (editingVehicle) {
        response = await updateVehicle(editingVehicle.id, formData);
      } else {
        response = await addVehicle(formData);
      }

      if (response.success) {
        showFeedback('success', editingVehicle ? 'Vehicle updated!' : 'Vehicle added!');
        fetchVehicles();
        handleCloseModal();
      }
    } catch (err) {
      showFeedback('error', getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;

    try {
      setActionLoading(id);
      const response = await deleteVehicle(id);
      if (response.success) {
        showFeedback('success', 'Vehicle removed');
        setVehicles(vehicles.filter(v => v.id !== id));
      }
    } catch (err) {
      showFeedback('error', getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      setActionLoading(id);
      const response = await setPrimaryVehicle(id);
      if (response.success) {
        showFeedback('success', 'Primary vehicle updated');
        setVehicles(vehicles.map(v => ({
          ...v,
          isPrimary: v.id === id
        })));
      }
    } catch (err) {
      showFeedback('error', getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Garage</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your registered vehicles.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
        >
          <FaPlus /> Add Vehicle
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-bold animate-in slide-in-from-top duration-300 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {feedback.message}
        </div>
      )}

      {error && (
        <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
          <FaExclamationTriangle className="mx-auto text-3xl text-red-500 mb-4" />
          <p className="text-red-700 font-bold">{error}</p>
          <button onClick={fetchVehicles} className="mt-4 text-sm font-bold text-red-600 underline">Try again</button>
        </div>
      )}

      {/* Vehicle Grid */}
      {vehicles.length === 0 && !error ? (
        <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-300 p-20 text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCar className="text-3xl text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No vehicles yet</h3>
          <p className="text-slate-500 mt-2 mb-8">Add your first vehicle to start tracking health and booking services.</p>
          <button 
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            <FaPlus className="text-xs" /> Add your first vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onEdit={() => handleOpenModal(vehicle)}
              onDelete={() => handleDelete(vehicle.id)}
              onSetPrimary={() => handleSetPrimary(vehicle.id)}
              isLoading={actionLoading === vehicle.id}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition">
                <FaTimes />
              </button>
            </div>

            <div className="p-8">
              <Formik
                enableReinitialize={true}
                initialValues={{
                  vehicleMake: editingVehicle?.vehicleMake || '',
                  vehicleModel: editingVehicle?.vehicleModel || '',
                  vehicleNumber: editingVehicle?.vehicleNumber || '',
                  vehicleYear: editingVehicle?.vehicleYear || new Date().getFullYear(),
                  vehicleColor: editingVehicle?.vehicleColor || '',
                  isPrimary: editingVehicle?.isPrimary || false,
                  image: null
                }}
                validationSchema={vehicleValidationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, setFieldValue }) => (
                  <Form className="space-y-5">
                    {/* Image Upload Area */}
                    <div className="flex flex-col items-center justify-center mb-6">
                      <div className="relative group">
                        <div className="h-24 w-40 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center group-hover:border-blue-400 transition-colors">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <FaCamera className="mx-auto text-slate-400 mb-1" />
                              <span className="text-[10px] font-bold text-slate-400">ADD PHOTO</span>
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-blue-700 transition transform hover:scale-110">
                          <FaPlus className="text-xs" />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleImageChange(e, setFieldValue)} 
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormGroup label="MAKE" name="vehicleMake" placeholder="Toyota" />
                      <FormGroup label="MODEL" name="vehicleModel" placeholder="Corolla" />
                    </div>
                    <FormGroup label="NUMBER PLATE" name="vehicleNumber" placeholder="BA-1-PA-1234" />
                    <div className="grid grid-cols-2 gap-4">
                      <FormGroup label="YEAR" name="vehicleYear" type="number" placeholder="2019" />
                      <FormGroup label="COLOR" name="vehicleColor" placeholder="Pearl White" />
                    </div>

                    <div className="pt-6 flex gap-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VehicleCard = ({ vehicle, onEdit, onDelete, onSetPrimary, isLoading }) => (
  <div className={`group relative bg-white rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden`}>
    {isLoading && (
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )}
    
    {/* Vehicle Image Header */}
    <div className="h-48 bg-slate-50 relative overflow-hidden">
      {vehicle.imageUrl ? (
        <img 
          src={vehicle.imageUrl} 
          alt="Vehicle" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-200">
          <FaCar className="text-6xl" />
        </div>
      )}
      
      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex gap-2">
        {vehicle.isPrimary && (
          <span className="bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 uppercase tracking-wider">
            Primary
          </span>
        )}
      </div>

      {/* Action Buttons Overlay - Hidden by default, shown on hover */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button 
          onClick={onSetPrimary}
          disabled={vehicle.isPrimary}
          className={`h-10 w-10 flex items-center justify-center rounded-xl backdrop-blur-md transition transform hover:scale-110 ${
            vehicle.isPrimary ? 'bg-amber-400 text-white' : 'bg-white text-slate-600 hover:bg-amber-400 hover:text-white'
          }`}
          title="Set as Primary"
        >
          <FaStar />
        </button>
        <button 
          onClick={onEdit}
          className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition transform hover:scale-110 shadow-lg"
          title="Edit"
        >
          <FaEdit />
        </button>
        <button 
          onClick={onDelete}
          className="h-10 w-10 flex items-center justify-center bg-white text-slate-600 hover:bg-rose-500 hover:text-white rounded-xl transition transform hover:scale-110 shadow-lg"
          title="Remove"
        >
          <FaTrash />
        </button>
      </div>
    </div>

    <div className="p-6">
      <div className="flex flex-col">
        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{vehicle.vehicleMake}</h4>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">{vehicle.vehicleModel}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge label={vehicle.vehicleNumber} icon={<div className="h-1.5 w-1.5 rounded-full bg-blue-500" />} />
        <Badge label={vehicle.vehicleYear} />
        {vehicle.vehicleColor && <Badge label={vehicle.vehicleColor} />}
      </div>
    </div>
  </div>
);

const Badge = ({ label, icon }) => (
  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100">
    {icon} {label}
  </span>
);

const FormGroup = ({ label, name, type = "text", placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{label}</label>
    <Field
      type={type}
      name={name}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
    />
    <ErrorMessage name={name} component="div" className="text-[10px] text-rose-500 font-bold ml-1" />
  </div>
);

export default MyVehicles;
