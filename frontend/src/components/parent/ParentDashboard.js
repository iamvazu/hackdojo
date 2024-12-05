import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';

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

const BeltLevel = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${props => props.$color || '#f5f5f5'};
  color: ${props => props.$textColor || '#333'};
  border-radius: 5px;
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

function ParentDashboard() {
  const { user, isParent, fetchChildren } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const childrenData = await fetchChildren();
      setChildren(childrenData || []);
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

      {children.length === 0 ? (
        <div>
          <p>You haven't added any children yet.</p>
          <p>Click the "Add Child" button to get started!</p>
        </div>
      ) : (
        <ChildrenGrid>
          {children.map(child => {
            const beltColors = getBeltColor(child.belt_level);

            return (
              <ChildCard key={child.id}>
                <ChildName>{child.name}</ChildName>
                <BeltLevel $color={beltColors.bg} $textColor={beltColors.text}>
                  {child.belt_level} Belt
                </BeltLevel>
                
                <ProgressSection>
                  <h3>Learning Progress</h3>
                  <ProgressBar>
                    <Progress $percentage={child.progress_percentage || 0} />
                  </ProgressBar>
                  <div>{Math.round(child.progress_percentage || 0)}% Complete</div>
                </ProgressSection>

                <Stats>
                  <Stat>
                    <div className="number">{child.completed_lessons || 0}</div>
                    <div className="label">Lessons Completed</div>
                  </Stat>
                  <Stat>
                    <div className="number">{child.badges?.length || 0}</div>
                    <div className="label">Badges Earned</div>
                  </Stat>
                </Stats>

                <ViewProgressButton to={`/parent/child/${child.id}`}>
                  View Details
                </ViewProgressButton>
              </ChildCard>
            );
          })}
        </ChildrenGrid>
      )}
    </DashboardContainer>
  );
}

export default ParentDashboard;
