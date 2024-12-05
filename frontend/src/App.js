import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import LoginPage from './components/auth/LoginPage';
import LessonView from './components/LessonView';
import ParentDashboard from './components/ParentDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ChildProgress from './components/parent/ChildProgress';
import UserManagement from './components/admin/UserManagement';
import BeltSystem from './components/BeltSystem';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: #1e1e1e;
    color: #fff;
    line-height: 1.5;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const ProtectedRoute = ({ element: Element, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'parent':
        return <Navigate to="/parent" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Element />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContainer>
          <GlobalStyle />
          <Navbar />
          <MainContent>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Student Routes */}
              <Route
                path="/student"
                element={<ProtectedRoute element={StudentDashboard} allowedRoles={['student']} />}
              />
              <Route
                path="/student/lesson/:day"
                element={<ProtectedRoute element={LessonView} allowedRoles={['student']} />}
              />

              {/* Parent Routes */}
              <Route
                path="/parent"
                element={<ProtectedRoute element={ParentDashboard} allowedRoles={['parent']} />}
              />
              <Route
                path="/parent/child/:childId"
                element={<ProtectedRoute element={ChildProgress} allowedRoles={['parent']} />}
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<ProtectedRoute element={AdminDashboard} allowedRoles={['admin']} />}
              />
              <Route
                path="/admin/users"
                element={<ProtectedRoute element={UserManagement} allowedRoles={['admin']} />}
              />

              {/* Default Route */}
              <Route
                path="/"
                element={<Navigate to="/login" replace />}
              />
            </Routes>
          </MainContent>
          <Footer />
        </AppContainer>
      </AuthProvider>
    </Router>
  );
}

export default App;
