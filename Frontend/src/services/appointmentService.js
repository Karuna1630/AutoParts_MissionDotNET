import { apiClient as api } from './api';

export const bookAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await api.get('/appointments/my-appointments');
  return response.data;
};

export const getSlotAvailability = async (date) => {
  const response = await api.get(`/appointments/slots?date=${date}`);
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.patch(`/appointments/${id}/cancel`);
  return response.data;
};

export const submitReview = async (reviewData) => {
  const response = await api.post('/appointments/review', reviewData);
  return response.data;
};

export const getAllAppointments = async () => {
  const response = await api.get('/appointments/all');
  return response.data;
};
