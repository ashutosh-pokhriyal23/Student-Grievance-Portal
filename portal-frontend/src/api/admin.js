import api from './complaints';

export const getAdminOverview = async () => (await api.get('/admin/overview')).data;
export const getAdminTrends = async () => (await api.get('/admin/trends')).data;
export const getAdminPerformance = async () => (await api.get('/admin/performance')).data;
export const getAdminEscalations = async () => (await api.get('/admin/escalations')).data;
export const getAdminCategories = async () => (await api.get('/admin/categories')).data;
export const getAdminTeachers = async () => (await api.get('/admin/teachers')).data;
export const getAdminSpaceHeads = async (spaceId) => (await api.get(`/admin/space-heads/${spaceId}`)).data;
export const assignAdminSpaceHead = async (payload) => (await api.post('/admin/space-heads', payload)).data;
export const removeAdminSpaceHead = async (id) => (await api.patch(`/admin/space-heads/${id}/remove`)).data;
export const deleteAdminSpaceHeadForever = async (id) => (await api.delete(`/admin/space-heads/${id}`)).data;
export const saveAdminSpaceHeads = async (payload) => (await api.post('/admin/space-heads/save', payload)).data;
export const getAdminSpaces = async () => (await api.get('/spaces')).data;
