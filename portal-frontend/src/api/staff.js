import api from './complaints';

export const getStaffProfile = async () => (await api.get('/staff/profile')).data;
export const getStaffStats = async () => (await api.get('/staff/stats')).data;
export const getStaffComplaints = async (params) => (await api.get('/staff/complaints', { params })).data;
export const updateComplaintStatus = async (id, status) => (await api.patch(`/staff/complaints/${id}/status`, { status })).data;
export const getMaintainers = async (space_id) => (await api.get('/staff/maintainers', { params: { space_id } })).data;
export const assignMaintainer = async (id, maintainer_id) => (await api.patch(`/staff/complaints/${id}/assign`, { maintainer_id })).data;
