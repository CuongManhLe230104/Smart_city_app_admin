import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import logo from '../assets/VTSMARTCITY.png'; // 1. Import your logo

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { id: 'users', icon: '👥', label: 'Users', path: '/users', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { id: 'events', icon: '📢', label: 'Events', path: '/events', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', color: '#2ecc71' },
    { id: 'feedbacks', icon: '💬', label: 'Feedbacks', path: '/feedbacks', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f5576c' },
    { id: 'floodreports', icon: '🌊', label: 'Flood Reports', path: '/floodreports', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' },
    { id: 'traveltours', icon: '🗺️', label: 'Travel Tours', path: '/traveltours', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#00b894' },
    { id: 'bookings', icon: '🎫', label: 'Bookings', path: '/bookings', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0984e3' },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      authService.logout();
      navigate('/login', { replace: true });
    }
  };

  const currentUser = authService.getCurrentUser();

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      background: '#aed5e7ff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
      borderRight: '1px solid #f1f5f9',
      position: 'sticky',
      top: 0,
      left: 0,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: '#b8dbe9ff'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* 2. Add the Logo Image here */}
          <div>
            <img
              src={logo}
              alt="App Logo"
              style={{
                height: '40px',        // Adjust size as needed
                width: '40px',         // Adjust size as needed
                objectFit: 'contain',
                borderRadius: '8px',   // Optional: adds rounded corners
                // boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Optional: adds a subtle shadow
              }}
              onError={(e) => { e.target.style.display = 'none'; }} // Hide if image fails to load
            />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '800',
              color: '#1e293b',
              letterSpacing: '0.5px'
            }}>
              Vũng Tàu Smart City
            </h1>
          </div>
        </div>

        {/* User Info */}
        {currentUser && (
          <div style={{
            padding: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            marginTop: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : ''}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser.fullName}
                </p>
                <div style={{
                  marginTop: '4px',
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: '#dcfce7',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#15803d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <p style={{
          margin: '0 0 8px 12px',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          color: '#94a3b8',
          letterSpacing: '1px'
        }}>Menu</p>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                background: isActive ? 'linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%)' : 'transparent',
                border: isActive ? '1px solid #e2e8f0' : '1px solid transparent',
                borderRadius: '16px',
                color: isActive ? '#1e293b' : '#64748b',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#334155';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '15%',
                  bottom: '15%',
                  width: '4px',
                  background: item.gradient,
                  borderRadius: '0 4px 4px 0'
                }}></div>
              )}

              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: isActive ? item.gradient : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
                filter: isActive ? 'none' : 'grayscale(100%) opacity(0.7)',
                transition: 'all 0.2s'
              }}>
                {item.icon}
              </div>
              <span style={{ flex: 1 }}>{item.label}</span>

              {isActive && (
                <span style={{ fontSize: '10px', color: item.color }}>●</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={{ padding: '20px 16px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '16px',
            background: '#fff1f2',
            color: '#e11d48',
            border: '1px solid #fecdd3',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffe4e6';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(225, 29, 72, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f7c2c6ff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;