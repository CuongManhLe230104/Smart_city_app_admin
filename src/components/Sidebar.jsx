import React from "react";

export default function Sidebar({ currentView, onChangeView }) {
  const menuItems = [
    { key: "dashboard", label: "🏠 Tổng quan" },
    { key: "users", label: "👥 Quản lý Users" },
    { key: "events", label: "📅 Quản lý Sự kiện" },
    { key: "feedbacks", label: "💬 Quản lý Feedback" },
    { key: "floodreports", label: "🌊 Quản lý Flood Report" },
    { key: "traveltours", label: "🗺️ Quản lý Tour Du Lịch" },
    { key: "bookings", label: "🎫 Quản lý Đơn đặt Tour" },
    { key: "settings", label: "⚙️ Cài đặt" }
  ];

  return (
    <aside className="sidebar">
      <div className="brand">SMARTCITY ADMIN</div>
      <div className="profile">
        <div className="avatar">AD</div>
        <div>
          <div style={{ fontWeight: 700 }}>Quản trị viên</div>
          <div className="small">khiem@example.com</div>
        </div>
      </div>

      <ul className="menu">
        {menuItems.map(item => (
          <li key={item.key}>
            <button
              className={currentView === item.key ? "active" : ""}
              onClick={() => onChangeView(item.key)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
        <div className="small" style={{ marginBottom: 8 }}>Kết nối API</div>
        <div className="muted">http://10.0.2.2:5000/api/</div>
      </div>
    </aside>
  );
}
