import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdBadge, 
  FaEdit, FaCamera, FaCar, FaCalendarCheck, FaCheckCircle, FaSave, FaTimes 
} from 'react-icons/fa';
import { getUserProfile, updateProfile } from '../../services/userService';
import { getApiErrorMessage } from '../../services/api';

const profileValidationSchema = Yup.object({
  fullName: Yup.string().trim().min(3).required('Full name is required'),
  phone: Yup.string().trim().required('Phone is required'),
  address: Yup.string().trim(),
});

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // Preview states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  // File refs
  const avatarFileRef = useRef(null);
  const coverFileRef = useRef(null);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.success) {
        setProfile(response.data);
        setAvatarPreview(response.data.avatarUrl);
        setCoverPreview(response.data.coverUrl);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        navigate('/login');
        return;
      }
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarPreview(reader.result);
          avatarFileRef.current = file;
        } else {
          setCoverPreview(reader.result);
          coverFileRef.current = file;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (values, { setSubmitting, setStatus }) => {
    try {
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('phone', values.phone);
      formData.append('address', values.address || '');
      
      if (avatarFileRef.current) {
        formData.append('avatar', avatarFileRef.current);
      }
      
      if (coverFileRef.current) {
        formData.append('cover', coverFileRef.current);
      }

      const response = await updateProfile(formData);
      
      if (response.success) {
        setProfile(response.data);
        // Update local storage info if needed
        const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        localStorage.setItem('authUser', JSON.stringify({
          ...authUser,
          fullName: response.data.fullName,
          avatarUrl: response.data.avatarUrl
        }));
        
        setIsEditing(false);
        avatarFileRef.current = null;
        coverFileRef.current = null;
        setStatus({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: getApiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-2xl border border-red-100">{error}</div>;
  if (!profile) return null;

  const initials = profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Your account information at a glance.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            <FaEdit className="text-sm" /> Edit profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {/* Cover Photo */}
        <div 
          className="h-48 bg-linear-to-r from-blue-500 via-blue-600 to-indigo-600 relative bg-cover bg-center"
          style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : {}}
        >
          {isEditing && (
            <label className="absolute bottom-4 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition cursor-pointer animate-in fade-in zoom-in duration-200">
              <FaCamera className="text-sm" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
            </label>
          )}
        </div>

        <div className="px-8 pb-10 relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-8 flex items-end">
            <div className="h-32 w-32 rounded-full border-4 border-white bg-[#0F172A] flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-blue-500/10 overflow-hidden">
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : initials}
            </div>
            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full border-2 border-white shadow-lg hover:bg-blue-700 transition cursor-pointer animate-in fade-in zoom-in duration-200">
                <FaCamera className="text-xs" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} />
              </label>
            )}
          </div>

          <div className="pt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800">{profile.fullName}</h2>
                <p className="text-slate-500 font-medium mt-1">{profile.email}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    <FaCheckCircle className="text-[10px]" /> Verified
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                    Silver member
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4">
                <StatBox icon={FaCar} label="VEHICLES" value="2" />
                <StatBox icon={FaCalendarCheck} label="VISITS" value="1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Sections */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-3">
          <div className="text-blue-500 text-lg"><FaUser /></div>
          <h3 className="text-xl font-bold text-slate-800">Personal information</h3>
        </div>

        <div className="p-8">
          <Formik
            initialValues={{
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone || '',
              address: profile.address || '',
              role: profile.role
            }}
            validationSchema={profileValidationSchema}
            onSubmit={handleUpdate}
          >
            {({ isSubmitting, resetForm, status }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                  label="FULL NAME" 
                  name="fullName" 
                  icon={FaUser} 
                  isEditing={isEditing} 
                />
                <InfoItem 
                  label="EMAIL" 
                  name="email" 
                  icon={FaEnvelope} 
                  isEditing={isEditing} 
                  type="email"
                  disabled={true}
                />
                <InfoItem 
                  label="PHONE" 
                  name="phone" 
                  icon={FaPhone} 
                  isEditing={isEditing} 
                />
                <InfoItem 
                  label="ROLE" 
                  name="role" 
                  icon={FaIdBadge} 
                  isEditing={false} 
                />
                <div className="md:col-span-2">
                  <InfoItem 
                    label="ADDRESS" 
                    name="address" 
                    icon={FaMapMarkerAlt} 
                    isEditing={isEditing} 
                  />
                </div>

                {status?.message && (
                   <div className={`md:col-span-2 p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                     {status.message}
                   </div>
                )}

                {isEditing && (
                  <div className="md:col-span-2 flex justify-end gap-4 mt-8 pt-6 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        resetForm();
                        setAvatarPreview(profile.avatarUrl);
                        setCoverPreview(profile.coverUrl);
                        avatarFileRef.current = null;
                        coverFileRef.current = null;
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition"
                    >
                      <FaTimes /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                    >
                      <FaSave /> {isSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 min-w-40">
    <div className="text-slate-400 text-lg"><Icon /></div>
    <div>
      <p className="text-[10px] font-bold tracking-widest text-slate-400">{label}</p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

const InfoItem = ({ label, name, icon: Icon, isEditing, type = "text", disabled = false }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400">
      <Icon className="text-[10px]" /> {label}
    </label>
    {isEditing ? (
      <div className="space-y-1">
        <Field
          type={type}
          name={name}
          disabled={disabled}
          className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 ${
            disabled 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-blue-100 focus:border-blue-500'
          }`}
        />
        <ErrorMessage name={name} component="div" className="text-xs text-red-500 font-bold ml-1" />
      </div>
    ) : (
      <div className="bg-slate-50/50 border border-slate-100/50 rounded-xl px-4 py-4.5">
        <Field name={name}>
          {({ field }) => (
            <p className="text-sm font-semibold text-slate-800">{field.value || '—'}</p>
          )}
        </Field>
      </div>
    )}
  </div>
);

export default ProfileSettings;
