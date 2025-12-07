import React, { useEffect, useState, useCallback } from 'react';
import { getUsers } from '../services/api.js';
import Panel from '../components/Panel.jsx';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsers();
      const userData = res.data?.data?.users || res.data?.users || res.data?.data || res.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      setError('Không thể tải dữ liệu người dùng. Vui lòng thử lại!');
      console.error('Error loading users:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter & Sort
  const filteredUsers = users
    .filter(u =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneNumber?.includes(search)
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      {/* ✅ HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            👥 Quản lý người dùng
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6b7280',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            {loading ? 'Đang tải...' : `Tổng số: ${users.length} người dùng | Hiển thị: ${filteredUsers.length}`}
          </p>
        </div>
        <button
          className="btn"
          onClick={loadUsers}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s'
          }}
        >
          {loading ? '⏳' : '🔄'} {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* ✅ SEARCH & FILTER BAR */}
      <Panel>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: '#000000ff'
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo email, tên hoặc số điện thoại..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 50px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.3s',
                fontWeight: '500'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '14px 16px',
              fontSize: '14px',
              fontWeight: '600',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              minWidth: '180px'
            }}
          >
            <option value="createdAt">📅 Ngày tạo</option>
            <option value="email">📧 Email</option>
            <option value="fullName">👤 Họ tên</option>
          </select>
        </div>

        {/* ✅ TABLE */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#000000ff'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              ⏳
            </div>
            <p style={{
              fontSize: '18px',
              fontWeight: '500'
            }}>
              Đang tải dữ liệu người dùng...
            </p>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fee2e2',
            borderRadius: '16px',
            border: '2px solid #ef4444'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              ❌
            </div>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ef4444',
              margin: 0
            }}>
              {error}
            </p>
            <button
              className="btn"
              onClick={loadUsers}
              style={{
                marginTop: '20px',
                background: '#ef4444',
                padding: '10px 20px'
              }}
            >
              🔄 Thử lại
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#9ca3af'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>
              🔍
            </div>
            <p style={{
              fontSize: '18px',
              fontWeight: '500'
            }}>
              {search ? `Không tìm thấy người dùng với từ khóa "${search}"` : 'Chưa có người dùng nào'}
            </p>
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '2px solid #e5e7eb'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    color: '#000000ff',
                    letterSpacing: '0.5px'
                  }}>
                    ID
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      color: '#000000ff',
                      userSelect: 'none'
                    }}
                  >
                    📧 Email {getSortIcon('email')}
                  </th>
                  <th
                    onClick={() => handleSort('fullName')}
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      color: '#000000ff',
                      userSelect: 'none'
                    }}
                  >
                    👤 Họ tên {getSortIcon('fullName')}
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    color: '#000000ff',
                    letterSpacing: '0.5px'
                  }}>
                    📱 Số điện thoại
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      color: '#000000ff',
                      userSelect: 'none'
                    }}
                  >
                    📅 Ngày tạo {getSortIcon('createdAt')}
                  </th>
                  <th style={{
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    color: '#000000ff',
                    letterSpacing: '0.5px'
                  }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.id}
                    style={{
                      background: idx % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.transform = 'scale(1.01)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#f9fafb';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <td style={{
                      padding: '16px',
                      fontWeight: '600',
                      color: '#000000ff',
                      fontSize: '14px'
                    }}>
                      #{u.id}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '700',
                          flexShrink: 0
                        }}>
                          {u.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span>{u.email || '-'}</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      fontWeight: '600',
                      color: '#000000ff',
                      fontSize: '14px'
                    }}>
                      {u.fullName || (
                        <span style={{ color: '#000000ff', fontStyle: 'italic' }}>Chưa cập nhật</span>
                      )}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontWeight: '500',
                      color: '#000000ff',
                      fontSize: '14px'
                    }}>
                      {u.phoneNumber || (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chưa có</span>
                      )}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontWeight: '500',
                      color: '#000000ff',
                      fontSize: '13px'
                    }}>
                      {new Date(u.createdAt).toLocaleString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        👁️ Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ✅ USER DETAIL MODAL */}
      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '20px',
              minWidth: '500px',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              👤 Chi tiết người dùng
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <UserDetailRow label="ID" value={`#${selectedUser.id}`} />
              <UserDetailRow label="📧 Email" value={selectedUser.email} />
              <UserDetailRow label="👤 Họ tên" value={selectedUser.fullName || 'Chưa cập nhật'} />
              <UserDetailRow label="📱 Số điện thoại" value={selectedUser.phoneNumber || 'Chưa có'} />
              <UserDetailRow
                label="📅 Ngày tạo"
                value={new Date(selectedUser.createdAt).toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              />
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#6b7280';
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ✅ CSS ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function UserDetailRow({ label, value }) {
  return (
    <div style={{
      padding: '16px',
      background: '#f9fafb',
      borderRadius: '12px',
      border: '2px solid #e5e7eb'
    }}>
      <p style={{
        margin: 0,
        fontSize: '12px',
        fontWeight: '700',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '8px'
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
        wordBreak: 'break-word'
      }}>
        {value}
      </p>
    </div>
  );
}