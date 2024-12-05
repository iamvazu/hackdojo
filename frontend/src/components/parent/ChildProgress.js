import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled(Link)`
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const ChildInfo = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ChildName = styled.h1`
  color: #333;
  margin-bottom: 1rem;
`;

const BeltLevel = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${props => props.$color || '#f5f5f5'};
  color: ${props => props.$textColor || '#333'};
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const StatCard = styled.div`
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  
  .number {
    font-size: 2rem;
    font-weight: bold;
    color: #2196f3;
  }
  
  .label {
    color: #666;
    margin-top: 0.5rem;
  }
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
`;

const LessonList = styled.div`
  display: grid;
  gap: 1rem;
`;

const LessonCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${props => props.$completed ? '#e8f5e9' : '#fff'};
  border: 1px solid ${props => props.$completed ? '#a5d6a7' : '#e0e0e0'};
  border-radius: 5px;
  
  .lesson-info {
    flex: 1;
    
    h3 {
      margin: 0;
      color: #333;
    }
    
    .date {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  background: ${props => props.$completed ? '#4caf50' : '#fafafa'};
  color: ${props => props.$completed ? 'white' : '#666'};
`;

const getBeltColor = (belt) => {
  const colors = {
    white: { bg: '#f5f5f5', text: '#333' },
    yellow: { bg: '#fff59d', text: '#333' },
    orange: { bg: '#ffb74d', text: '#333' },
    green: { bg: '#81c784', text: '#fff' },
    blue: { bg: '#64b5f6', text: '#fff' },
    purple: { bg: '#9575cd', text: '#fff' },
    red: { bg: '#e57373', text: '#fff' },
    brown: { bg: '#8d6e63', text: '#fff' },
    black: { bg: '#424242', text: '#fff' }
  };
  return colors[belt.toLowerCase()] || colors.white;
};

function ChildProgress() {
  const { childId } = useParams();
  const { isParent, fetchChildProgress } = useAuth();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildData();
  }, [childId]);

  const loadChildData = async () => {
    try {
      const data = await fetchChildProgress(childId);
      setChildData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isParent) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  if (!childData) {
    return <Container>No data found for this child</Container>;
  }

  const beltColors = getBeltColor(childData.belt_level);

  return (
    <Container>
      <Header>
        <BackButton to="/parent/dashboard">← Back to Dashboard</BackButton>
      </Header>

      <ChildInfo>
        <ChildName>{childData.name}'s Progress</ChildName>
        <BeltLevel $color={beltColors.bg} $textColor={beltColors.text}>
          {childData.belt_level} Belt
        </BeltLevel>
        
        <Stats>
          <StatCard>
            <div className="number">{childData.completed_lessons || 0}</div>
            <div className="label">Lessons Completed</div>
          </StatCard>
          <StatCard>
            <div className="number">{childData.badges?.length || 0}</div>
            <div className="label">Badges Earned</div>
          </StatCard>
          <StatCard>
            <div className="number">{Math.round(childData.progress_percentage || 0)}%</div>
            <div className="label">Overall Progress</div>
          </StatCard>
        </Stats>
      </ChildInfo>

      <ProgressSection>
        <SectionTitle>Recent Progress</SectionTitle>
        <LessonList>
          {childData.progress?.map(progress => (
            <LessonCard key={progress.lesson_id} $completed={progress.completed}>
              <div className="lesson-info">
                <h3>Lesson {progress.lesson_id}</h3>
                <div className="date">
                  {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : 'Not completed'}
                </div>
              </div>
              <StatusBadge $completed={progress.completed}>
                {progress.completed ? `Score: ${progress.score}%` : 'In Progress'}
              </StatusBadge>
            </LessonCard>
          ))}
        </LessonList>
      </ProgressSection>
    </Container>
  );
}

export default ChildProgress;
