import React, { useEffect, useState, useCallback } from 'react';
import { getEvents, deleteEvent } from '../services/api.js';
import Panel from '../components/Panel.jsx';

export default function Events() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEvents();
      setBanners(res.data || []);
      setError('');
    } catch (err) {
      setError('Lỗi tải Event Banners');
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa Banner này?')) return;
    try {
      await deleteEvent(id);
      alert('Xóa thành công!');
      loadBanners();
    } catch (err) {
      alert('Xóa thất bại');
      console.error(err);
    }
  };

  return (
    <Panel>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '2px solid #f3f4f6'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            Danh sách Event Banner
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Quản lý các sự kiện và banner quảng cáo
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn"
            onClick={loadBanners}
            style={{
              background: '#6b7280',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔄 Làm mới
          </button>
          <button
            className="btn"
            onClick={() => alert('Chức năng thêm mới đang phát triển')}
            style={{
              background: '#10b981',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ➕ Thêm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div style={{
          padding: '20px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>❌ {error}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Title</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Description</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Image</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>{b.id}</td>
                  <td style={{ padding: '16px', color: '#111827', fontSize: '14px', fontWeight: '500', maxWidth: '200px' }}>{b.title}</td>
                  <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', maxWidth: '300px' }}>
                    {b.description?.substring(0, 80)}...
                  </td>
                  <td style={{ padding: '16px' }}>
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      style={{
                        height: '60px',
                        width: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="btn"
                        onClick={() => alert('Chức năng sửa đang phát triển')}
                        style={{
                          background: '#3b82f6',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: '#ef4444',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                        onClick={() => handleDelete(b.id)}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
