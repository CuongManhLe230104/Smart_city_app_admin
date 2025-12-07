// services/api.js
import axios from 'axios';

// Base URL của API
const API_BASE = 'http://localhost:5000/api';

// Tạo instance axios với baseURL (CHỈ CHO JSON)
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const transformImageUrl = (url) => {
  if (!url) return null;
  return url.replace('http://10.0.2.2:5000', 'http://localhost:5000');
};

const transformFloodReportData = (data) => {
  if (Array.isArray(data)) {
    return data.map(report => ({
      ...report,
      imageUrl: transformImageUrl(report.imageUrl)
    }));
  }
  return {
    ...data,
    imageUrl: transformImageUrl(data.imageUrl)
  };
};
api.interceptors.request.use(
  (config) => {
    // Giả sử bạn lưu token trong localStorage khi đăng nhập
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

  if (res.data?.data) {
    res.data.data = transformFloodReportData(res.data.data);
  }
  return res.data;
}

export async function reviewFloodReport(id, status, waterLevel = null, adminNote = '') {
  const body = { status, adminNote };

  if (status === 'Approved') {
    if (!waterLevel) {
      throw new Error('Vui lòng đánh giá mức độ ngập (waterLevel) trước khi duyệt!');
    }
    body.waterLevel = waterLevel;
  }

  const res = await api.put(`/floodreports/admin/${id}/review`, body);
  return res.data;
}

export const deleteFloodReport = (id) => api.delete(`/floodreports/admin/${id}`);

export const updateFloodReport = (id, data) => api.put(`/floodreports/admin/${id}`, data);

// ========== FEEDBACKS ==========

export async function getFeedbacks(status = '') {
  const params = status ? { status } : {};
  const res = await api.get('/feedback/admin/all', { params });
  return res.data;
}

export const deleteFeedback = (id) => api.delete(`/feedback/admin/${id}`);

export const updateFeedback = (id, data) => api.put(`/feedback/admin/${id}`, data);

export async function reviewFeedback(id, status, adminResponse = '') {
  const res = await api.put(`/feedback/admin/${id}/respond`, {
    status,
    response: adminResponse
  });
  return res.data;
}

// ========== EVENTS ==========

export const getEventBanners = () => api.get('/EventBanners');

export const getEventById = (id) => api.get(`/EventBanners/${id}`);

export const createEvent = (data) => api.post('/EventBanners', data);

export const updateEvent = (id, data) => api.put(`/EventBanners/${id}`, data);

export const deleteEvent = (id) => api.delete(`/EventBanners/${id}`);

export const deleteMultipleEvents = (ids) =>
  api.post('/EventBanners/delete-multiple', { ids });

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const uploadEventBanner = async (file) => {
  console.log('📤 Uploading event banner:', file.name);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `${API_BASE}/Upload/event-banner`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader(),
        },
      }
    );

    console.log('✅ Upload response:', response.data);

    if (response.data.success && response.data.url) {
      return response.data.url;
    } else {
      throw new Error(response.data.message || 'Upload thất bại');
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

// ========== USERS ==========

export const getUsers = () => api.get('/auth/users');

// ========== AI FLOOD IMAGE ANALYSIS ==========

export const analyzeFloodImageAI = (floodReportId) => {
  return api.post(`/aifloodanalysis/analyze/${floodReportId}`);
};

// ========== TRAVEL TOURS (TOUR) ==========

export async function getTours() {
  const res = await api.get('/TravelTour');

  if (res.data) {
    res.data = res.data.map(tour => ({
      ...tour,
      coverImageUrl: transformImageUrl(tour.coverImageUrl),
    }));
  }
  return res.data;
}

// ✅ CREATE TOUR - KHÔNG DÙNG AXIOS INSTANCE (để tránh Content-Type conflict)
export async function createTour(formData) {
  try {
    console.log('📤 Creating tour with FormData...');

    // ✅ LOG FormData entries để debug
    console.log('📋 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    // ✅ KHÔNG DÙNG api instance, dùng axios trực tiếp
    const response = await axios.post(
      `${API_BASE}/TravelTour`,
      formData,
      {
        headers: {
          // ✅ KHÔNG SET Content-Type, để browser tự động set với boundary
          ...getAuthHeader(),
        },
      }
    );

    console.log('✅ Tour created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Create tour error:', error.response?.data);
    throw new Error(error.response?.data?.message || error.message || 'Lỗi tạo tour');
  }
}

// ✅ UPDATE TOUR - KHÔNG DÙNG AXIOS INSTANCE
export async function updateTour(id, formData) {
  try {
    console.log(`📝 Updating tour ID ${id} with FormData...`);

    // ✅ LOG FormData entries
    console.log('📋 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    // ✅ KHÔNG DÙNG api instance
    const response = await axios.put(
      `${API_BASE}/TravelTour/${id}`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          // ✅ KHÔNG SET Content-Type
        },
      }
    );

    console.log('✅ Tour updated:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Update tour ${id} error:`, error.response?.data);
    throw new Error(error.response?.data?.message || error.message || 'Lỗi cập nhật tour');
  }
}

// ✅ DELETE TOUR - CÓ THỂ DÙNG api instance (không có body)
export async function deleteTour(id) {
  const res = await api.delete(`/TravelTour/${id}`);
  return res.data;
}

// ========== BOOKINGS ==========

export const getBookings = async () => {
  try {
    console.log('📥 Fetching all bookings...');
    const response = await api.get('/Booking/all-admin');
    console.log('✅ Response:', response.data);

    // ✅ PARSE DATA - Trả về array thay vì response object
    const data = response.data?.data || response.data || [];
    console.log('✅ Bookings data:', data);

    return data; // ✅ Trả về array
  } catch (error) {
    console.error('❌ Get bookings error:', error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật Trạng thái Booking (PUT /api/Booking/{id})
// Điều chỉnh để khớp với endpoint [HttpPut("{id}")] đa năng ở Backend
export async function updateBookingStatus(id, newStatus) {
  // URL chỉ còn /Booking/{id}
  const res = await api.put(`/Booking/${id}`, { status: newStatus });
  return res.data;
}

// Hàm cập nhật trạng thái đặc biệt cho Hủy (PUT /api/Booking/{id}/cancel)
export async function cancelBooking(id) {
  // Endpoint backend chỉ cần PUT không body
  const res = await api.put(`/Booking/${id}/cancel`, {});
  return res.data;
}

export default api;
