import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from './auth/AuthContext';

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

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
`;

const ChildCard = styled(Card)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  
  div {
    height: 100%;
    background: #4CAF50;
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const ActivityList = styled.div`
  max-height: 300px;
  overflow-y: auto;
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
  
  .success {
    color: #4CAF50;
  }
  
  .timestamp {
    color: #666;
    font-size: 0.9em;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9em;
  background: ${props => props.color || '#4CAF50'};
  color: white;
`;

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const { user } = useAuth();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    // Fetch children data
    fetch('http://localhost:5000/api/parent/children', {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        setChildren(data.children);
        if (data.children.length > 0) {
          setSelectedChild(data.children[0]);
          fetchChildActivity(data.children[0].id);
        }
      })
      .catch(err => console.error('Error fetching children:', err));
  }, []);

  const fetchChildActivity = (childId) => {
    fetch(`http://localhost:5000/api/parent/child/${childId}/recent-activity`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => setRecentActivity(data.recent_activity))
      .catch(err => console.error('Error fetching activity:', err));
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <h1>Parent Dashboard</h1>
        <p>Track your children's progress in their coding journey</p>
      </Header>

      {children.map(child => (
        <ChildCard key={child.id} onClick={() => {
          setSelectedChild(child);
          fetchChildActivity(child.id);
        }}>
          <div>
            <h3>{child.name}</h3>
            <p>{child.email}</p>
          </div>
          
          <div>
            <Badge color="#2196F3">{child.current_belt} Belt</Badge>
            <p>{child.completed_lessons} lessons completed</p>
          </div>
          
          <ProgressBar progress={(child.completed_lessons / 30) * 100}>
            <div />
          </ProgressBar>
        </ChildCard>
      ))}

      {selectedChild && (
        <Card>
          <h3>Recent Activity - {selectedChild.name}</h3>
          <ActivityList>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <div>
                  <span className={activity.success ? 'success' : ''}>
                    {activity.lesson}
                  </span>
                </div>
                <span className="timestamp">
                  {formatDate(activity.timestamp)}
                </span>
              </ActivityItem>
            ))}
          </ActivityList>
        </Card>
      )}
    </Container>
  );
};

export default ParentDashboard;
