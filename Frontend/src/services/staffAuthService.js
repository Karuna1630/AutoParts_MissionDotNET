import { apiClient } from './api';

export const getPagedStaff = async (pageNumber = 1, pageSize = 10) => {
  const response = await apiClient.get('/StaffAuth', { params: { pageNumber, pageSize } });
  return response.data;
};

export const registerStaff = async (payload) => {
  const response = await apiClient.post('/StaffAuth', payload);
  return response.data;
};

export const updateStaffRole = async (id, roleName) => {
  // Pass the role as a query string since controller expects [FromQuery]
  const response = await apiClient.patch(`/StaffAuth/${id}?role=${encodeURIComponent(roleName)}`);
  return response.data;
};
