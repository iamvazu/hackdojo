import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LessonView from '../components/LessonView';
import SenseiHelp from '../components/SenseiHelp';
import styled from 'styled-components';

const LessonPage = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // Fetch user's progress
  const fetchProgress = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/progress', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Update user's progress
  const updateProgress = async (lessonId, completed = false) => {
    try {
      const response = await fetch('http://localhost:5000/api/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          day: lessonId,
          completed: completed
        })
      });

      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch progress first to check if user can access this lesson
        const userProgress = await fetchProgress();
        
        // Check if user can access this lesson
        const dayNumber = parseInt(day.replace('day', ''));
        if (userProgress && dayNumber > userProgress.current_day) {
          setError('You need to complete previous lessons first!');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/lesson/${dayNumber}`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch lesson (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.message || 'Failed to load lesson');
        }
        
        setLesson(data);

        // Auto-save that user has started this lesson
        if (userProgress && !userProgress.completed_days.includes(dayNumber)) {
          await updateProgress(dayNumber, false);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (day) {
      fetchLesson();
    }
  }, [day, navigate]);

  const handleLessonComplete = async () => {
    const dayNumber = parseInt(day.replace('day', ''));
    await updateProgress(dayNumber, true);
    
    // Navigate to next lesson if available
    if (progress && dayNumber < progress.total_days) {
      navigate(`/lesson/day${dayNumber + 1}`);
    } else {
      navigate('/student'); // Return to dashboard if no next lesson
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <p>Loading lesson {day}...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h3>Error Loading Lesson</h3>
        <p>{error}</p>
        <BackButton onClick={() => navigate('/student')}>
          Return to Dashboard
        </BackButton>
      </ErrorContainer>
    );
  }

  if (!lesson) {
    return (
      <ErrorContainer>
        <h3>No Lesson Found</h3>
        <p>Could not find lesson for day {day}</p>
        <BackButton onClick={() => navigate('/student')}>
          Return to Dashboard
        </BackButton>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer>
      <LessonContainer>
        <LessonView 
          lesson={lesson}
          progress={progress}
          onComplete={handleLessonComplete}
        />
      </LessonContainer>
      <SenseiContainer>
        <SenseiHelp currentLesson={lesson} />
      </SenseiContainer>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
`;

const LessonContainer = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const SenseiContainer = styled.div`
  width: 400px;
  border-left: 1px solid #333;
  background-color: #1e1e1e;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
  font-size: 1.2rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
  text-align: center;
  padding: 2rem;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: #ff6b6b;
    margin-bottom: 2rem;
  }
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #4a4a4a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a5a5a;
  }
`;

export default LessonPage;
