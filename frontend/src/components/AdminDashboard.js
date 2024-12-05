import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from './auth/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    color: #333;
    margin-bottom: 0.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background: #f5f5f5;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#4CAF50'};
  color: white;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.active ? '#4CAF50' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    // Fetch analytics data
    fetch('http://localhost:5000/api/admin/analytics', {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching analytics:', err));

    // Fetch users data
    fetch('http://localhost:5000/api/admin/users', {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => setUsers(data.users))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  const handleUserUpdate = async (userId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      // Refresh users list
      const updatedUsers = await fetch('http://localhost:5000/api/admin/users', {
        headers: getAuthHeaders()
      }).then(res => res.json());
      
      setUsers(updatedUsers.users);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const renderAnalytics = () => (
    <>
      <Grid>
        <Card>
          <h3>User Statistics</h3>
          {analytics && (
            <>
              <p>Total Users: {analytics.user_stats.total_users}</p>
              <p>Active Students: {analytics.user_stats.students}</p>
              <p>Active Parents: {analytics.user_stats.parents}</p>
            </>
          )}
        </Card>
        
        <Card>
          <h3>Activity Overview</h3>
          {analytics && (
            <p>Activities in last 30 days: {analytics.activity.last_30_days}</p>
          )}
        </Card>
        
        <Card>
          <h3>Belt Distribution</h3>
          {analytics?.completion?.belt_distribution && (
            <ul>
              {Object.entries(analytics.completion.belt_distribution).map(([belt, count]) => (
                <li key={belt}>{belt} Belt: {count} students</li>
              ))}
            </ul>
          )}
        </Card>
      </Grid>
    </>
  );

  const renderUsers = () => (
    <Card>
      <h3>User Management</h3>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Belt</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.current_belt}</td>
              <td>{user.active ? 'Active' : 'Inactive'}</td>
              <td>
                <Button onClick={() => handleUserUpdate(user.id, { active: !user.active })}>
                  {user.active ? 'Deactivate' : 'Activate'}
                </Button>
                {user.role !== 'admin' && (
                  <Button onClick={() => handleUserUpdate(user.id, { role: 'admin' })}>
                    Make Admin
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );

  return (
    <Container>
      <Header>
        <h1>Admin Dashboard</h1>
      </Header>

      <TabContainer>
        <TabButtons>
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </TabButton>
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </TabButton>
        </TabButtons>

        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'users' && renderUsers()}
      </TabContainer>
    </Container>
  );
};

export default AdminDashboard;
