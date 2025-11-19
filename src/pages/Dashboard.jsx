import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, getEvents, getFeedbacks, getFloodReports } from '../services/api.js';
import Panel from '../components/Panel.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, events: 0, feedbacks: 0, floodReports: 0 });
  const [loading, setLoading] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, feedbackRes, floodRes] = await Promise.all([
        getUsers(),
        getEvents(),
        getFeedbacks(),
        getFloodReports()
      ]);

      const usersCount = usersRes.data?.users?.length || usersRes.data?.length || 0;
      const eventsCount = eventsRes.data?.length || 0;
      const feedbacksCount = feedbackRes.data?.length || 0;
      const floodReportsCount = floodRes.data?.length || 0;

      const statusCount = {};
      (feedbackRes.data || []).forEach(f => {
        const s = f.status || 'Unknown';
        statusCount[s] = (statusCount[s] || 0) + 1;
      });

      setStats({ users: usersCount, events: eventsCount, feedbacks: feedbacksCount, floodReports: floodReportsCount });
      setFeedbackStatus(statusCount);
    } catch (err) {
      console.error(err);
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
            Tổng quan
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Xem tổng quan hệ thống SmartCity
          </p>
        </div>
        <button
          className="btn"
          onClick={loadStats}
          style={{
            background: '#3b82f6',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Làm mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <StatCard
              icon="👥"
              label="Tổng Users"
              value={stats.users}
              color="#3b82f6"
              bgColor="#dbeafe"
            />
            <StatCard
              icon="📢"
              label="Sự kiện"
              value={stats.events}
              color="#10b981"
              bgColor="#d1fae5"
            />
            <StatCard
              icon="💬"
              label="Feedback"
              value={stats.feedbacks}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
            <StatCard
              icon="🌊"
              label="Báo cáo ngập"
              value={stats.floodReports}
              color="#ef4444"
              bgColor="#fee2e2"
            />
          </div>

          {/* Activity Section */}
          <Panel>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#111827'
            }}>
              Hoạt động gần đây
            </h2>

            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <ActivityItem
                icon="👤"
                text="Người dùng A đăng ký"
                color="#3b82f6"
              />
              <ActivityItem
                icon="🎉"
                text="Sự kiện: Hội chợ ẩm thực được tạo"
                color="#10b981"
              />
              <ActivityItem
                icon="💬"
                text="Feedback: Phản ánh mới"
                color="#f59e0b"
              />
              <ActivityItem
                icon="🌊"
                text="Flood Report: Báo cáo ngập mới"
                color="#ef4444"
              />
            </div>
          </Panel>

          {/* Feedback Status */}
          {Object.keys(feedbackStatus).length > 0 && (
            <Panel>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#111827'
              }}>
                Trạng thái Feedback
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(feedbackStatus).map(([status, count]) => (
                  <StatusBadge key={status} status={status} count={count} />
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

// ✅ Stat Card Component
function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div style={{
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
      </div>
    </div>
  );
}

// ✅ Activity Item Component
function ActivityItem({ icon, text, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '8px',
      borderLeft: `3px solid ${color}`
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px'
      }}>
        {icon}
      </div>
      <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
        {text}
      </p>
    </div>
  );
}

// ✅ Status Badge Component
function StatusBadge({ status, count }) {
  const colors = {
    Pending: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
    Processing: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    Resolved: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    Rejected: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
  };

  const color = colors[status] || { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };

  return (
    <div style={{
      padding: '16px',
      background: color.bg,
      borderRadius: '8px',
      border: `2px solid ${color.border}`,
      textAlign: 'center'
    }}>
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
