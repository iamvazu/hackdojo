import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const RunButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;

  &:hover {
    background: #43a047;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const OutputPanel = styled.div`
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
`;

const StatusMessage = styled.div`
  padding: 10px;
  margin: 10px 0;
  border-radius: 5px;
  background: ${props => props.$success ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.$success ? '#2e7d32' : '#c62828'};
  border: 1px solid ${props => props.$success ? '#a5d6a7' : '#ef9a9a'};
`;

const InputPanel = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const InputField = styled.input`
  width: 70%;
  padding: 12px;
  margin-right: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
  }
`;

const InputLabel = styled.div`
  font-size: 16px;
  color: #495057;
  margin-bottom: 10px;
  font-weight: 500;
`;

const SubmitButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background: #218838;
  }
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const InputQueue = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
`;

const InputQueueItem = styled.span`
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #ced4da;
`;

function CodeEditor({ initialCode, expectedOutput, expectedOutputContains, onSuccess }) {
  const [code, setCode] = useState(initialCode || '');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [inputQueue, setInputQueue] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [requiresInput, setRequiresInput] = useState(false);

  // Update code and reset state when initialCode changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setRequiresInput(initialCode.includes('input('));
      // Reset state when switching lessons
      setOutput('');
      setStatus(null);
      setUserInput('');
      setInputQueue([]);
      setWaitingForInput(false);
    }
  }, [initialCode]);

  const handleEditorChange = (value) => {
    setCode(value);
    setRequiresInput(value.includes('input('));
  };

  const handleInputSubmit = () => {
    if (userInput.trim()) {
      setInputQueue([...inputQueue, userInput.trim()]);
      setUserInput('');
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const validateOutput = (output) => {
    if (expectedOutput && output.trim() === expectedOutput.trim()) {
      return true;
    }
    if (expectedOutputContains && output.includes(expectedOutputContains)) {
      return true;
    }
    return false;
  };

  const runCode = async () => {
    try {
      setRunning(true);
      setStatus(null);
      
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ 
          code,
          test_inputs: inputQueue 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const data = await response.json();
      
      if (data.error) {
        setStatus({
          success: false,
          message: `Failed to run code: ${data.error}`
        });
        return;
      }

      setOutput(data.output || '');
      
      const isCorrect = validateOutput(data.output || '');
      setStatus({
        success: isCorrect,
        message: isCorrect ? 'Great job! The output matches what we expected!' : 'The output is not quite what we expected. Try again!'
      });

      if (isCorrect && onSuccess) {
        onSuccess();
      }

    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
    } finally {
      setRunning(false);
      setInputQueue([]); // Clear input queue after running
    }
  };

  return (
    <EditorContainer>
      <ControlPanel>
        <h3>Code Editor</h3>
        <RunButton 
          onClick={runCode} 
          disabled={running || (requiresInput && inputQueue.length === 0)}
        >
          {running ? 'Running...' : 'Run Code'}
        </RunButton>
      </ControlPanel>
      
      <Editor
        height="300px"
        defaultLanguage="python"
        value={code}
        onChange={handleEditorChange}
        theme="light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />

      {requiresInput && (
        <InputPanel>
          <InputLabel>Test Input Values:</InputLabel>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InputField
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
              placeholder="Type your input value and press Enter or Add"
            />
            <SubmitButton onClick={handleInputSubmit} disabled={!userInput.trim()}>
              Add Input
            </SubmitButton>
          </div>
          {inputQueue.length > 0 && (
            <InputQueue>
              <strong>Input Queue: </strong>
              {inputQueue.map((input, index) => (
                <InputQueueItem key={index}>
                  {input}
                </InputQueueItem>
              ))}
            </InputQueue>
          )}
        </InputPanel>
      )}

      {status && (
        <StatusMessage $success={status.success}>
          {status.message}
        </StatusMessage>
      )}

      {output && (
        <OutputPanel>
          {output}
        </OutputPanel>
      )}
    </EditorContainer>
  );
}

export default CodeEditor;
