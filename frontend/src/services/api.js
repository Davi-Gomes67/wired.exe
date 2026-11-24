import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 12000,
});

const AUTH_KEY = 'wired.exe.auth.v1';
let onUnauthorized = null;

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

try {
  const raw = localStorage.getItem(AUTH_KEY);
  const parsed = raw ? JSON.parse(raw) : null;
  if (parsed?.token) setAuthToken(parsed.token);
} catch {
  // ignore
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) onUnauthorized(error);
    return Promise.reject(error);
  },
);

export const getErrorMessage = (error) =>
  error.response?.data?.error?.message || error.message || 'Não foi possível concluir a operação.';

export const catalogService = {
  getCategories: () => api.get('/categories').then((res) => res.data),
  getProducts: (params) => api.get('/products', { params }).then((res) => res.data),
  getBrands: () => api.get('/products/brands/list').then((res) => res.data),
  getProductBySlug: (slug) => api.get(`/products/${slug}`).then((res) => res.data),
};

export const cartService = {
  validate: (items) => api.post('/cart/validate', { items }).then((res) => res.data),
};

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((res) => res.data),
  changePassword: (payload) => api.patch('/auth/me/password', payload).then((res) => res.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
};

export const addressService = {
  list: () => api.get('/addresses').then((res) => res.data),
  create: (payload) => api.post('/addresses', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/addresses/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/addresses/${id}`).then((res) => res.data),
};

export const ordersService = {
  create: (payload) => api.post('/orders', payload).then((res) => res.data),
  getByCode: (code) => api.get(`/orders/${encodeURIComponent(code)}`).then((res) => res.data),
  listMine: () => api.get('/orders').then((res) => res.data),
};

export const adminService = {
  dashboard: (params) => api.get('/admin/dashboard', { params }).then((r) => r.data),
  activities: {
    list: (params) => api.get('/admin/activities', { params }).then((r) => r.data),
  },
  categories: {
    list: () => api.get('/admin/categories').then((r) => r.data),
    create: (payload) => api.post('/admin/categories', payload).then((r) => r.data),
    update: (id, payload) => api.put(`/admin/categories/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/admin/categories/${id}`),
  },
  products: {
    list: (params) => api.get('/admin/products', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/products/${id}`).then((r) => r.data),
    create: (payload) => api.post('/admin/products', payload).then((r) => r.data),
    update: (id, payload) => api.put(`/admin/products/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
    updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock`, { stock }).then((r) => r.data),
    uploadImages: (id, files) => {
      const fd = new FormData();
      [...files].forEach((f) => fd.append('images', f));
      return api.post(`/admin/products/${id}/images`, fd).then((r) => r.data);
    },
    removeImage: (imageId) => api.delete(`/admin/products/images/${imageId}`),
  },
  orders: {
    list: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data),
    updateStatus: (id, payload) => api.patch(`/admin/orders/${id}/status`, payload).then((r) => r.data),
  },
  customers: {
    list: (params) => api.get('/admin/customers', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/customers/${id}`).then((r) => r.data),
    updateStatus: (id, active) => api.patch(`/admin/customers/${id}/status`, { active }).then((r) => r.data),
  },
  featured: {
    get: () => api.get('/admin/featured').then((r) => r.data),
    update: (productIds) => api.put('/admin/featured', { productIds }).then((r) => r.data),
  },
  media: {
    list: () => api.get('/admin/media').then((r) => r.data),
  },
  settings: {
    get: () => api.get('/admin/settings').then((r) => r.data),
    update: (payload) => api.put('/admin/settings', payload).then((r) => r.data),
  },
};

export default api;
