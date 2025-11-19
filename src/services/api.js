// services/api.js
import axios from 'axios';

// Base URL của API
const API_BASE = 'http://localhost:5000/api';

// Tạo instance axios với baseURL
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor để handle error globally (tùy chọn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

// ========== FLOOD REPORTS ==========

export async function getFloodReports(status = '') {
  const params = status ? { status } : {};
  const res = await api.get('/floodreports/admin/all', { params });
  return res.data;
}

// ✅ SỬA: Thêm waterLevel parameter
export async function reviewFloodReport(id, status, waterLevel = null, adminNote = '') {
  const body = { status, adminNote };

  // ✅ Nếu duyệt (Approved), bắt buộc phải có waterLevel
  if (status === 'Approved') {
    if (!waterLevel) {
      throw new Error('Vui lòng đánh giá mức độ ngập (waterLevel) trước khi duyệt!');
    }
    body.waterLevel = waterLevel;
  }

  const res = await api.put(`/floodreports/admin/${id}/review`, body);
  return res.data;
}

// ========== FEEDBACKS ==========

export async function getFeedbacks(status = '') {
  const params = status ? { status } : {};
  const res = await api.get('/feedback/admin/all', { params });
  return res.data;
}

// ✅ SỬA: Đổi parameter từ adminNote → adminResponse
export async function reviewFeedback(id, status, adminResponse = '') {
  const res = await api.put(`/feedback/admin/${id}/respond`, { // ✅ THAY ĐỔI: respond
    status,
    response: adminResponse
  });
  return res.data;
}

// ========== EVENTS ==========

export const getEventBanners = () => api.get('/EventBanners');

// ✅ THÊM: Alias export để tương thích
export { getEventBanners as getEvents };

export async function createEvent(data) {
  const res = await api.post('/EventBanners', data);
  return res.data;
}

export async function deleteEvent(id) {
  const res = await api.delete(`/EventBanners/${id}`);
  return res.data;
}

// ========== USERS ==========

export const getUsers = () => api.get('/auth/users');

export default api;
