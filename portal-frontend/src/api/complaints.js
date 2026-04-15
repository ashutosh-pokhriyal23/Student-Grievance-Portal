import api from './client';

export const getSpaces = async () => {
  const response = await api.get('/spaces');
  return response.data;
};

export const getComplaints = async (spaceId) => {
  const response = await api.get('/complaints', {
    params: { space_id: spaceId },
  });
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

export const upvoteComplaint = async (id) => {
  const response = await api.patch(`/complaints/${id}/upvote`);
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export default api;

