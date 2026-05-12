import { apiClient } from './api';
export const getPagedStaff = async (pageNumber = 1, pageSize = 10, search = '') => {
  const params = { pageNumber, pageSize };
  if (search) {
    params.search = search;
  }
  const response = await apiClient.get('/StaffAuth', { params });
  return response.data;
};

export const registerStaff = async (payload) => {
  const response = await apiClient.post('/StaffAuth/register', payload);
  return response.data;
};

export const updateStaffRole = async (id, roleValue) => {
  // Pass the role as a numeric query string since endpoint expects an enum value
  const response = await apiClient.patch(
    `/StaffAuth/update-role/${id}?role=${encodeURIComponent(roleValue)}`
  );
  return response.data;
};

export const updateStaff = async (id, payload) => {
  const response = await apiClient.put(`/StaffAuth/${id}`, payload);
  return response.data;
};

export const uploadStaffProfileImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post(`/StaffAuth/${id}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
  