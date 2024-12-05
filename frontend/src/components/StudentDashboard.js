import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './auth/AuthContext';
import api from '../services/api';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    color: #333;
    margin-bottom: 0.5rem;
  }
  p {
    color: #666;
  }
`;

const BeltDisplay = styled.div`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  text-align: center;
`;

const BeltBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  background: ${props => props.color || '#4CAF50'};
  color: white;
  font-weight: bold;
  margin: 1rem 0;
`;

const BeltSystem = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const BeltCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 5px solid ${props => props.color};
  cursor: ${props => props.isAvailable ? 'pointer' : 'default'};
  opacity: ${props => props.isAvailable ? 1 : 0.7};
  
  h3 {
    color: ${props => props.color};
    margin: 0 0 1rem 0;
  }
  
  p {
    margin: 0;
    color: #666;
  }
  
  &:hover {
    transform: ${props => props.isAvailable ? 'translateY(-5px)' : 'none'};
    transition: transform 0.2s;
  }
`;

const ProgressIndicator = styled.div`
  margin-top: 1rem;
  
  .progress-text {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.9em;
    color: #666;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
  
  div {
    height: 100%;
    background: #4CAF50;
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const RecentActivity = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ActivityItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StudentDashboard = () => {
  const [curriculum, setCurriculum] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [curriculumData, progressData] = await Promise.all([
          api.getCurriculum(),
          api.getStudentProgress()
        ]);
        setCurriculum(curriculumData);
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const handleBeltClick = (belt) => {
    if (belt.isAvailable) {
      navigate(`/student/lesson/${belt.startDay}`);
    }
  };

  const renderBelts = () => {
    if (!curriculum?.belts || !userProgress) return null;

    const currentDay = userProgress.current_day || 1;
    
    return curriculum.belts.map(belt => {
      const isAvailable = currentDay >= belt.startDay;
      const progress = Math.min(100, Math.max(0, 
        ((currentDay - belt.startDay) / (belt.endDay - belt.startDay + 1)) * 100
      ));

      return (
        <BeltCard 
          key={belt.name}
          color={belt.color}
          isAvailable={isAvailable}
          onClick={() => handleBeltClick({ ...belt, isAvailable })}
        >
          <h3>{belt.name}</h3>
          <p>{belt.description}</p>
          <ProgressIndicator>
            <div className="progress-text">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar progress={progress}>
              <div />
            </ProgressBar>
          </ProgressIndicator>
        </BeltCard>
      );
    });
  };

  return (
    <Container>
      <Header>
        <h1>Welcome back, {user?.name || 'Student'}!</h1>
        <p>Continue your Python journey</p>
      </Header>

      {userProgress && (
        <BeltDisplay>
          <h2>Current Belt Level</h2>
          <BeltBadge color={userProgress.belt_color || '#4CAF50'}>
            {userProgress.current_belt} Belt
          </BeltBadge>
          <p>{userProgress.completed_lessons} lessons completed</p>
        </BeltDisplay>
      )}

      <h2>Python Belt System</h2>
      <BeltSystem>
        {renderBelts()}
      </BeltSystem>

      <RecentActivity>
        <h2>Recent Activity</h2>
        {userProgress?.recent_activity?.map((activity, index) => (
          <ActivityItem key={index}>
            <span>{activity.lesson}</span>
            <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
          </ActivityItem>
        ))}
      </RecentActivity>
    </Container>
  );
};

export default StudentDashboard;
