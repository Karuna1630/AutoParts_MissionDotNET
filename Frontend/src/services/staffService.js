import { apiClient } from './api';

export const getStaff = async (pageNumber = 1, pageSize = 10) => {
  const response = await apiClient.get('/staff', {
    params: { pageNumber, pageSize }
  });
  return response.data;
};

export const getStaffById = async (id) => {
  const response = await apiClient.get(`/staff/${id}`);
  return response.data;
};

export const createStaff = async (staffData) => {
  // backend /api/staff expects CreateStaffDto
  const dto = {
    firstName: staffData.firstName,
    lastName: staffData.lastName,
    email: staffData.email,
    phoneNumber: staffData.phoneNumber,
    password: staffData.password,
    confirmPassword: staffData.confirmPassword,
    userRole: staffData.role.toUpperCase() === 'ADMIN' ? 0 : 1,
    profilePictureUrl: ''
  };

  const response = await apiClient.post('/staff', dto);
  return response.data;
};

export const updateStaffRole = async (id, role) => {
  const response = await apiClient.patch(`/staff/${id}/role`, null, {
    params: { role }
  });
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await apiClient.delete(`/staff/${id}`);
  return response.data;
};
