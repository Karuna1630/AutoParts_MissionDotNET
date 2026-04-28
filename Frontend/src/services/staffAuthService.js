import { apiClient } from './api';

export const getPagedStaff = async (pageNumber = 1, pageSize = 10) => {
  const response = await apiClient.get('/StaffAuth', { params: { pageNumber, pageSize } });
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
  