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
  getCategories: (config = {}) => api.get('/categories', config).then((res) => res.data),
  getProducts: (params, config = {}) => api.get('/products', { params, ...config }).then((res) => res.data),
  getBrands: (config = {}) => api.get('/products/brands/list', config).then((res) => res.data),
  getSuggestions: (q, config = {}) => api.get('/products/suggestions/list', { params: { q }, ...config }).then((res) => res.data),
  getProductBySlug: (slug, config = {}) => api.get(`/products/${slug}`, config).then((res) => res.data),
};

export const cartService = {
  validate: (items) => api.post('/cart/validate', { items }).then((res) => res.data),
};

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((res) => res.data),
  uploadAvatar: (file) => { const fd = new FormData(); fd.append('avatar', file); return api.post('/auth/me/avatar', fd).then((res) => res.data); },
  changePassword: (payload) => api.patch('/auth/me/password', payload).then((res) => res.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((res) => res.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((res) => res.data),
};

export const accountService = {
  overview: () => api.get('/account/overview').then((res) => res.data),
  rootAccess: () => api.get('/account/root-access').then((res) => res.data),
  achievements: () => api.get('/account/achievements').then((res) => res.data),
  wishlist: () => api.get('/account/wishlist').then((res) => res.data),
  syncWishlist: (productIds) => api.post('/account/wishlist/sync', { productIds }).then((res) => res.data),
  addWishlist: (productId) => api.post(`/account/wishlist/${productId}`).then((res) => res.data),
  removeWishlist: (productId) => api.delete(`/account/wishlist/${productId}`).then((res) => res.data),
  recentlyViewed: () => api.get('/account/recently-viewed').then((res) => res.data),
  addRecentlyViewed: (productId) => api.post('/account/recently-viewed', { productId }).then((res) => res.data),
  removeRecentlyViewed: (productId) => api.delete(`/account/recently-viewed/${productId}`).then((res) => res.data),
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

export const rootAccessService = {
  getPublic: () => api.get('/root-access').then((res) => res.data),
  request: (payload) => api.post('/root-access/request', payload).then((res) => res.data),
};

export const journalService = {
  list: (params, config = {}) => api.get('/journal', { params, ...config }).then((res) => res.data),
  categories: (config = {}) => api.get('/journal/categories/list', config).then((res) => res.data),
  recent: (limit = 3, config = {}) => api.get('/journal/recent/list', { params: { limit }, ...config }).then((res) => res.data),
  related: (params, config = {}) => api.get('/journal/related/list', { params, ...config }).then((res) => res.data),
  getBySlug: (slug, config = {}) => api.get(`/journal/${encodeURIComponent(slug)}`, config).then((res) => res.data),
};

export const communityService = {
  listPosts: (params, config = {}) => api.get('/community/posts', { params, ...config }).then((r) => r.data),
  getPost: (slug, config = {}) => api.get(`/community/posts/${encodeURIComponent(slug)}`, config).then((r) => r.data),
  createPost: (formData) => api.post('/community/posts', formData).then((r) => r.data),
  updatePost: (slug, formData) => api.patch(`/community/posts/${encodeURIComponent(slug)}`, formData).then((r) => r.data),
  removePost: (slug) => api.delete(`/community/posts/${encodeURIComponent(slug)}`).then((r) => r.data),
  listComments: (slug, params, config = {}) => api.get(`/community/posts/${encodeURIComponent(slug)}/comments`, { params, ...config }).then((r) => r.data),
  addComment: (slug, body) => api.post(`/community/posts/${encodeURIComponent(slug)}/comments`, { body }).then((r) => r.data),
  removeComment: (commentId) => api.delete(`/community/comments/${commentId}`).then((r) => r.data),
  toggleLike: (slug) => api.post(`/community/posts/${encodeURIComponent(slug)}/like`).then((r) => r.data),
  toggleSave: (slug) => api.post(`/community/posts/${encodeURIComponent(slug)}/save`).then((r) => r.data),
  listSaved: (params, config = {}) => api.get('/community/saved/me', { params, ...config }).then((r) => r.data),
  report: (payload) => api.post('/community/reports', payload).then((r) => r.data),
  getProfile: (username, params, config = {}) => api.get(`/community/users/${encodeURIComponent(username)}`, { params, ...config }).then((r) => r.data),
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
  rootAccess: {
    list: () => api.get('/admin/root-access/subscriptions').then((r) => r.data),
    updateStatus: (id, status) => api.patch(`/admin/root-access/subscriptions/${id}/status`, { status }).then((r) => r.data),
  },
  journal: {
    list: (params) => api.get('/admin/journal', { params }).then((r) => r.data),
    get: (id) => api.get(`/admin/journal/${id}`).then((r) => r.data),
    create: (payload) => api.post('/admin/journal', payload).then((r) => r.data),
    update: (id, payload) => api.put(`/admin/journal/${id}`, payload).then((r) => r.data),
    remove: (id) => api.delete(`/admin/journal/${id}`),
    updateStatus: (id, status) => api.patch(`/admin/journal/${id}/status`, { status }).then((r) => r.data),
    uploadCover: (id, file) => { const fd = new FormData(); fd.append('cover', file); return api.post(`/admin/journal/${id}/cover`, fd).then((r) => r.data); },
  },
  community: {
    listPosts: (params) => api.get('/admin/community/posts', { params }).then((r) => r.data),
    updatePostStatus: (id, payload) => api.patch(`/admin/community/posts/${id}/status`, payload).then((r) => r.data),
    listComments: (params) => api.get('/admin/community/comments', { params }).then((r) => r.data),
    updateCommentStatus: (id, payload) => api.patch(`/admin/community/comments/${id}/status`, payload).then((r) => r.data),
    listReports: (params) => api.get('/admin/community/reports', { params }).then((r) => r.data),
    updateReport: (id, payload) => api.patch(`/admin/community/reports/${id}`, payload).then((r) => r.data),
  },
};

export default api;
