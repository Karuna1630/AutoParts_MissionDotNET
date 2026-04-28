import { apiClient } from './api';

export const getUserProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};

export const updateProfile = async (formData) => {
  // We use multipart/form-data for file uploads
  const response = await apiClient.post('/user/profile/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
