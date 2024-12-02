import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';

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

const AchievementsSection = styled.div`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const AchievementCard = styled.div`
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  
  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .title {
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .description {
    color: #666;
    font-size: 0.9rem;
  }
  
  .date {
    color: #999;
    font-size: 0.8rem;
    margin-top: 1rem;
  }
`;

function ChildProgress() {
  const { childId } = useParams();
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const fetchChildData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/child/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch child data');
      }

      const data = await response.json();
      setChildData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return <Container>Error: {error}</Container>;
  }

  if (!childData) {
    return <Container>No data found for this child</Container>;
  }

  const completedLessons = childData.progress?.filter(p => p.completed)?.length || 0;
  const totalLessons = 20; // Update based on your curriculum

  return (
    <Container>
      <Header>
        <BackButton to="/parent/dashboard">← Back to Dashboard</BackButton>
      </Header>

      <ChildInfo>
        <ChildName>{childData.name}'s Progress</ChildName>
        <div>Age: {childData.age}</div>
        <div>School: {childData.school}</div>
        
        <Stats>
          <StatCard>
            <div className="number">{completedLessons}</div>
            <div className="label">Lessons Completed</div>
          </StatCard>
          <StatCard>
            <div className="number">{childData.points || 0}</div>
            <div className="label">Points Earned</div>
          </StatCard>
          <StatCard>
            <div className="number">{Math.round((completedLessons / totalLessons) * 100)}%</div>
            <div className="label">Overall Progress</div>
          </StatCard>
        </Stats>
      </ChildInfo>

      <ProgressSection>
        <SectionTitle>Recent Lessons</SectionTitle>
        <LessonList>
          {childData.progress?.map(lesson => (
            <LessonCard key={lesson.id} $completed={lesson.completed}>
              <div className="lesson-info">
                <h3>{lesson.title}</h3>
                <div className="date">
                  {new Date(lesson.lastAttempt).toLocaleDateString()}
                </div>
              </div>
              <StatusBadge $completed={lesson.completed}>
                {lesson.completed ? 'Completed' : 'In Progress'}
              </StatusBadge>
            </LessonCard>
          ))}
        </LessonList>
      </ProgressSection>

      <AchievementsSection>
        <SectionTitle>Achievements</SectionTitle>
        <AchievementGrid>
          {childData.achievements?.map(achievement => (
            <AchievementCard key={achievement.id}>
              <div className="icon">🏆</div>
              <div className="title">{achievement.title}</div>
              <div className="description">{achievement.description}</div>
              <div className="date">
                Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
              </div>
            </AchievementCard>
          ))}
        </AchievementGrid>
      </AchievementsSection>
    </Container>
  );
}

export default ChildProgress;
