import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CodeEditor from './CodeEditor';
import BeltProgressTracker from './BeltProgressTracker';
import SenseiHelp from './SenseiHelp';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: calc(100vw - 40px);
  margin: 0 auto;
  padding-right: calc(clamp(280px, 25vw, 400px) + 40px);
  
  @media (max-width: 1200px) {
    padding-right: 340px;
  }
`;

const LessonContent = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 1200px;
`;

const ContentPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExercisePanel = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const EditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const ConsoleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #1e1e1e;
  color: white;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const ConsoleOutput = styled.pre`
  background: #1e1e1e;
  color: #ffffff;
  padding: 1rem;
  border-radius: 4px;
  margin: 0;
  overflow-x: auto;
  font-family: 'Consolas', monospace;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
`;

const RunButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: #388E3C;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const NextDayButton = styled.button`
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: #1976D2;
  }
`;

const ResultMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
  background: ${props => props.$isCorrect ? '#E8F5E9' : '#FFEBEE'};
  color: ${props => props.$isCorrect ? '#2E7D32' : '#C62828'};
`;

const CheckIcon = styled.span`
  font-weight: bold;
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function LessonView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    fetchCurriculum();
  }, []);

  useEffect(() => {
    if (currentDay) {
      fetchLesson(currentDay);
    }
  }, [currentDay]);

  const fetchCurriculum = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/curriculum');
      const data = await response.json();
      setCurriculum(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      setError('Failed to load curriculum');
      setLoading(false);
    }
  };

  const fetchLesson = async (day) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/lesson/${day}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data) {
        throw new Error('No lesson data received');
      }
      
      setCurrentLesson(data);
      setEditorContent(data.exercise?.starterCode || '');
      setShowHint(false);
      setExerciseCompleted(false);
      setConsoleOutput('');
    } catch (error) {
      console.error('Error fetching lesson:', error);
      setError('Failed to load lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (day) => {
    if (day && day.day) {
      setCurrentDay(day.day);
    }
  };

  const handleNextDay = () => {
    setCurrentDay(currentDay + 1);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleOutput('');
    
    try {
      const response = await fetch('http://localhost:5000/api/exercise/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: editorContent,
          day: currentDay
        }),
      });

      const data = await response.json();
      setConsoleOutput(data.output);
      
      if (data.success) {
        setExerciseCompleted(true);
        fetchCurriculum();
      }
    } catch (error) {
      setConsoleOutput(`Error running code: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      {curriculum && (
        <BeltProgressTracker 
          curriculum={curriculum.curriculum}
          progress={curriculum.progress}
          onDaySelect={handleDaySelect}
        />
      )}

      {currentLesson && (
        <LessonContent>
          <ContentPanel>
            <ExercisePanel>
              <h2>{currentLesson.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
              
              {currentLesson.exercise && (
                <>
                  <h3>{currentLesson.exercise.title}</h3>
                  <p>{currentLesson.exercise.description}</p>
                  
                  {!showHint && currentLesson.exercise.hint && (
                    <button onClick={() => setShowHint(true)}>Show Hint</button>
                  )}
                  
                  {showHint && currentLesson.exercise.hint && (
                    <div>
                      <strong>Hint:</strong> {currentLesson.exercise.hint}
                    </div>
                  )}
                </>
              )}

              {exerciseCompleted && (
                <ResultMessage $isCorrect={true}>
                  <CheckIcon>✓</CheckIcon> Great job! You've completed this exercise! 🎉
                </ResultMessage>
              )}

              {exerciseCompleted && (
                <NextDayButton onClick={handleNextDay}>
                  Continue to Day {currentDay + 1} →
                </NextDayButton>
              )}
            </ExercisePanel>
            
            <SenseiHelp 
              lesson={currentLesson}
              code={editorContent}
            />
          </ContentPanel>

          <EditorPanel>
            <EditorHeader>
              <h3>Code Editor</h3>
              <RunButton 
                onClick={handleRunCode}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <LoadingSpinner /> Running...
                  </>
                ) : (
                  'Run Code ▶'
                )}
              </RunButton>
            </EditorHeader>
            
            <CodeEditor
              code={editorContent}
              onChange={setEditorContent}
              height="300px"
            />
            
            <div>
              <ConsoleHeader>
                <span>Console Output</span>
              </ConsoleHeader>
              <ConsoleOutput>
                {consoleOutput || 'Output will appear here...'}
              </ConsoleOutput>
            </div>
          </EditorPanel>
        </LessonContent>
      )}
    </Container>
  );
}

export default LessonView;
