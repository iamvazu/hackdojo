import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #1e1e1e;
  color: #fff;
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
  min-width: 0;
`;

const LessonContent = styled.div`
  margin-bottom: 20px;
  line-height: 1.6;
`;

const EditorContainer = styled.div`
  margin: 20px 0;
  border: 1px solid #333;
  border-radius: 5px;
  overflow: hidden;
`;

const OutputContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #2d2d2d;
  border-radius: 5px;
  font-family: monospace;
  white-space: pre-wrap;
`;

const LessonView = ({ day, onProgressUpdate }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (day) {
      fetch(`http://localhost:5000/api/lesson/${day}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setCurrentLesson(data);
          setCode(data.exercise.starterCode || '');
        })
        .catch(err => console.error('Error fetching lesson:', err));
    }
  }, [day]);

  const handleRunCode = () => {
    setOutput('Running code...');
    fetch('http://localhost:5000/api/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          setOutput(`Error: ${data.error}`);
        } else {
          setOutput(data.output || 'No output');
          
          // Check if the output matches the expected output
          if (currentLesson?.exercise?.test_cases) {
            const testCase = currentLesson.exercise.test_cases[0];
            if (data.output.trim() === testCase.expected.trim()) {
              // Update progress
              fetch('http://localhost:5000/api/progress', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  completedDay: day
                })
              })
                .then(res => {
                  if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  return res.json();
                })
                .then(progressData => {
                  if (onProgressUpdate) {
                    onProgressUpdate(progressData);
                  }
                  setOutput(data.output + '\n\nCongratulations! You completed this lesson! 🎉');
                })
                .catch(err => {
                  console.error('Error updating progress:', err);
                  setOutput(data.output + '\n\nError updating progress. Please try again.');
                });
            }
          }
        }
      })
      .catch(err => {
        console.error('Error running code:', err);
        setOutput(`Error: ${err.message}`);
      });
  };

  if (!currentLesson) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
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
    </Container>
  );
};

export default LessonView;
