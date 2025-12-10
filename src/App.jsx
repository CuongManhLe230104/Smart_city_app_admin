import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Feedbacks from './pages/Feedbacks';
import FloodReports from './pages/FloodReports';
import TravelTours from './pages/TravelTours';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import ProtectedRoute from '../utils/ProtectedRoute';
import './styles/style.css';

// ✅ Layout component
const MainLayout = ({ children }) => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <div style={{
          padding: '32px',
          minHeight: '100vh',
          maxWidth: '1800px',
          margin: '0 auto'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [, setCurrentView] = useState("dashboard");

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard onNavigate={handleNavigate} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Events />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedbacks"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Feedbacks />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/floodreports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <FloodReports />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/traveltours"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TravelTours />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Bookings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}