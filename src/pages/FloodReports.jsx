import React, { useEffect, useState, useCallback } from 'react';
import { getFloodReports, reviewFloodReport } from '../services/api.js';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function FloodReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [waterLevel, setWaterLevel] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFloodReports(status);
      setReports(res.data || []);
      setError('');
    } catch (err) {
      setError('Lỗi tải báo cáo');
      console.error(err);
    }
    setLoading(false);
  }, [status]);

  const openReviewModal = (report, newStatus) => {
    setSelectedReport(report);
    setReviewStatus(newStatus);
    setWaterLevel(report.waterLevel || ''); // ✅ Pre-fill waterLevel nếu có
    setAdminNote(report.adminNote || ''); // ✅ Pre-fill adminNote nếu có
    setShowModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      if (reviewStatus === 'Approved' && !waterLevel) {
        alert('Vui lòng chọn mức độ ngập trước khi duyệt!');
        return;
      }

      await reviewFloodReport(
        selectedReport.id,
        reviewStatus,
        reviewStatus === 'Approved' ? waterLevel : null,
        adminNote
      );

      alert('Cập nhật thành công!');
      setShowModal(false);
      loadReports();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <>
      <Panel>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2>Quản lý báo cáo ngập lụt</h2>
          <button className="btn" onClick={loadReports}>Làm mới</button>
        </div>

        <label>
          Filter trạng thái:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
          >
            <option value="">Tất cả</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
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
                  <th>Địa chỉ</th> {/* ✅ THÊM: Cột địa chỉ */}
                  <th>Mức độ ngập</th>
                  <th>Trạng thái</th>
                  <th>Người báo</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.title}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.address || '-'}
                    </td>
                    {/* ✅ SỬ DỤNG StatusBadge */}
                    <td>
                      <StatusBadge status={r.waterLevel || 'Unknown'} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td>{r.user?.fullName || r.user?.username || '-'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {/* ...existing buttons... */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Modal review */}
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
              {reviewStatus === 'Approved' && selectedReport?.status === 'Approved' && '✅ Chi tiết báo cáo đã duyệt'}
              {reviewStatus === 'Rejected' && selectedReport?.status === 'Rejected' && '❌ Chi tiết báo cáo đã từ chối'}
              {reviewStatus === 'Approved' && selectedReport?.status === 'Pending' && '✅ Duyệt báo cáo'}
              {reviewStatus === 'Rejected' && selectedReport?.status === 'Pending' && '❌ Từ chối báo cáo'}
            </h3>

            {/* ✅ THÊM: Thông tin chi tiết báo cáo */}
            <div style={{
              marginBottom: '16px',
              padding: '16px',
              background: '#f3f4f6',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#374151' }}>ID:</strong>{' '}
                <span style={{ color: '#6b7280' }}>{selectedReport?.id}</span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#374151' }}>Tiêu đề:</strong>{' '}
                <span style={{ color: '#111827' }}>{selectedReport?.title}</span>
              </div>
              {/* ✅ THÊM: Hiển thị địa chỉ trong modal */}
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#374151' }}>📍 Địa chỉ:</strong>
                <p style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '6px',
                  color: '#111827',
                  lineHeight: '1.6',
                  border: '1px solid #e5e7eb'
                }}>
                  {selectedReport?.address || 'Không có thông tin địa chỉ'}
                </p>
              </div>
              {/* ✅ THÊM: Tọa độ */}
              {selectedReport?.latitude && selectedReport?.longitude && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#374151' }}>🗺️ Tọa độ:</strong>{' '}
                  <span style={{
                    fontFamily: 'monospace',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}>
                    {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginLeft: '8px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontSize: '12px'
                    }}
                  >
                    🔗 Xem trên Google Maps
                  </a>
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#374151' }}>Mô tả:</strong>
                <p style={{
                  whiteSpace: 'pre-wrap',
                  marginTop: '8px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '6px',
                  color: '#111827',
                  lineHeight: '1.6'
                }}>
                  {selectedReport?.description}
                </p>
              </div>
              {/* ✅ THÊM: Hiển thị ảnh nếu có */}
              {selectedReport?.imageUrl && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#374151' }}>📷 Ảnh hiện trường:</strong>
                  <img
                    src={selectedReport.imageUrl}
                    alt="Ảnh ngập lụt"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      maxHeight: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              <div>
                <strong style={{ color: '#374151' }}>Người báo:</strong>{' '}
                <span style={{ color: '#6b7280' }}>
                  {selectedReport?.user?.fullName || selectedReport?.user?.email || 'Ẩn danh'}
                </span>
              </div>
            </div>

            {/* Form duyệt/từ chối */}
            {selectedReport?.status === 'Pending' && (
              <>
                {reviewStatus === 'Approved' && (
                  <div style={{ marginTop: '16px' }}>
                    <label>
                      <strong style={{ color: '#374151' }}>Mức độ ngập: <span style={{ color: '#ef4444' }}>*</span></strong>
                      <select
                        value={waterLevel}
                        onChange={(e) => setWaterLevel(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '8px',
                          borderRadius: '6px',
                          border: '1px solid #ccc'
                        }}
                        required
                      >
                        <option value="">-- Chọn mức độ ngập --</option>
                        <option value="Low">🟢 Thấp (Low) - Dưới 20cm</option>
                        <option value="Medium">🟡 Trung bình (Medium) - 20-40cm</option>
                        <option value="High">🔴 Cao (High) - Trên 40cm</option>
                      </select>
                    </label>
                  </div>
                )}

                <div style={{ marginTop: '16px' }}>
                  <label>
                    <strong style={{ color: '#374151' }}>Ghi chú admin:</strong>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập ghi chú (tùy chọn)..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </label>
                </div>
              </>
            )}

            {/* ✅ THÊM: Hiển thị thông tin đã duyệt */}
            {(selectedReport?.status === 'Approved' || selectedReport?.status === 'Rejected') && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: selectedReport.status === 'Approved' ? '#d1fae5' : '#fee2e2',
                borderRadius: '8px',
                border: `1px solid ${selectedReport.status === 'Approved' ? '#10b981' : '#ef4444'}`
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Trạng thái:</strong>{' '}
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: selectedReport.status === 'Approved' ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {selectedReport.status === 'Approved' ? '✅ Đã duyệt' : '❌ Đã từ chối'}
                  </span>
                </div>
                {selectedReport.waterLevel && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Mức độ ngập:</strong>{' '}
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: selectedReport.waterLevel === 'High' ? '#ef4444' :
                        selectedReport.waterLevel === 'Medium' ? '#f59e0b' : '#10b981',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {selectedReport.waterLevel === 'High' && '🔴 Cao'}
                      {selectedReport.waterLevel === 'Medium' && '🟡 Trung bình'}
                      {selectedReport.waterLevel === 'Low' && '🟢 Thấp'}
                    </span>
                  </div>
                )}
                {selectedReport.adminNote && (
                  <div>
                    <strong>Ghi chú admin:</strong>
                    <p style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '6px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {selectedReport.adminNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{
              marginTop: '20px',
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                className="btn"
                onClick={() => setShowModal(false)}
                style={{ background: '#6b7280', padding: '10px 20px' }}
              >
                {selectedReport?.status === 'Pending' ? 'Hủy' : 'Đóng'}
              </button>
              {selectedReport?.status === 'Pending' && (
                <button
                  className="btn"
                  onClick={handleSubmitReview}
                  style={{
                    background: reviewStatus === 'Approved' ? '#10b981' : '#ef4444',
                    padding: '10px 20px'
                  }}
                >
                  Xác nhận
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
