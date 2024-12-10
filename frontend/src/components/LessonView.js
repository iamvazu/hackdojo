import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AceEditor from 'react-ace';
import { useAuth } from './auth/AuthContext';
import ProgressBar from './ProgressBar';
import SenseiChat from './SenseiChat';
import BeltProgress from './BeltProgress';
import { updateProgress, fetchLesson } from '../utils/api';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const Container = styled.div`
  padding: 2rem;
  color: #e1e1e1;
  max-width: 1200px;
  margin: 0 auto;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-top: 2rem;
`;

const LessonContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ChatSection = styled.div`
  position: sticky;
  top: 2rem;
  height: calc(100vh - 4rem);
  background: #1e1e2e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #fff;
  margin: 0;
`;

const ProgressBadge = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${props => props.completed ? '#2ecc71' : '#3498db'};
  color: white;
`;

const Content = styled.div`
  line-height: 1.6;
  font-size: 1.1rem;
  
  h2 {
    color: #fff;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-left: 2rem;
    margin-bottom: 1rem;
  }
`;

const ExerciseSection = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #333;
  
  h3 {
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const ButtonContainer = styled.div`
  margin: 1rem 0;
  display: flex;
  justify-content: flex-end;
`;

const RunButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #27ae60;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const OutputContainer = styled.div`
  margin-top: 1rem;
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 1rem;
`;

const OutputHeader = styled.div`
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.5rem;
`;

const OutputContent = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #e1e1e1;
  font-family: monospace;
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #c0392b;
  color: white;
  border-radius: 4px;
`;

const CodeBlock = styled.div`
  margin: 1rem 0;
  border-radius: 4px;
  overflow: hidden;
`;

