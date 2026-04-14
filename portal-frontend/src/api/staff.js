import api from './complaints';

export const getStaffStats = async () => {
  const response = await api.get('/staff/stats');
  return response.data;
};

export const getStaffComplaints = async (params) => {
  const response = await api.get('/staff/complaints', { params });
  return response.data;
};

export const updateComplaintStatus = async (id, status) => {
  const response = await api.patch(`/staff/complaints/${id}/status`, { status });
  return response.data;
};
