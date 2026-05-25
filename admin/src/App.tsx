import React from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuestionsPage from './pages/QuestionsPage';
import MockTestsPage from './pages/MockTestsPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Shell({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>SSC Saathi · Admin</h1>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/questions" className={({ isActive }) => (isActive ? 'active' : '')}>
          Questions
        </NavLink>
        <NavLink to="/mock-tests" className={({ isActive }) => (isActive ? 'active' : '')}>
          Mock Tests
        </NavLink>
        <div style={{ marginTop: 24 }}>
          <button
            className="secondary"
            onClick={() => {
              localStorage.removeItem('admin_token');
              nav('/login', { replace: true });
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Shell>
              <DashboardPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/questions"
        element={
          <RequireAuth>
            <Shell>
              <QuestionsPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/mock-tests"
        element={
          <RequireAuth>
            <Shell>
              <MockTestsPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
