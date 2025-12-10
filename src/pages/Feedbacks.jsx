import React, { useEffect, useState, useCallback } from 'react';
import {
  getFeedbacks,
  reviewFeedback,
  deleteFeedback,
  updateFeedback
} from '../services/api.js';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFeedbacks(status);
      setFeedbacks(res.data || []);
      setError('');
    } catch (err) {
      setError('Lỗi tải Feedbacks');
      console.error(err);
    }
    setLoading(false);
  }, [status]);

  const openReviewModal = (feedback, newStatus) => {
    setSelectedFeedback(feedback);
    setReviewStatus(newStatus);
    setAdminResponse(feedback.adminResponse || '');
    setShowModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      await reviewFeedback(
        selectedFeedback.id,
        reviewStatus,
        adminResponse
      );

      alert('Cập nhật thành công!');
      setShowModal(false);
      loadFeedbacks();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  // ✅ THÊM: Handle Delete
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('⚠️ Bạn có chắc muốn xóa phản ánh này?\n\nHành động này không thể hoàn tác!')) {
      return;
    }

    try {
      await deleteFeedback(id);
      alert('✅ Đã xóa phản ánh thành công!');
      setShowModal(false);
      loadFeedbacks();
    } catch (err) {
      alert(`❌ Lỗi xóa phản ánh: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  // ✅ THÊM: Handle Edit
  const handleEditFeedback = () => {
    setIsEditing(true);
    setEditFormData({
      title: selectedFeedback.title || '',
      description: selectedFeedback.description || '',
      category: selectedFeedback.category || '',
      adminResponse: selectedFeedback.adminResponse || ''
    });
  };

  // ✅ THÊM: Handle Submit Edit
  const handleSubmitEdit = async () => {
    try {
      await updateFeedback(selectedFeedback.id, editFormData);
      alert('✅ Cập nhật phản ánh thành công!');
      setIsEditing(false);
      setShowModal(false);
      loadFeedbacks();
    } catch (err) {
      alert(`❌ Lỗi cập nhật: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  };

  useEffect(() => {
    loadFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Panel>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2>💬 Danh sách Feedback</h2>
          <button className="btn" onClick={loadFeedbacks}>Làm mới</button>
        </div>

        <label>
          Lọc trạng thái:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          >
            <option value="">Tất cả</option>
            <option value="Pending">Chờ xử lý</option>
            <option value="Processing">Đang xử lý</option>
            <option value="Resolved">Đã giải quyết</option>
            <option value="Rejected">Từ chối</option>
          </select>
        </label>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Đang tải...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th>Người gửi</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.title}</td>
                    <td>{f.description?.substring(0, 50)}...</td>
                    <td>{f.category || '-'}</td>
                    <td>
                      <StatusBadge status={f.status} size="sm" />
                    </td>
                    <td>{f.user?.fullName || f.user?.username || '-'}</td>
                    <td>{new Date(f.createdAt).toLocaleDateString('vi-VN')}</td>

                    {/* ✅ THÊM: Action buttons */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {f.status === 'Pending' && (
                          <>
                            <button
                              className="btn"
                              onClick={() => openReviewModal(f, 'Processing')}
                              style={{
                                background: '#3b82f6',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              🔄 Tiếp nhận
                            </button>
                            <button
                              className="btn"
                              onClick={() => openReviewModal(f, 'Rejected')}
                              style={{
                                background: '#ef4444',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              ❌ Từ chối
                            </button>
                          </>
                        )}

                        {f.status === 'Processing' && (
                          <button
                            className="btn"
                            onClick={() => openReviewModal(f, 'Resolved')}
                            style={{
                              background: '#10b981',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ✅ Giải quyết
                          </button>
                        )}

                        {(f.status === 'Resolved' || f.status === 'Rejected') && (
                          <button
                            className="btn"
                            onClick={() => openReviewModal(f, f.status)}
                            style={{
                              background: '#6b7280',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            👁️ Chi tiết
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal xử lý feedback */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            minWidth: '500px',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#111827' }}>
              {isEditing ? '✏️ Chỉnh sửa phản ánh' :
                reviewStatus === 'Processing' ? '✅ Xác nhận tiếp nhận phản ánh' :
                  reviewStatus === 'Resolved' ? '✅ Giải quyết phản ánh' :
                    '❌ Từ chối phản ánh'}
            </h3>

            {/* ✅ THÊM: Edit Form */}
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Tiêu đề:
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Mô tả:
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Danh mục:
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Infrastructure">Cơ sở hạ tầng</option>
                    <option value="Traffic">Giao thông</option>
                    <option value="Environment">Môi trường</option>
                    <option value="Security">An ninh</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Phản hồi admin:
                  </label>
                  <textarea
                    value={editFormData.adminResponse}
                    onChange={(e) => setEditFormData({ ...editFormData, adminResponse: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="btn"
                    onClick={() => setIsEditing(false)}
                    style={{ background: '#6b7280', padding: '10px 20px' }}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn"
                    onClick={handleSubmitEdit}
                    style={{ background: '#10b981', padding: '10px 20px' }}
                  >
                    💾 Lưu thay đổi
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Thông tin feedback */}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#374151' }}>ID:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>{selectedFeedback?.id}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#374151' }}>Tiêu đề:</strong>{' '}
                    <span style={{ color: '#111827' }}>{selectedFeedback?.title}</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#374151' }}>Danh mục:</strong>{' '}
                    <span style={{
                      padding: '2px 8px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {selectedFeedback?.category}
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#374151' }}>Nội dung:</strong>
                    <p style={{
                      whiteSpace: 'pre-wrap',
                      marginTop: '8px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      color: '#111827',
                      lineHeight: '1.6'
                    }}>
                      {selectedFeedback?.description}
                    </p>
                  </div>

                  {/* ✅ THÊM: Hiển thị ảnh */}
                  {selectedFeedback?.imageUrl && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#374151' }}>Hình ảnh:</strong>
                      <div style={{ marginTop: '8px' }}>
                        <img
                          src={
                            selectedFeedback.imageUrl.startsWith('http')
                              ? selectedFeedback.imageUrl
                              : `http://localhost:5000${selectedFeedback.imageUrl}`
                          }
                          alt="Feedback"
                          style={{
                            width: '100%',
                            maxHeight: '400px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                          onError={(e) => {
                            console.error('❌ Image load error:', selectedFeedback.imageUrl);
                            console.error('   Tried URL:', e.target.src);

                            // ✅ THÊM: Show fallback
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div style="
                                padding: 40px;
                                background: #fee2e2;
                                border: 2px dashed #ef4444;
                                border-radius: 8px;
                                text-align: center;
                                color: #991b1b;
                              ">
                                <p style="margin: 0; font-weight: 600;">❌ Không thể tải ảnh</p>
                                <p style="margin: 8px 0 0; font-size: 12px; color: #dc2626;">
                                  URL: ${selectedFeedback.imageUrl}
                                </p>
                              </div>
                            `;
                          }}
                          onLoad={(e) => {
                            console.log('✅ Image loaded:', e.target.src);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <strong style={{ color: '#374151' }}>Người gửi:</strong>{' '}
                    <span style={{ color: '#6b7280' }}>
                      {selectedFeedback?.user?.fullName || selectedFeedback?.user?.email}
                    </span>
                  </div>
                </div>

                {/* Phản hồi admin */}
                <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>
                    <strong style={{ color: '#374151' }}>
                      Phản hồi của admin: <span style={{ color: '#ef4444' }}>*</span>
                    </strong>
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder={
                      reviewStatus === 'Processing'
                        ? 'VD: Chúng tôi đã ghi nhận phản ánh và sẽ xử lý trong 7 ngày tới. Cảm ơn bạn!'
                        : reviewStatus === 'Resolved'
                          ? 'VD: Vấn đề đã được khắc phục. Cảm ơn bạn đã góp ý!'
                          : 'VD: Phản ánh không hợp lệ vì...'
                    }
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      resize: 'vertical',
                      lineHeight: '1.5'
                    }}
                    required
                  />
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    💡 {reviewStatus === 'Processing' && 'Thông báo cho người dùng rằng bạn đang xử lý'}
                    {reviewStatus === 'Resolved' && 'Giải thích cách bạn đã giải quyết vấn đề'}
                    {reviewStatus === 'Rejected' && 'Nêu rõ lý do từ chối'}
                  </p>
                </div>

                {/* ✅ THÊM: Edit/Delete buttons */}
                {(selectedFeedback?.status === 'Resolved' || selectedFeedback?.status === 'Rejected') && (
                  <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '2px solid #f3f4f6'
                  }}>
                    <button
                      className="btn"
                      onClick={handleEditFeedback}
                      style={{
                        flex: 1,
                        background: '#3b82f6',
                        padding: '12px',
                        fontWeight: '500'
                      }}
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                      style={{
                        flex: 1,
                        background: '#ef4444',
                        padding: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{
                  marginTop: '24px',
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button
                    className="btn"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: '#6b7280',
                      padding: '10px 20px',
                      fontWeight: '500'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn"
                    onClick={handleSubmitReview}
                    disabled={!adminResponse.trim()}
                    style={{
                      background: reviewStatus === 'Processing' ? '#3b82f6' :
                        reviewStatus === 'Resolved' ? '#10b981' : '#ef4444',
                      padding: '10px 20px',
                      fontWeight: '500',
                      opacity: !adminResponse.trim() ? 0.5 : 1,
                      cursor: !adminResponse.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {reviewStatus === 'Processing' && '✅ Xác nhận tiếp nhận'}
                    {reviewStatus === 'Resolved' && '✅ Xác nhận giải quyết'}
                    {reviewStatus === 'Rejected' && '❌ Xác nhận từ chối'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}