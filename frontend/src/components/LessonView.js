import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AceEditor from 'react-ace';
import { useAuth } from './auth/AuthContext';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 80px);
  background: #1e1e1e;
  color: #fff;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: #fff;
  font-size: 1.2em;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: #ff6b6b;
  text-align: center;
  
  h3 {
    margin-bottom: 1rem;
  }
  
  p {
    color: #aaa;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5em;
  color: #fff;
`;

const RunButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #4CAF50;
  color: #fff;
  cursor: pointer;
  font-size: 1.1em;

  &:hover {
    background: #45a049;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #2d2d2d;
  border-radius: 8px;
`;

const LessonContent = styled.div`
  margin-bottom: 20px;
  line-height: 1.6;
  color: #fff;
`;

const EditorContainer = styled.div`
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
`;

const OutputContainer = styled.div`
  background: #000;
  color: #fff;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  margin-top: 20px;
  white-space: pre-wrap;
`;

const SenseiPanel = styled.div`
  background: #2d2d2d;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SenseiTitle = styled.h3`
  color: #fff;
  margin: 0 0 20px 0;
`;

const SenseiChat = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const Message = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  background: ${props => props.isSensei ? '#1e1e1e' : '#4CAF50'};
  color: #fff;
`;

const SenseiInput = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #1e1e1e;
  color: #fff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4CAF50;
  }
`;

const SendButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: #4CAF50;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #45a049;
  }
`;

const LessonView = () => {
  const { day } = useParams();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([
    { text: "Hello! I'm Sensei. How can I help you with your Python journey?", isSensei: true }
  ]);
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
        
        const response = await fetch(`http://localhost:5000/api/lesson/${day}`, {
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
        
        setCurrentLesson(data);
        setCode(data.exercise?.starterCode || '');
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
      </ErrorContainer>
    );
  }

  if (!currentLesson) {
    return (
      <ErrorContainer>
        <h3>No Lesson Found</h3>
        <p>Could not find lesson for day {day}</p>
      </ErrorContainer>
    );
  }

  const handleRunCode = async () => {
    try {
      setOutput('Running code...');
      
      const headers = getAuthHeaders();
      const runResponse = await fetch('http://localhost:5000/api/run', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ code })
      });

      const runData = await runResponse.json();
      
      if (!runResponse.ok) {
        if (runResponse.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(runData.message || `HTTP error! status: ${runResponse.status}`);
      }
      
      if (runData.error) {
        setOutput(runData.message || 'Error executing code');
        return;
      }
      
      let outputText = '';
      if (runData.output) outputText += runData.output;
      if (runData.error) outputText += `\nError: ${runData.error}`;
      setOutput(outputText || 'No output');
      
      if (runData.success && currentLesson?.exercise?.test_cases) {
        const testCase = currentLesson.exercise.test_cases[0];
        if (runData.output.trim() === testCase.expected.trim()) {
          const progressResponse = await fetch('http://localhost:5000/api/progress', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              day: parseInt(day),
              success: true
            })
          });

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.next_day) {
              setOutput(outputText + '\n\nGreat job! Moving to next lesson...');
              setTimeout(() => {
                navigate(`/lesson/${progressData.next_day}`);
              }, 1500);
            } else {
              setOutput(outputText + '\n\nCongratulations! You\'ve completed this lesson!');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleAskSensei = async () => {
    if (!question.trim()) return;

    setChat(prev => [...prev, { text: question, isSensei: false }]);

    try {
      const response = await fetch('http://localhost:5000/api/sensei/ask', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          question,
          context: {
            currentLesson: currentLesson?.title,
            currentCode: code
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setChat(prev => [...prev, { text: data.response, isSensei: true }]);
      setQuestion('');
    } catch (error) {
      console.error('Error asking Sensei:', error);
      setChat(prev => [...prev, {
        text: "I apologize, but I'm having trouble connecting to my wisdom. Please try again.",
        isSensei: true
      }]);
    }
  };

  return (
    <Container>
      <MainContent>
        <TopBar>
          <Title>Day {day}: {currentLesson.title}</Title>
          <RunButton onClick={handleRunCode}>▶ Run</RunButton>
        </TopBar>
        <Content>
          <LessonContent>
            {currentLesson.content}
          </LessonContent>
          <h3>{currentLesson.exercise.title}</h3>
          <p>{currentLesson.exercise.description}</p>
          {currentLesson.exercise.hint && (
            <p><strong>Hint:</strong> {currentLesson.exercise.hint}</p>
          )}
          <EditorContainer>
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
          </EditorContainer>
          <OutputContainer>
            {output || 'Run your code to see the output here'}
          </OutputContainer>
        </Content>
      </MainContent>

      <SenseiPanel>
        <SenseiTitle>Ask Sensei</SenseiTitle>
        <SenseiChat>
          {chat.map((message, index) => (
            <Message key={index} isSensei={message.isSensei}>
              {message.text}
            </Message>
          ))}
        </SenseiChat>
        <SenseiInput>
          <Input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskSensei()}
            placeholder="Ask Sensei a question..."
          />
          <SendButton onClick={handleAskSensei}>Ask</SendButton>
        </SenseiInput>
      </SenseiPanel>
    </Container>
  );
};

export default LessonView;
