import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Container = styled.div`
  position: fixed;
  right: 20px;
  top: 80px;
  width: clamp(280px, 25vw, 400px);
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 1000;
  transition: all 0.3s ease;
  
  @media (max-width: 1200px) {
    width: 280px;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
`;

const SenseiIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChatTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
`;

const ChatWindow = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 5px;
  line-height: 1.6;
  ${props => props.$isSensei ? `
    background: white;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    p {
      margin: 0 0 1em 0;
      &:last-child {
        margin-bottom: 0;
      }
    }

    code {
      background: #f0f0f0;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Consolas', monospace;
      font-size: 0.9em;
    }

    pre {
      margin: 1em 0;
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }

    ul, ol {
      margin: 0.5em 0;
      padding-left: 1.5em;
    }
  ` : `
    background: #4CAF50;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  `}
`;

const CodeBlock = styled.div`
  margin: 0.5em 0;
  font-family: 'Consolas', monospace;
  font-size: 0.9em;
  background: #1e1e1e;
  border-radius: 6px;
  overflow: hidden;
`;

const Timestamp = styled.div`
  font-size: 11px;
  color: ${props => props.$isSensei ? '#999' : 'rgba(255, 255, 255, 0.8)'};
  margin-top: 4px;
`;

const InputArea = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const Input = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  max-height: 100px;
  min-height: 24px;

  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  padding: 10px;
  text-align: center;
  font-size: 14px;
`;

const LoadingDots = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  
  span {
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const formatTimestamp = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

const SenseiHelp = ({ currentLesson }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatWindowRef = useRef(null);

  // Load chat history from localStorage when component mounts or lesson changes
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${currentLesson?.id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message if no history exists
      const welcomeMessage = {
        content: `Welcome to Day ${currentLesson?.id || 'Unknown'}! I'm your coding Sensei. How can I help you with today's lesson?`,
        timestamp: new Date(),
        isSensei: true
      };
      setMessages([welcomeMessage]);
    }
  }, [currentLesson?.id]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (currentLesson?.id && messages.length > 0) {
      localStorage.setItem(`chat_history_${currentLesson.id}`, JSON.stringify(messages));
    }
  }, [messages, currentLesson?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = {
      content: input.trim(),
      timestamp: new Date(),
      isSensei: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/sensei-help', {
        code: currentLesson?.currentCode || '',
        context: currentLesson?.context || '',
        question: input.trim(),
        currentDay: currentLesson?.dayNumber || 1,
        currentBelt: currentLesson?.belt || 'white'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 10000
      });

      if (response.data.success) {
        const senseiMessage = {
          content: response.data.response,
          timestamp: new Date(),
          isSensei: true
        };
        setMessages(prev => [...prev, senseiMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response from sensei');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error.response?.data?.error || error.message || 'Unable to connect to Sensei. Please try again later.');
      const errorMessage = {
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isSensei: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderMessage = (message) => {
    if (message.isSensei) {
      return (
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : 'python';
              
              return !inline ? (
                <CodeBlock>
                  <SyntaxHighlighter
                    language={language}
                    style={tomorrow}
                    customStyle={{
                      margin: 0,
                      padding: '12px',
                      background: '#1e1e1e',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </CodeBlock>
              ) : (
                <code {...props}>{children}</code>
              );
            },
            p: ({ children }) => <p>{children}</p>,
            ul: ({ children }) => <ul>{children}</ul>,
            ol: ({ children }) => <ol>{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      );
    }
    return message.content;
  };

  return (
    <Container>
      <ChatHeader>
        <SenseiIcon>🥋</SenseiIcon>
        <ChatTitle>Chat with Sensei</ChatTitle>
      </ChatHeader>

      <ChatWindow ref={chatWindowRef}>
        {messages.map((message, index) => (
          <Message key={index} $isSensei={message.isSensei}>
            {renderMessage(message)}
            <Timestamp $isSensei={message.isSensei}>
              {formatTimestamp(new Date(message.timestamp))}
            </Timestamp>
          </Message>
        ))}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ChatWindow>

      <InputArea>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask your question... (Press Enter to send)"
          disabled={loading}
        />
        <SendButton 
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <LoadingDots>
              <span></span>
              <span></span>
              <span></span>
            </LoadingDots>
          ) : (
            <>Send <span>📤</span></>
          )}
        </SendButton>
      </InputArea>
    </Container>
  );
};

export default SenseiHelp;
