import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaLock, FaCheck, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import LessonView from './LessonView';
import { fetchWithAuth } from '../utils/api';

const Container = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  background: #1e1e1e;
  color: #fff;
`;

const BeltList = styled.div`
  width: 200px;
  padding: 20px;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
`;

const BeltButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 5px;
  background: ${props => props.selected ? props.color : '#2d2d2d'};
  color: ${props => props.selected ? '#000' : '#fff'};
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;

  &:hover {
    background: ${props => props.color};
    color: #000;
  }
`;

const DaysList = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-width: 0;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  padding: 20px;
`;

const DayButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #2d2d2d;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
  transition: all 0.2s;
  border: none;
  color: #fff;

  &:hover {
    background: ${props => props.disabled ? '#2d2d2d' : '#3d3d3d'};
  }

  span {
    margin-top: 5px;
  }
`;

const MainContent = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #333;
  min-width: 0;
`;

const ChatWindow = styled.div`
  width: 300px;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid #333;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background: #2d2d2d;
  color: #fff;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #4CAF50;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #45a049;
  }
`;

const Message = styled.div`
  padding: 10px;
  border-radius: 5px;
  background: ${props => props.sender === 'user' ? '#4CAF50' : '#2d2d2d'};
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 80%;
`;

const BeltContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #1e1e1e;
  border-radius: 8px;
`;

const BeltSection = styled.div`
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.isActive ? '#2d2d2d' : '#262626'};
`;

const BeltHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  gap: 15px;
  border-bottom: ${props => props.isExpanded ? '1px solid #333' : 'none'};

  &:hover {
    background: #2d2d2d;
  }
`;

const BeltIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid ${props => props.isActive ? '#4CAF50' : '#333'};
  box-shadow: ${props => props.isActive ? '0 0 10px rgba(76, 175, 80, 0.3)' : 'none'};
`;

const BeltInfo = styled.div`
  flex: 1;
`;

const BeltName = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1.1em;
`;

const BeltDescription = styled.p`
  margin: 5px 0 0;
  color: #888;
  font-size: 0.9em;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  padding: 15px;
  background: #1e1e1e;
`;

const DayButtonLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: ${props => props.completed ? '#45a049' : props.active ? '#4CAF50' : '#333'};
  border-radius: 6px;
  text-decoration: none;
  color: white;
  gap: 8px;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.locked ? 0.5 : 1};
  pointer-events: ${props => props.locked ? 'none' : 'auto'};
  transition: all 0.2s ease;

  &:hover {
    transform: ${props => props.locked ? 'none' : 'translateY(-2px)'};
    background: ${props => props.locked ? '#333' : '#4CAF50'};
  }
`;

const DayNumber = styled.span`
  font-weight: bold;
`;

