import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import BeltSystem from './BeltSystem';
import { fetchWithAuth } from '../utils/api';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: #1a1a1a;
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  color: #fff;
  margin-bottom: 10px;
  font-size: 2.5em;
`;

const Subtitle = styled.p`
  color: #aaa;
  font-size: 1.1em;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #fff;
`;

const ErrorContainer = styled.div`
  color: #ff6b6b;
  text-align: center;
  padding: 20px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  margin: 20px 0;
`;

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const initializeProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get existing progress
        const progressResponse = await fetchWithAuth('/api/progress');
        
        if (!progressResponse.ok) {
          if (progressResponse.status === 404) {
            // If no progress exists, create initial progress
            const initResponse = await fetchWithAuth('/api/progress/init', {
              method: 'POST'
            });
            
            if (!initResponse.ok) {
              throw new Error('Failed to initialize progress');
            }
            
            const initData = await initResponse.json();
            setProgress(initData);
          } else {
            throw new Error('Failed to fetch progress');
          }
        } else {
          const progressData = await progressResponse.json();
          setProgress(progressData);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeProgress();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>Loading your progress...</LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorContainer>
          <h2>Error</h2>
          <p>{error}</p>
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Welcome back, {user?.name || 'Student'}!</Title>
        <Subtitle>Continue your coding journey</Subtitle>
      </Header>
      
      <BeltSystem 
        progress={progress} 
        onLessonSelect={(day) => navigate(`/lesson/day${day}`)}
      />
    </DashboardContainer>
  );
};

export default StudentDashboard;