const LessonView = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentBelt, setCurrentBelt] = useState(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const { user } = useAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('Authentication token not found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        const dayNumber = day.replace('day', '');
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // First ensure we have progress initialized
        const progressResponse = await fetch('http://localhost:5000/api/progress/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!progressResponse.ok) {
          if (progressResponse.status === 401 || progressResponse.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to initialize progress');
        }

        // Now fetch the lesson
        const response = await fetch(`http://localhost:5000/api/lesson/${dayNumber}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch lesson');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.message || 'Failed to fetch lesson');
        }

        setCurrentLesson(data);
        if (data.exercise && data.exercise.starterCode) {
          setCode(data.exercise.starterCode);
        }

        // Fetch the curriculum to get all days for the current belt
        const curriculumResponse = await fetch('http://localhost:5000/api/curriculum', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!curriculumResponse.ok) {
          if (curriculumResponse.status === 401 || curriculumResponse.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch curriculum');
        }

        const curriculumData = await curriculumResponse.json();
        if (curriculumData.error) {
          throw new Error(curriculumData.message || 'Failed to fetch curriculum');
        }

        const currentBeltData = curriculumData.belts.find(belt => 
          data.belt && belt.name === data.belt.name
        );
        if (currentBeltData) {
          setCurrentBelt(currentBeltData);
        }

        // Get the progress
        const progressData = await fetch('http://localhost:5000/api/progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!progressData.ok) {
          if (progressData.status === 401 || progressData.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch progress');
        }

        const progress = await progressData.json();
        if (progress.error) {
          throw new Error(progress.message || 'Failed to fetch progress');
        }

        setProgress(progress);

      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Failed to fetch lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [day, navigate]);

  const handleRunCode = async () => {
    try {
      setOutput('');
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/run_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code,
          day: day.replace('day', ''),
          userInput: userInput
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(data.error || 'Failed to run code');
      }

      setOutput(data.output || '');
      
      if (data.success) {
        // Show success message
        setOutput(prev => prev + '\n' + data.message);
        
        // Fetch updated progress
        const progressResponse = await fetch('http://localhost:5000/api/progress', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData);
        }
        
        // Wait 2 seconds then navigate to next lesson
        if (data.next_day) {
          setTimeout(() => {
            navigate(`/lesson/day${data.next_day}`);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error running code:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseComplete = async () => {
    try {
      const dayNumber = parseInt(day.replace('day', ''));

      // Update progress
      const progressData = await updateProgress(dayNumber);
      
      // Show completion message
      setShowCompletionMessage(true);
      
      // Update progress state with completed days
      if (progressData.completed_days) {
        setProgress(prev => ({
          ...prev,
          current_day: progressData.current_day,
          completed_days: progressData.completed_days
        }));

        // Also update localStorage
        localStorage.setItem('currentDay', progressData.current_day.toString());
        localStorage.setItem('completedDays', JSON.stringify(progressData.completed_days));
      }

      // Navigate to next day after delay
      const nextDay = dayNumber + 1;
      setTimeout(async () => {
        try {
          setShowCompletionMessage(false);
          
          // Pre-fetch next lesson
          const nextLesson = await fetchLesson(nextDay);
          
          // Navigate to next lesson
          navigate(`/lesson/day${nextDay}`);
        } catch (error) {
          console.error('Navigation error:', error);
          if (error.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
          } else {
            setError(error.message);
          }
        }
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      if (error.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.message || 'Failed to complete exercise');
      }
    }
  };

  const renderButtons = () => (
    <ButtonContainer>
      <RunButton onClick={handleRunCode} disabled={loading}>
        {loading ? 'Running...' : 'Run Code'}
      </RunButton>
      <RunButton 
        onClick={handleExerciseComplete} 
        disabled={loading || showCompletionMessage}
        style={{ backgroundColor: '#4CAF50' }}
      >
        {showCompletionMessage ? 'Completed!' : 'Complete Exercise'}
      </RunButton>
    </ButtonContainer>
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    const lastCompletedDay = localStorage.getItem('lastCompletedDay');
    const currentDay = localStorage.getItem('currentDay');

    if (!token) {
      navigate('/login');
      return;
    }

    // If we have a last completed day and current day, ensure they're consistent
    if (lastCompletedDay && currentDay) {
      const lastDay = parseInt(lastCompletedDay);
      const currDay = parseInt(currentDay);
      if (currDay !== lastDay + 1) {
        navigate(`/lesson/day${lastDay + 1}`);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const savedDay = localStorage.getItem('currentDay');
    if (savedDay && !day) {
      navigate(`/lesson/day${savedDay}`);
    }
  }, []);

  if (loading) {
    return (
      <Container>
        <p>Loading lesson {day}...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <h3>Error Loading Lesson</h3>
        <p>{error}</p>
      </Container>
    );
  }

  if (!currentLesson) {
    return (
      <Container>
        <h3>No Lesson Found</h3>
        <p>Could not find lesson for day {day}</p>
      </Container>
    );
  }

  return (
    <Container>
      {currentBelt && progress && (
        <BeltProgress
          belt={currentBelt}
          currentDay={progress.current_day}
          completedDays={progress.completed_days || []}
        />
      )}
      
      <MainContent>
        <LessonContent>
          <LessonHeader>
            <Title>{currentLesson?.title}</Title>
            {progress && (
              <ProgressBadge completed={progress.completed_days.includes(parseInt(day.replace('day', '')))}>
                {progress.completed_days.includes(parseInt(day.replace('day', ''))) ? 'Completed' : 'In Progress'}
              </ProgressBadge>
            )}
          </LessonHeader>

          <Content>
            <p>{currentLesson?.content}</p>
          </Content>

          {currentLesson?.exercise && (
            <ExerciseSection>
              <h3>Exercise</h3>
              <p>{currentLesson.exercise.description}</p>
              
              <div className="flex flex-col space-y-4">
                {/* Code Editor */}
                <AceEditor
                  mode="python"
                  theme="monokai"
                  value={code}
                  onChange={setCode}
                  name="code-editor"
                  width="100%"
                  height="300px"
                  fontSize={14}
                  showPrintMargin={false}
                  showGutter={true}
                  highlightActiveLine={true}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                  }}
                />

                {renderButtons()}

                {/* User Input Area */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <label className="text-white text-sm font-medium">
                      Input:
                    </label>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your input here..."
                    />
                  </div>
                </div>

                {/* Console Output */}
                {output && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-white font-mono">
                      <div className="text-gray-400 text-sm mb-2">Output:</div>
                      <pre className="whitespace-pre-wrap">{output}</pre>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <pre className="whitespace-pre-wrap">{error}</pre>
                  </div>
                )}
              </div>
            </ExerciseSection>
          )}
        </LessonContent>

        <ChatSection>
          <SenseiChat />
        </ChatSection>
      </MainContent>
    </Container>
  );
};

export default LessonView;