const StatusIcon = styled.div`
  font-size: 1.1em;
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #333;
  border-radius: 2px;
  margin-top: 5px;
  overflow: hidden;

  div {
    height: 100%;
    background: #4CAF50;
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const BeltSystem = () => {
  const [selectedBelt, setSelectedBelt] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [belts, setBelts] = useState([]);
  const [userProgress, setUserProgress] = useState({
    currentBelt: 'white',
    currentDay: 1,
    completedDays: []
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [expandedBelt, setExpandedBelt] = useState(null);

  // Define default belts
  const BELTS = [
    {
      name: 'White Belt',
      color: '#FFFFFF',
      startDay: 1,
      days: 10,
      description: 'Begin your Python journey'
    },
    {
      name: 'Yellow Belt',
      color: '#FFD700',
      startDay: 11,
      days: 10,
      description: 'Control flow and functions'
    },
    {
      name: 'Orange Belt',
      color: '#FFA500',
      startDay: 21,
      days: 10,
      description: 'Data structures and algorithms'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user progress
        const progressData = await fetchWithAuth('/api/progress');
        if (progressData) {
          setUserProgress({
            currentBelt: progressData.current_belt?.name || 'White Belt',
            currentDay: progressData.current_day || 1,
            completedDays: progressData.completed_days || []
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.message.includes('Authentication failed')) {
          window.location.href = '/login';
        }
      }
    };

    fetchData();
  }, []);

  const handleDayClick = (day) => {
    if (day <= userProgress.currentDay) {
      setSelectedDay(day);
    }
  };

  const handleProgressUpdate = (progressData) => {
    if (!progressData) return;
    
    setUserProgress({
      currentBelt: progressData.current_belt?.name || 'White Belt',
      currentDay: progressData.current_day || 1,
      completedDays: progressData.completed_days || []
    });
    
    // Update selected belt if necessary
    if (progressData.current_belt?.name && progressData.current_belt.name !== selectedBelt) {
      setSelectedBelt(progressData.current_belt.name);
    }
  };

  const isDayUnlocked = (day) => {
    return day <= (userProgress?.currentDay || 1);
  };

  const isDayCompleted = (day) => {
    return userProgress?.completedDays?.includes(day) || false;
  };

  const getBeltProgress = (belt) => {
    if (!userProgress?.completedDays) return 0;
    if (!belt?.days || !belt?.startDay) return 0;
    
    const beltDays = Array.from({ length: belt.days }, (_, i) => belt.startDay + i);
    const completedInBelt = beltDays.filter(day => userProgress.completedDays.includes(day));
    return (completedInBelt.length / belt.days) * 100;
  };

  const isDayLocked = (day) => {
    if (!userProgress?.completedDays) return true;
    if (day === 1) return false;
    if (day <= (userProgress?.currentDay || 1)) return false;
    return !userProgress.completedDays.includes(day - 1);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setInputMessage('');

      try {
        // Send message to backend using fetchWithAuth
        await fetchWithAuth('/api/chat', {
          method: 'POST',
          body: { message: inputMessage }
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  return (
    <Container>
      <BeltList>
        {BELTS.map((belt, index) => (
          <BeltButton
            key={belt.name}
            selected={selectedBelt === belt.name}
            onClick={() => setSelectedBelt(belt.name)}
            color={belt.color}
          >
            {belt.name}
          </BeltButton>
        ))}
      </BeltList>
      
      <DaysList>
        {BELTS.map((belt, index) => {
          const isCurrentBelt = selectedBelt === belt.name;
          const progress = getBeltProgress(belt);
          
          return (
            <BeltSection key={belt.name} isActive={isCurrentBelt}>
              <BeltHeader 
                onClick={() => setExpandedBelt(expandedBelt === index ? null : index)}
                isExpanded={expandedBelt === index}
              >
                <BeltIcon color={belt.color} isActive={isCurrentBelt} />
                <BeltInfo>
                  <BeltName>{belt.name}</BeltName>
                  <BeltDescription>{belt.description}</BeltDescription>
                  <ProgressBar progress={progress}>
                    <div />
                  </ProgressBar>
                </BeltInfo>
                {expandedBelt === index ? <FaChevronDown /> : <FaChevronRight />}
              </BeltHeader>
              
              {expandedBelt === index && (
                <DaysGrid>
                  {Array.from({ length: belt.days || 0 }, (_, i) => {
                    const day = (belt.startDay || 0) + i;
                    const isCompleted = isDayCompleted(day);
                    const isActive = day === userProgress?.currentDay;
                    const isLocked = isDayLocked(day);
                    
                    return (
                      <DayButtonLink
                        key={day}
                        to={isLocked ? '#' : `/student/lesson/${day}`}
                        completed={isCompleted}
                        active={isActive}
                        locked={isLocked}
                      >
                        <DayNumber>Day {day}</DayNumber>
                        <StatusIcon>
                          {isLocked ? <FaLock /> : isCompleted ? <FaCheck /> : '▶'}
                        </StatusIcon>
                      </DayButtonLink>
                    );
                  })}
                </DaysGrid>
              )}
            </BeltSection>
          );
        })}
      </DaysList>

      {selectedDay && (
        <MainContent>
          <LessonView 
            day={selectedDay} 
            onProgressUpdate={handleProgressUpdate}
          />
        </MainContent>
      )}

      <ChatWindow>
        <ChatMessages>
          {chatMessages.map((message, index) => (
            <Message key={index} sender={message.sender}>
              {message.text}
            </Message>
          ))}
        </ChatMessages>
        <ChatInput>
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask Sensei a question..."
          />
          <SendButton onClick={handleSendMessage}>Send</SendButton>
        </ChatInput>
      </ChatWindow>
    </Container>
  );
};

export default BeltSystem;
