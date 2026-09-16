import api from './api';

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

export const mediaService = {
  list: (params = {}) => api.get('/media', { params }),
  get: (id) => api.get(`/media/${id}`),
  store: (formData, config = {}) => api.post('/media', formData, { ...config, headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData, config = {}) => api.post(`/media/${id}?_method=PUT`, formData, { ...config, headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/media/${id}`),
  download: (id) => api.get(`/media/${id}/download`, { responseType: 'blob' }),
  downloadFile: (id, fileId) => api.get(`/media/${id}/files/${fileId}/download`, { responseType: 'blob' }),
  approve: (id, data = {}) => api.post(`/media/${id}/approve`, data),
  unapprove: (id, data) => api.post(`/media/${id}/unapprove`, data),
  trash: (params = {}) => api.get('/media/trash', { params }),
  restore: (id) => api.post(`/media/${id}/restore`),
  forceDelete: (id) => api.delete(`/media/${id}/force`),
};

export const userService = {
  list: (params = {}) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  store: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
};

export const masterService = {
  departments: () => api.get('/departments'),
  storeDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  roles: () => api.get('/roles'),

  categories: () => api.get('/categories'),
  storeCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const dashboardService = {
  stats: () => api.get('/dashboard'),
};

export const activityLogService = {
  list: (params = {}) => api.get('/activity-logs', { params }),
};