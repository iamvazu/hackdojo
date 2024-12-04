import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaLock, FaCheckCircle, FaCircle } from 'react-icons/fa';
import LessonView from './LessonView';

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

  useEffect(() => {
    // Fetch curriculum data
    fetch('http://localhost:5000/api/curriculum')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setBelts(data.belts);
        setSelectedBelt('white');
      })
      .catch(err => console.error('Error fetching curriculum:', err));

    // Fetch user progress
    fetch('http://localhost:5000/api/progress')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setUserProgress(data))
      .catch(err => console.error('Error fetching progress:', err));
  }, []);

  const handleDayClick = (day) => {
    if (day <= userProgress.currentDay) {
      setSelectedDay(day);
    }
  };

  const handleProgressUpdate = (progressData) => {
    setUserProgress(progressData);
    
    // Update selected belt if necessary
    if (progressData.currentBelt !== selectedBelt) {
      setSelectedBelt(progressData.currentBelt);
    }
  };

  const isDayUnlocked = (day) => {
    return day <= userProgress.currentDay;
  };

  const isDayCompleted = (day) => {
    return userProgress.completedDays.includes(day);
  };

  const renderDays = () => {
    const selectedBeltData = belts.find(belt => belt.name === selectedBelt);
    if (!selectedBeltData) return null;

    const days = [];
    for (let day = selectedBeltData.startDay; day <= selectedBeltData.endDay; day++) {
      const isUnlocked = isDayUnlocked(day);
      const isCompleted = isDayCompleted(day);
      
      days.push(
        <DayButton
          key={day}
          onClick={() => handleDayClick(day)}
          disabled={!isUnlocked}
          completed={isCompleted}
        >
          Day {day}
          {isCompleted && <span role="img" aria-label="completed">✅</span>}
          {!isUnlocked && <span role="img" aria-label="locked">🔒</span>}
        </DayButton>
      );
    }
    return days;
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setChatMessages([...chatMessages, newMessage]);
      setInputMessage('');

      // Send message to backend
      fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          currentBelt: userProgress.currentBelt,
          currentDay: userProgress.currentDay
        })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          const senseiResponse = {
            text: data.response,
            sender: 'sensei',
            timestamp: new Date().toISOString()
          };
          setChatMessages(messages => [...messages, senseiResponse]);
        })
        .catch(err => console.error('Error sending message:', err));
    }
  };

  return (
    <Container>
      <BeltList>
        {belts.map((belt) => (
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
        <DayGrid>
          {renderDays()}
        </DayGrid>
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
