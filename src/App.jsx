import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
// import Topbar from "./components/Topbar";
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Feedbacks from './pages/Feedbacks';
import FloodReports from './pages/FloodReports';
import TravelTours from './pages/TravelTours';
import Bookings from './pages/Bookings';

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  // const handleSearch = (query) => {
  //   console.log('Search:', query);
  // };

  // const handleRefresh = () => {
  //   console.log('Refresh triggered');
  //   setCurrentView(prev => prev);
  // };

  // ✅ Navigation handler
  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "users":
        return <Users />;
      case "events":
        return <Events />;
      case "feedbacks":
        return <Feedbacks />;
      case "floodreports":
        return <FloodReports />;
      case "traveltours":
        return <TravelTours />;
      case "bookings":
        return <Bookings />;
      default:
        return (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚧</div>
            <h2>Trang đang phát triển</h2>
            <p>View "{currentView}" chưa được triển khai</p>
          </div>
        );
    }
  };

  // const getPageTitle = () => {
  //   const titles = {
  //     dashboard: "📊 Tổng quan",
  //     users: "👥 Quản lý Users",
  //     events: "📢 Quản lý Sự kiện",
  //     feedbacks: "💬 Quản lý Feedback",
  //     floodreports: "🌊 Quản lý Báo cáo Ngập"
  //   };
  //   return titles[currentView] || currentView;
  // };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      <main className="main">
        {/* <Topbar
          pageTitle={getPageTitle()}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
        /> */}

        <div style={{
          padding: '24px',
          minHeight: 'calc(100vh - 80px)'
        }}>
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}