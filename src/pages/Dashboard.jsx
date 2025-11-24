import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, getFeedbacks, getFloodReports, getEventBanners } from '../services/api.js';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

// ✅ Helper functions
function formatTimeAgo(dateString) {
  if (!dateString) return 'Không rõ';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

function getStatusColor(status) {
  const colors = {
    'Pending': '#f59e0b',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Processing': '#3b82f6',
    'Resolved': '#10b981'
  };
  return colors[status] || '#6b7280';
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    feedbacks: 0,
    floodReports: 0,
    pendingFloodReports: 0,
    pendingFeedbacks: 0
  });

  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [floodStatus, setFloodStatus] = useState({});
  const [feedbackStatus, setFeedbackStatus] = useState({});

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, feedbackRes, floodRes] = await Promise.all([
        getUsers(),
        getEventBanners(),
        getFeedbacks(),
        getFloodReports()
      ]);

      const usersData = usersRes.data?.data?.users || usersRes.data?.users || usersRes.data?.data || usersRes.data || [];
      const usersCount = Array.isArray(usersData) ? usersData.length : 0;

      const eventsData = eventsRes.data?.data || eventsRes.data || [];
      const eventsCount = Array.isArray(eventsData) ? eventsData.length : 0;

      const feedbacksData = feedbackRes.data?.data || feedbackRes.data || [];
      const feedbacksCount = Array.isArray(feedbacksData) ? feedbacksData.length : 0;
      const pendingFeedbacks = feedbacksData.filter(f => f.status === 'Pending').length;

      const floodData = floodRes.data?.data || floodRes.data || [];
      const floodReportsCount = Array.isArray(floodData) ? floodData.length : 0;
      const pendingFloodReports = floodData.filter(f => f.status === 'Pending').length;

      const floodStatusCount = {};
      const feedbackStatusCount = {};

      floodData.forEach(f => {
        const s = f.status || 'Unknown';
        floodStatusCount[s] = (floodStatusCount[s] || 0) + 1;
      });

      feedbacksData.forEach(f => {
        const s = f.status || 'Unknown';
        feedbackStatusCount[s] = (feedbackStatusCount[s] || 0) + 1;
      });

      const activities = [];

      const recentFloods = [...floodData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(f => ({
          type: 'flood',
          icon: '🌊',
          text: `Báo cáo ngập: ${f.title}`,
          subtext: `${f.user?.fullName || f.user?.username || 'Ẩn danh'} - ${f.address || 'Không rõ địa điểm'}`,
          time: formatTimeAgo(f.createdAt),
          status: f.status,
          color: getStatusColor(f.status),
          id: f.id
        }));

      const recentFeedbacks = [...feedbacksData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(f => ({
          type: 'feedback',
          icon: '💬',
          text: `Feedback: ${f.title}`,
          subtext: `${f.user?.fullName || f.user?.username || 'Ẩn danh'} - ${f.category || 'General'}`,
          time: formatTimeAgo(f.createdAt),
          status: f.status,
          color: getStatusColor(f.status),
          id: f.id
        }));

      const recentUsers = [...usersData]
        .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
        .slice(0, 3)
        .map(u => ({
          type: 'user',
          icon: '👤',
          text: `User mới: ${u.fullName || u.username}`,
          subtext: u.email,
          time: formatTimeAgo(u.createdAt || u.created_at),
          color: '#3b82f6'
        }));

      activities.push(...recentFloods, ...recentFeedbacks, ...recentUsers);
      activities.sort((a, b) => {
        const timeA = a.time.includes('vừa xong') ? 0 :
          a.time.includes('phút') ? parseInt(a.time) :
            a.time.includes('giờ') ? parseInt(a.time) * 60 : 999;
        const timeB = b.time.includes('vừa xong') ? 0 :
          b.time.includes('phút') ? parseInt(b.time) :
            b.time.includes('giờ') ? parseInt(b.time) * 60 : 999;
        return timeA - timeB;
      });

      setStats({
        users: usersCount,
        events: eventsCount,
        feedbacks: feedbacksCount,
        floodReports: floodReportsCount,
        pendingFloodReports,
        pendingFeedbacks
      });

      setRecentActivities(activities.slice(0, 10));
      setFloodStatus(floodStatusCount);
      setFeedbackStatus(feedbackStatusCount);

    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827' }}>
            📊 Tổng quan
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Dashboard quản trị hệ thống SmartCity
          </p>
        </div>
        <button
          className="btn"
          onClick={loadStats}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#3b82f6',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳' : '🔄'} Làm mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ fontSize: '16px' }}>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Alert notifications */}
          {(stats.pendingFloodReports > 0 || stats.pendingFeedbacks > 0) && (
            <div style={{
              display: 'grid',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {stats.pendingFloodReports > 0 && (
                <AlertBanner
                  icon="🌊"
                  title="Có báo cáo ngập lụt cần duyệt"
                  message={`${stats.pendingFloodReports} báo cáo đang chờ xử lý`}
                  color="#ef4444"
                  bgColor="#fee2e2"
                  onClick={() => onNavigate && onNavigate('floodreports')}
                />
              )}

              {stats.pendingFeedbacks > 0 && (
                <AlertBanner
                  icon="💬"
                  title="Có feedback cần xử lý"
                  message={`${stats.pendingFeedbacks} phản ánh đang chờ xem xét`}
                  color="#f59e0b"
                  bgColor="#fef3c7"
                  onClick={() => onNavigate && onNavigate('feedbacks')}
                />
              )}
            </div>
          )}

          {/* ✅ FIX: Stats Grid - Căn giữa màn hình với max-width */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)', // ✅ Fix: 4 columns cố định
            gap: '20px',
            marginBottom: '32px',
            maxWidth: '1400px', // ✅ Giới hạn width tối đa
            margin: '0 auto 32px auto' // ✅ Căn giữa
          }}>
            <StatCard
              icon="👥"
              label="Tổng Users"
              value={stats.users}
              color="#3b82f6"
              bgColor="#dbeafe"
              onClick={() => onNavigate && onNavigate('users')}
            />
            <StatCard
              icon="📢"
              label="Sự kiện"
              value={stats.events}
              color="#10b981"
              bgColor="#d1fae5"
              onClick={() => onNavigate && onNavigate('events')}
            />
            <StatCard
              icon="💬"
              label="Feedback"
              value={stats.feedbacks}
              subValue={stats.pendingFeedbacks > 0 ? `${stats.pendingFeedbacks} chờ xử lý` : null}
              color="#f59e0b"
              bgColor="#fef3c7"
              onClick={() => onNavigate && onNavigate('feedbacks')}
            />
            <StatCard
              icon="🌊"
              label="Báo cáo ngập"
              value={stats.floodReports}
              subValue={stats.pendingFloodReports > 0 ? `${stats.pendingFloodReports} chờ duyệt` : null}
              color="#ef4444"
              bgColor="#fee2e2"
              onClick={() => onNavigate && onNavigate('floodreports')}
            />
          </div>

          {/* 2 Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', // ✅ 2 columns bằng nhau
            gap: '24px',
            marginBottom: '32px',
            maxWidth: '1400px',
            margin: '0 auto 32px auto'
          }}>
            {/* Recent Activities */}
            <Panel>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚡ Hoạt động gần đây
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  padding: '4px 8px',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '6px'
                }}>
                  {recentActivities.length}
                </span>
              </h2>

              {recentActivities.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p>Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '10px',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {recentActivities.map((activity, idx) => (
                    <ActivityItem key={idx} {...activity} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </Panel>

            {/* Flood Reports Status */}
            <Panel>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#111827'
              }}>
                🌊 Trạng thái báo cáo ngập
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                {Object.entries(floodStatus).map(([status, count]) => (
                  <StatusCard
                    key={status}
                    status={status}
                    count={count}
                    onClick={() => onNavigate && onNavigate('floodreports')}
                  />
                ))}
              </div>
            </Panel>
          </div>

          {/* Feedback Status */}
          <Panel style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#111827'
            }}>
              💬 Trạng thái Feedback
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(feedbackStatus).map(([status, count]) => (
                <StatusCard
                  key={status}
                  status={status}
                  count={count}
                  onClick={() => onNavigate && onNavigate('feedbacks')}
                />
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

// ✅ Components (giữ nguyên)
function AlertBanner({ icon, title, message, color, bgColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 20px',
        background: bgColor,
        border: `2px solid ${color}`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        maxWidth: '1400px',
        margin: '0 auto'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: color
        }}>
          {title}
        </p>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '14px',
          color: color,
          opacity: 0.8
        }}>
          {message}
        </p>
      </div>
      <div style={{
        fontSize: '20px',
        color: color
      }}>
        →
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color, bgColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {label}
        </p>
        <p style={{
          margin: '4px 0 0 0',
          fontSize: '32px',
          fontWeight: '700',
          color: color
        }}>
          {value}
        </p>
        {subValue && (
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#ef4444',
            fontWeight: '500'
          }}>
            ⚠️ {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ type, icon, text, subtext, time, status, color, onNavigate }) {
  return (
    <div
      onClick={() => {
        if (type === 'flood') onNavigate && onNavigate('floodreports');
        if (type === 'feedback') onNavigate && onNavigate('feedbacks');
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: '#f9fafb',
        borderRadius: '8px',
        borderLeft: `3px solid ${color}`,
        cursor: type !== 'user' ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (type !== 'user') {
          e.currentTarget.style.background = '#f3f4f6';
          e.currentTarget.style.transform = 'translateX(4px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f9fafb';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        border: '2px solid #e5e7eb'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          color: '#111827',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {text}
        </p>
        <p style={{
          margin: '2px 0 0 0',
          color: '#6b7280',
          fontSize: '12px'
        }}>
          {subtext}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        {status && (
          <div style={{ marginBottom: '4px' }}>
            <StatusBadge status={status} size="sm" />
          </div>
        )}
        <p style={{
          margin: 0,
          fontSize: '11px',
          color: '#9ca3af',
          fontWeight: '500'
        }}>
          {time}
        </p>
      </div>
    </div>
  );
}

function StatusCard({ status, count, onClick }) {
  const colors = {
    'Pending': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b', icon: '⏳' },
    'Approved': { bg: '#d1fae5', text: '#065f46', border: '#10b981', icon: '✅' },
    'Rejected': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444', icon: '❌' },
    'Processing': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6', icon: '🔄' },
    'Resolved': { bg: '#d1fae5', text: '#065f46', border: '#10b981', icon: '✓' }
  };

  const color = colors[status] || { bg: '#f3f4f6', text: '#374151', border: '#9ca3af', icon: '📋' };

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px',
        background: color.bg,
        borderRadius: '8px',
        border: `2px solid ${color.border}`,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color.border}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>
        {color.icon}
      </div>
      <p style={{
        margin: 0,
        fontSize: '28px',
        fontWeight: '700',
        color: color.text
      }}>
        {count}
      </p>
      <p style={{
        margin: '4px 0 0 0',
        fontSize: '14px',
        color: color.text,
        fontWeight: '500'
      }}>
        {status}
      </p>
    </div>
  );
}