import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import LessonView from './components/LessonView';
import ParentDashboard from './components/parent/ParentDashboard';
import AddChildForm from './components/parent/AddChildForm';
import ChildProgress from './components/parent/ChildProgress';
import LoginPage from './components/auth/LoginPage';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f7fa;
    color: #333;
    line-height: 1.6;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
`;

const Navigation = styled.nav`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled.a`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #2196f3;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196f3;
`;

function App() {
  const isAuthenticated = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <AppContainer>
        <GlobalStyle />
        <Navigation>
          <Logo>HackDojo</Logo>
          <NavLinks>
            {isAuthenticated ? (
              <>
                <NavLink href="/lesson">Lessons</NavLink>
                <NavLink href="/parent/dashboard">Dashboard</NavLink>
                <NavLink href="#" onClick={handleLogout}>Logout</NavLink>
              </>
            ) : (
              <NavLink href="/login">Login</NavLink>
            )}
          </NavLinks>
        </Navigation>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lesson" element={<LessonView />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/add-child" element={<AddChildForm />} />
          <Route path="/parent/child/:childId" element={<ChildProgress />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/lesson" : "/login"} replace />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
