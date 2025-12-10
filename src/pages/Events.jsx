import React, { useEffect, useState, useCallback } from 'react';
import { getEventBanners, deleteEvent, deleteMultipleEvents, createEvent, updateEvent } from '../services/api.js';
import Panel from '../components/Panel.jsx';
import Modal from '../components/Modal.jsx';
import EventBannerForm from '../components/EventBannerForm.jsx';
import '../styles/Events.css';
import '../services/api.js';

export default function Events() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewMode] = useState('table'); // 'table' or 'grid'

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEventBanners();
      setBanners(res.data || []);
      setError('');
    } catch (err) {
      setError('Lỗi tải Event Banners');
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa Banner này?')) return;
    try {
      await deleteEvent(id);
      alert('✅ Xóa thành công!');
      loadBanners();
    } catch (err) {
      alert('❌ Xóa thất bại: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.size === 0) {
      alert('Vui lòng chọn ít nhất 1 banner');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.size} banner?`)) return;

    try {
      await deleteMultipleEvents(Array.from(selectedIds));
      alert(`✅ Đã xóa ${selectedIds.size} banner`);
      setSelectedIds(new Set());
      loadBanners();
    } catch (err) {
      alert('❌ Xóa thất bại: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === banners.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(banners.map(b => b.id)));
    }
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingBanner) {
        // Update
        await updateEvent(editingBanner.id, formData);
        alert('✅ Cập nhật banner thành công!');
      } else {
        // Create
        await createEvent(formData);
        alert('✅ Tạo banner thành công!');
      }
      handleCloseModal();
      loadBanners();
    } catch (err) {
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  // ✅ SỬA: Helper tạo full URL
  const getFullImageUrl = (url) => {
    if (!url) {
      console.warn('⚠️ Empty URL');
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('✅ Already full URL:', url);
      return url;
    }

    // ✅ Tạo full URL từ relative path
    const fullUrl = `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
    console.log('🔗 Converted URL:', url, '→', fullUrl);
    return fullUrl;
  };

  return (
    <Panel>
      {/* Header */}
      <div className="events-header">
        <div>
          <h2 className="events-title">📢 Danh sách Event Banner</h2>
          <p className="events-subtitle">
            Quản lý các sự kiện và banner quảng cáo
            {selectedIds.size > 0 && (
              <span className="selected-count"> - Đã chọn: {selectedIds.size}</span>
            )}
          </p>
        </div>
        <div className="events-actions">
          {selectedIds.size > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteMultiple}
            >
              🗑️ Xóa đã chọn ({selectedIds.size})
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={loadBanners}
          >
            🔄 Làm mới
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenAddModal}
          >
            ➕ Thêm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-icon">⏳</div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>❌ {error}</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Chưa có banner nào</p>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            ➕ Tạo banner đầu tiên
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="banners-grid">
          {banners.map(banner => {
            const imageUrl = getFullImageUrl(banner.imageUrl);
            console.log(`🖼️ Banner ${banner.id} image:`, imageUrl);

            return (
              <div
                key={banner.id}
                className={`banner-card ${selectedIds.has(banner.id) ? 'selected' : ''}`}
              >
                {/* Checkbox */}
                <div className="card-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(banner.id)}
                    onChange={() => handleToggleSelect(banner.id)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>

                {/* Image */}
                <div className="card-image">
                  <img
                    src={imageUrl}
                    alt={banner.title}
                    onLoad={() => console.log(`✅ Image loaded: ${imageUrl}`)}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', imageUrl);
                      console.error('   Banner data:', banner);
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="Arial" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="image-overlay">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleOpenEditModal(banner)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(banner.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="card-content">
                  <div className="card-title">{banner.title}</div>
                  <div className="card-description">
                    {banner.description?.substring(0, 80)}{banner.description?.length > 80 ? '...' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === banners.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ width: '80px' }}>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th style={{ width: '150px' }}>Description</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => {
                const imageUrl = getFullImageUrl(banner.imageUrl);
                return (
                  <tr
                    key={banner.id}
                    className={selectedIds.has(banner.id) ? 'selected' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(banner.id)}
                        onChange={() => handleToggleSelect(banner.id)}
                      />
                    </td>
                    <td className="id-cell">#{banner.id}</td>
                    <td>
                      <img
                        src={imageUrl}
                        alt={banner.title}
                        className="table-thumbnail"
                        onLoad={() => console.log(`✅ Table image loaded: ${imageUrl}`)}
                        onError={(e) => {
                          console.error('❌ Table image failed:', imageUrl);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="90"%3E%3Crect width="160" height="90" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </td>
                    <td className="title-cell">
                      <strong>{banner.title}</strong>
                    </td>
                    <td className="description-cell">
                      {banner.description?.substring(0, 120)}
                      {banner.description?.length > 120 ? '...' : ''}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleOpenEditModal(banner)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(banner.id)}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
        width="700px"
      >
        <EventBannerForm
          banner={editingBanner}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </Panel>
  );
}