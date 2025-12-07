import React, { useEffect, useState, useCallback } from 'react';
import {
  getUsers,
  getFeedbacks,
  getFloodReports,
  getEventBanners,
  getBookings // ✅ Import getBookings
} from '../services/api.js';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

// Helper functions
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

// ✅ THÊM MÀU CHO BOOKING STATUS
function getStatusColor(status) {
  const colors = {
    'Pending': '#f59e0b',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Processing': '#3b82f6',
    'Resolved': '#10b981',
    'Confirmed': '#10b981', // ✅ Booking confirmed
    'Cancelled': '#ef4444', // ✅ Booking cancelled
    'Completed': '#6366f1'  // ✅ Booking completed
  };
  return colors[status] || '#6b7280';
}

function getChartColors(status) {
  const colors = {
    'Pending': '#f59e0b',
    'Approved': '#10b981',
    'Rejected': '#ef4444',
    'Processing': '#3b82f6',
    'Resolved': '#10b981',
    'Unknown': '#6b7280',
    'Confirmed': '#10b981', // ✅
    'Cancelled': '#ef4444', // ✅
    'Completed': '#6366f1'  // ✅
  };
  return colors[status] || '#6b7280';
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    feedbacks: 0,
    floodReports: 0,
    bookings: 0, // ✅ Thêm bookings
    pendingBookings: 0, // ✅ Booking chờ xác nhận
    pendingFloodReports: 0,
    pendingFeedbacks: 0
  });

  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [floodStatus, setFloodStatus] = useState({});
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [bookingStatus, setBookingStatus] = useState({}); // ✅ Thêm booking status
  const [recentEventBanners, setRecentEventBanners] = useState([]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, feedbackRes, floodRes, bookingsData] = await Promise.all([
        getUsers(),
        getEventBanners(),
        getFeedbacks(),
        getFloodReports(),
        getBookings() // ✅ Trả về array trực tiếp
      ]);

      const usersData = usersRes.data?.data?.users || usersRes.data?.users || usersRes.data?.data || usersRes.data || [];
      const usersCount = Array.isArray(usersData) ? usersData.length : 0;

      const eventsData = eventsRes.data?.data || eventsRes.data || [];
      const eventsCount = Array.isArray(eventsData) ? eventsData.length : 0;

      const latestBanners = [...eventsData]
        .sort((a, b) => (new Date(b.createdAt || b.Id) - new Date(a.createdAt || a.Id)))
        .slice(0, 3);

      const feedbacksData = feedbackRes.data?.data || feedbackRes.data || [];
      const feedbacksCount = Array.isArray(feedbacksData) ? feedbacksData.length : 0;
      const pendingFeedbacks = feedbacksData.filter(f => f.status === 'Pending').length;

      const floodData = floodRes.data?.data || floodRes.data || [];
      const floodReportsCount = Array.isArray(floodData) ? floodData.length : 0;
      const pendingFloodReports = floodData.filter(f => f.status === 'Pending').length;

      // ✅ BOOKINGS DATA - Đã là array
      console.log('📊 Bookings Data:', bookingsData);

      const bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : 0;
      const pendingBookings = Array.isArray(bookingsData)
        ? bookingsData.filter(b => b.status === 'Pending').length
        : 0;

      console.log('✅ Bookings Count:', bookingsCount);
      console.log('⏳ Pending Bookings:', pendingBookings);

      // ✅ COUNT BOOKING STATUS
      const bookingStatusCount = {};
      if (Array.isArray(bookingsData)) {
        bookingsData.forEach(b => {
          const s = b.status || 'Unknown';
          bookingStatusCount[s] = (bookingStatusCount[s] || 0) + 1;
        });
      }

      // ✅ ADD RECENT BOOKINGS TO ACTIVITIES
      const recentBookings = Array.isArray(bookingsData)
        ? [...bookingsData]
          .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
          .slice(0, 5)
          .map(b => ({
            type: 'booking',
            icon: '🎫',
            text: `Đặt tour: ${b.tour?.nameTour || `Tour #${b.tourId}`}`,
            subtext: `${b.user?.fullName || b.user?.email || 'Khách hàng'} - ${b.numberOfPeople} người - ${(b.totalPrice || 0).toLocaleString('vi-VN')}₫`,
            time: formatTimeAgo(b.bookingDate),
            status: b.status,
            color: getStatusColor(b.status),
            id: b.bookingId
          }))
        : [];

      console.log('✅ Recent Bookings:', recentBookings);

      const floodStatusCount = {};
      const feedbackStatusCount = {};
      // const bookingStatusCount = {}; // ✅ Booking status count

      floodData.forEach(f => {
        const s = f.status || 'Unknown';
        floodStatusCount[s] = (floodStatusCount[s] || 0) + 1;
      });

      feedbacksData.forEach(f => {
        const s = f.status || 'Unknown';
        feedbackStatusCount[s] = (feedbackStatusCount[s] || 0) + 1;
      });

      // ✅ COUNT BOOKING STATUS
      bookingsData.forEach(b => {
        const s = b.status || 'Unknown';
        bookingStatusCount[s] = (bookingStatusCount[s] || 0) + 1;
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

      // ✅ MERGE ALL ACTIVITIES
      activities.push(...recentFloods, ...recentFeedbacks, ...recentBookings, ...recentUsers);

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
        bookings: bookingsCount,
        pendingBookings,
        pendingFloodReports,
        pendingFeedbacks
      });

      setBookingStatus(bookingStatusCount);
      setRecentActivities(activities.slice(0, 10));
      setFloodStatus(floodStatusCount);
      setFeedbackStatus(feedbackStatusCount);
      // setBookingStatus(bookingStatusCount); // ✅
      setRecentEventBanners(latestBanners);

    } catch (err) {
      console.error('❌ Dashboard load error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div style={{
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      {/* ✅ HEADER - FIXED */}
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
            📊 Dashboard Tổng Quan
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6b7280',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            Quản lý và giám sát hệ thống SmartCity
          </p>
        </div>
        <button
          className="btn"
          onClick={loadStats}
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

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '100px 0',
          color: '#6b7280'
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
            Đang tải dữ liệu...
          </p>
        </div>
      ) : (
        <>
          {/* ✅ ALERT NOTIFICATIONS - THÊM BOOKING */}
          {(stats.pendingFloodReports > 0 || stats.pendingFeedbacks > 0 || stats.pendingBookings > 0) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {stats.pendingBookings > 0 && (
                <AlertBanner
                  icon="🎫"
                  title="Booking mới cần xác nhận"
                  message={`${stats.pendingBookings} đơn đặt tour đang chờ xác nhận`}
                  color="#3b82f6"
                  bgColor="#dbeafe"
                  onClick={() => onNavigate && onNavigate('bookings')}
                />
              )}

              {stats.pendingFloodReports > 0 && (
                <AlertBanner
                  icon="🚨"
                  title="Báo cáo ngập lụt cần xử lý"
                  message={`${stats.pendingFloodReports} báo cáo đang chờ duyệt`}
                  color="#ef4444"
                  bgColor="#fee2e2"
                  onClick={() => onNavigate && onNavigate('floodreports')}
                />
              )}

              {stats.pendingFeedbacks > 0 && (
                <AlertBanner
                  icon="⚡"
                  title="Feedback cần phản hồi"
                  message={`${stats.pendingFeedbacks} phản ánh đang chờ xem xét`}
                  color="#f59e0b"
                  bgColor="#fef3c7"
                  onClick={() => onNavigate && onNavigate('feedbacks')}
                />
              )}
            </div>
          )}

          {/* ✅ STATS GRID - THÊM BOOKING CARD */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <StatCard
              icon="👥"
              label="Người dùng"
              value={stats.users}
              color="#3b82f6"
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              onClick={() => onNavigate && onNavigate('users')}
            />

            {/* ✅ BOOKING CARD */}
            <StatCard
              icon="🎫"
              label="Đơn đặt tour"
              value={stats.bookings}
              subValue={stats.pendingBookings > 0 ? `${stats.pendingBookings} chờ xác nhận` : null}
              color="#3b82f6"
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              onClick={() => onNavigate && onNavigate('bookings')}
            />

            <StatCard
              icon="📢"
              label="Sự kiện"
              value={stats.events}
              color="#10b981"
              gradient="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
              onClick={() => onNavigate && onNavigate('events')}
            />

            <StatCard
              icon="💬"
              label="Feedback"
              value={stats.feedbacks}
              subValue={stats.pendingFeedbacks > 0 ? `${stats.pendingFeedbacks} chờ xử lý` : null}
              color="#f59e0b"
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              onClick={() => onNavigate && onNavigate('feedbacks')}
            />

            <StatCard
              icon="🌊"
              label="Báo cáo ngập"
              value={stats.floodReports}
              subValue={stats.pendingFloodReports > 0 ? `${stats.pendingFloodReports} chờ duyệt` : null}
              color="#ef4444"
              gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              onClick={() => onNavigate && onNavigate('floodreports')}
            />
          </div>

          {/* ✅ BỐ CỤC 2 CỘT */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY */}
            <Panel>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '20px',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '12px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '24px' }}>⚡</span>
                Hoạt động gần đây
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '4px 10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  marginLeft: 'auto'
                }}>
                  {recentActivities.length}
                </span>
              </h2>

              {recentActivities.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gap: '12px',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  {recentActivities.map((activity, idx) => (
                    <ActivityItem key={idx} {...activity} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </Panel>

            {/* ✅ CỘT PHẢI: BIỂU ĐỒ STATUS - THÊM BOOKING */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* ✅ Booking Status Chart */}
              <Panel>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '22px' }}>🎫</span>
                  Trạng thái Booking
                </h2>
                <StatusPieChart data={bookingStatus} />
              </Panel>

              {/* Flood Reports Status */}
              <Panel>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '22px' }}>🌊</span>
                  Trạng thái báo cáo ngập
                </h2>
                <StatusPieChart data={floodStatus} />
              </Panel>

              {/* Feedback Status */}
              <Panel>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <span style={{ fontSize: '22px' }}>💬</span>
                  Trạng thái Feedback
                </h2>
                <StatusPieChart data={feedbackStatus} />
              </Panel>
            </div>
          </div>

          {/* ✅ EVENT BANNERS - FULL WIDTH */}
          <Panel>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '24px' }}>🎉</span>
              Event Banners Gần Đây
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                padding: '4px 10px',
                background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                color: 'white',
                borderRadius: '12px',
                marginLeft: 'auto'
              }}>
                {recentEventBanners.length}/3
              </span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {recentEventBanners.length > 0 ? (
                recentEventBanners.map((banner) => (
                  <RecentEventBannerCard
                    key={banner.id || banner.Id}
                    banner={banner}
                    onClick={() => onNavigate && onNavigate('events')}
                  />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                  <p style={{ fontSize: '16px', fontWeight: '500' }}>Chưa có Event Banner nào</p>
                </div>
              )}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

// ✅ COMPONENTS

function AlertBanner({ icon, title, message, color, bgColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px 24px',
        background: bgColor,
        border: `2px solid ${color}`,
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 8px 20px ${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        fontSize: '40px',
        lineHeight: 1
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontSize: '17px',
          fontWeight: '700',
          color: color
        }}>
          {title}
        </p>
        <p style={{
          margin: '6px 0 0 0',
          fontSize: '14px',
          color: color,
          fontWeight: '500',
          opacity: 0.9
        }}>
          {message}
        </p>
      </div>
      <div style={{
        fontSize: '24px',
        color: color,
        fontWeight: '700'
      }}>
        --{'>'}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, gradient, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'all 0.3s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: gradient,
        opacity: 0.1,
        borderRadius: '0 16px 0 100%'
      }}></div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {label}
          </p>
          <p style={{
            margin: '6px 0 0 0',
            fontSize: '36px',
            fontWeight: '800',
            color: '#111827',
            lineHeight: 1
          }}>
            {value}
          </p>
        </div>
      </div>

      {subValue && (
        <div style={{
          padding: '8px 12px',
          background: '#fee2e2',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{
            fontSize: '13px',
            color: '#ef4444',
            fontWeight: '600'
          }}>
            {subValue}
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ type, icon, text, subtext, time, status, color, onNavigate }) {
  return (
    <div
      onClick={() => {
        if (type === 'flood') onNavigate && onNavigate('floodreports');
        if (type === 'feedback') onNavigate && onNavigate('feedbacks');
        if (type === 'booking') onNavigate && onNavigate('bookings'); // ✅
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        border: '2px solid #f3f4f6',
        borderLeft: `4px solid ${color}`,
        cursor: type !== 'user' ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={(e) => {
        if (type !== 'user') {
          e.currentTarget.style.background = '#f9fafb';
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        border: `2px solid ${color}30`,
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0,
          color: '#111827',
          fontSize: '14px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {text}
        </p>
        <p style={{
          margin: '4px 0 0 0',
          color: '#6b7280',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {subtext}
        </p>
      </div>
      <div style={{
        textAlign: 'right',
        flexShrink: 0
      }}>
        {status && (
          <div style={{ marginBottom: '6px' }}>
            <StatusBadge status={status} size="sm" />
          </div>
        )}
        <p style={{
          margin: 0,
          fontSize: '11px',
          color: '#9ca3af',
          fontWeight: '600'
        }}>
          {time}
        </p>
      </div>
    </div>
  );
}

function StatusPieChart({ data }) {
  const chartData = Object.entries(data)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: getChartColors(status),
    }))
    .filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        color: '#9ca3af',
        padding: '40px 20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
        <p style={{ fontSize: '14px', fontWeight: '500' }}>Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            style={{
              fontSize: '11px',
              fontWeight: '600'
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} báo cáo`, name]}
            contentStyle={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginTop: '16px'
      }}>
        {chartData.map((item) => (
          <div
            key={item.name}
            style={{
              padding: '12px',
              background: `${item.color}10`,
              borderRadius: '10px',
              border: `2px solid ${item.color}30`,
              textAlign: 'center'
            }}
          >
            <p style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: '700',
              color: item.color
            }}>
              {item.value}
            </p>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentEventBannerCard({ banner, onClick }) {
  const id = banner.id || banner.Id;
  const title = banner.title || banner.Title || 'Không có tiêu đề';
  const description = banner.description || banner.Description;
  const rawImageUrl = banner.imageUrl || banner.ImageUrl;

  // Convert relative URL to full URL
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/300x180?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: '2px solid #f3f4f6',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = '#f3f4f6';
      }}
    >
      <div style={{
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <img
          src={getImageUrl(rawImageUrl)}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.innerHTML = `
              <div style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
              ">
                🖼️
              </div>
            `;
          }}
        />
      </div>
      <div style={{ padding: '16px' }}>
        <p style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '700',
          color: '#111827',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {title}
        </p>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: '500',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {description || `Event ID: ${id}`}
        </p>
      </div>
    </div>
  );
}