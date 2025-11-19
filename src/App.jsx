import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import CardRow from "./components/CardRow";
import Panel from "./components/Panel";
//IMPORT CÁC TRANG 
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Feedback from './pages/Feedbacks';
import FloodReports from './pages/FloodReports';
import Feedbacks from "./pages/Feedbacks";
export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [usersCount, setUsersCount] = useState(null);
  const [eventsCount, setEventsCount] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  const loadCounts = async () => {
    try {
      /*const u = await fetch(`${API_BASE}/auth/count`).then(r => r.json());
      const e = await fetch(`${API_BASE}/events/count`).then(r => r.json());
      setUsersCount(u.count ?? "—");
      setEventsCount(e.count ?? "—");
      */  
      const statusResp = await fetch(API_BASE).then(r => ({ ok: r.ok, status: r.status })).catch(() => ({ ok: false, status: "X" }));
      setApiStatus(statusResp.ok ? `OK (${statusResp.status})` : "Offline");
    } catch {
      setUsersCount("—");
      setApiStatus("Error");
    }
  };

  const handleSearch = q => alert(`Tìm kiếm: ${q}`);
  const handleRefresh = () => loadCounts();

  useEffect(() => { loadCounts(); }, []);

  const renderMainContent = () => {
    switch(currentView) {
      case "dashboard": return <div style={{ padding: 12, color: "#6b7280" }}>Dashboard: thống kê nhanh và biểu đồ</div>;
      case "users": return <Users />;
      case "events": return <Events />;
      case "feedbacks": return <Feedbacks />;
      case "floodreports": return <FloodReports />;
      default: return null;
    }
  };

  return (
    <div className="app">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="main">
        <Topbar pageTitle={currentView === "dashboard" ? "Tổng quan" : currentView} onSearch={handleSearch} onRefresh={handleRefresh} />
        <CardRow usersCount={usersCount} eventsCount={eventsCount} apiStatus={apiStatus} />
        <div className="content">
          <Panel title="Danh sách chính" actions={<button className="btn">Thêm mới</button>}>{renderMainContent()}</Panel>
          <aside className="panel">
            <h3 style={{ marginTop: 0 }}>Hoạt động gần đây</h3>
            <ul style={{ paddingLeft: 16, color: "#6b7280" }}>
              <li>User: Nguyễn A đăng ký</li>
              <li>Event: Hội chợ ẩm thực được tạo</li>
              <li>Feedback: Phản ánh mới</li>
              <li>Flood Report: Báo cáo ngập mới</li>
            </ul>
            <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #f0f3f8" }} />
            <h4 style={{ margin: "0 0 8px 0" }}>Cài đặt nhanh</h4>
            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <label><input type="checkbox" /> Sử dụng dữ liệu mock</label>
              <label><input type="checkbox" /> Hiển thị ID trong bảng</label>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
