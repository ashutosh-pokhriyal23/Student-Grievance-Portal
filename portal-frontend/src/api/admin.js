import api from './complaints';

export const getAdminOverview = async () => (await api.get('/admin/overview')).data;
export const getAdminTrends = async () => (await api.get('/admin/trends')).data;
export const getAdminPerformance = async () => (await api.get('/admin/performance')).data;
export const getAdminEscalations = async () => (await api.get('/admin/escalations')).data;
export const getAdminCategories = async () => (await api.get('/admin/categories')).data;
