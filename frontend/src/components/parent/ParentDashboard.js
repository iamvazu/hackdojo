import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
`;

const AddChildButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background: #4caf50;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  transition: background 0.3s ease;
  
  &:hover {
    background: #43a047;
  }
`;

const ChildrenGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const ChildCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChildName = styled.h2`
  color: #333;
  margin-bottom: 1rem;
`;

const ProgressSection = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const Progress = styled.div`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: #2196f3;
  border-radius: 5px;
  transition: width 0.3s ease;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const Stat = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 5px;
  
  .number {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2196f3;
  }
  
  .label {
    font-size: 0.9rem;
    color: #666;
  }
`;

const ViewProgressButton = styled(Link)`
  display: block;
  text-align: center;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #2196f3;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #1976d2;
  }
`;

function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch children profiles');
      }

      const data = await response.json();
      setChildren(data.children);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardContainer>Loading...</DashboardContainer>;
  }

  if (error) {
    return <DashboardContainer>Error: {error}</DashboardContainer>;
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Parent Dashboard</Title>
        <AddChildButton to="/parent/add-child">Add Child</AddChildButton>
      </Header>

      <ChildrenGrid>
        {children.map(child => {
          const completedLessons = child.progress?.filter(p => p.completed)?.length || 0;
          const totalLessons = 20; // Update this based on your curriculum
          const progressPercentage = (completedLessons / totalLessons) * 100;

          return (
            <ChildCard key={child.id}>
              <ChildName>{child.name}</ChildName>
              <div>Age: {child.age}</div>
              <div>School: {child.school}</div>
              
              <ProgressSection>
                <h3>Learning Progress</h3>
                <ProgressBar>
                  <Progress $percentage={progressPercentage} />
                </ProgressBar>
                <div>{Math.round(progressPercentage)}% Complete</div>
              </ProgressSection>

              <Stats>
                <Stat>
                  <div className="number">{completedLessons}</div>
                  <div className="label">Lessons Completed</div>
                </Stat>
                <Stat>
                  <div className="number">{child.points || 0}</div>
                  <div className="label">Points Earned</div>
                </Stat>
              </Stats>

              <ViewProgressButton to={`/parent/child/${child.id}`}>
                View Details
              </ViewProgressButton>
            </ChildCard>
          );
        })}
      </ChildrenGrid>
    </DashboardContainer>
  );
}

export default ParentDashboard;
