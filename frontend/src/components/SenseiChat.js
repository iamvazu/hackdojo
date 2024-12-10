import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaPaperPlane, FaVolumeUp } from 'react-icons/fa';
import axios from 'axios';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1e1e2e;
    border-radius: 8px;
    overflow: hidden;
`;

const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #2a2a3a;
    }

    &::-webkit-scrollbar-thumb {
        background: #4a4a5a;
        border-radius: 4px;
    }
`;

const Message = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 85%;
    ${props => props.sender === 'user' ? 'align-self: flex-end;' : 'align-self: flex-start;'}
    background: ${props => props.sender === 'user' ? '#4a4a5a' : '#2a2a3a'};
    padding: 12px 16px;
    border-radius: 12px;
    ${props => props.sender === 'user' ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;'}
    position: relative;
`;

const MessageContent = styled.div`
    color: #fff;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: ${props => props.hasAudio ? '8px' : '0'};

    .markdown {
        p {
            margin: 0 0 8px 0;
            &:last-child {
                margin-bottom: 0;
            }
        }
        
        code {
            background: #3a3a4a;
            padding: 2px 4px;
            border-radius: 4px;
            font-family: 'Fira Code', monospace;
        }

        pre {
            background: #3a3a4a;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 8px 0;

            code {
                background: none;
                padding: 0;
            }
        }
    }
`;

const InputContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: #2a2a3a;
    border-top: 1px solid #3a3a4a;
`;

const Input = styled.input`
    flex: 1;
    background: #1e1e2e;
    border: 1px solid #3a3a4a;
    border-radius: 6px;
    padding: 10px 16px;
    color: #fff;
    font-size: 0.95rem;

    &:focus {
        outline: none;
        border-color: #4a4a5a;
    }

    &::placeholder {
        color: #6a6a7a;
    }
`;

const IconButton = styled.button`
    background: none;
    border: none;
    color: ${props => props.active ? '#4CAF50' : '#6a6a7a'};
    font-size: 1.2rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
        background: #3a3a4a;
        color: ${props => props.active ? '#4CAF50' : '#fff'};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const AudioControls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
`;

const SenseiChat = ({ lessonContext }) => {
    const [messages, setMessages] = useState(() => {
        // Load messages from localStorage
        const savedMessages = localStorage.getItem('senseiChatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [
            { text: "Hello! I'm Sensei. How can I help you with your Python journey?", sender: 'sensei' }
        ];
    });
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('senseiChatMessages', JSON.stringify(messages));
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/sensei/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    question: input,
                    context: {
                        currentLesson: lessonContext,
                        currentCode: '',
                        studentProgress: {},
                        previousInteractions: []
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get response from Sensei');
            }

            const data = await response.json();
            const senseiMessage = { text: data.response, sender: 'sensei' };
            setMessages(prev => [...prev, senseiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { 
                text: `Error: ${error.message || 'Something went wrong. Please try again.'}`, 
                sender: 'sensei' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <ChatContainer>
            <MessagesContainer>
                {messages.map((message, index) => (
                    <Message key={index} sender={message.sender}>
                        <MessageContent>
                            <ReactMarkdown className="markdown">{message.text}</ReactMarkdown>
                        </MessageContent>
                    </Message>
                ))}
                {isLoading && (
                    <Message sender="sensei">
                        <MessageContent>
                            Thinking...
                        </MessageContent>
                    </Message>
                )}
                <div ref={messagesEndRef} />
            </MessagesContainer>
            <InputContainer>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Sensei a question..."
                    disabled={isLoading}
                />
                <IconButton onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                    <FaPaperPlane />
                </IconButton>
            </InputContainer>
        </ChatContainer>
    );
};

export default SenseiChat;
