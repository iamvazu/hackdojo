import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const ProgressContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  overflow-x: auto;
  background: #2d2d2d;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const DayButton = styled(Link)`
  min-width: 80px;
  padding: 10px;
  text-align: center;
  border-radius: 5px;
  text-decoration: none;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.locked ? 'none' : 'auto'};

  &:hover {
    background: ${props => props.locked ? '#333' : '#4CAF50'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const DayLabel = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
`;

const BeltHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: white;
`;

const BeltTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const BeltProgress = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const ProgressBar = ({ currentDay, completedLessons = [] }) => {
  const totalDays = 30;
  
  const isLessonAccessible = (day) => {
    // First day is always accessible
    if (day === 1) return true;
    // A lesson is accessible if:
    // 1. It's the current day or earlier
    // 2. The previous day is completed
    // 3. It's already completed
    return day <= currentDay || 
           completedLessons.includes(day - 1) || 
           completedLessons.includes(day);
  };

  const isLessonCompleted = (day) => {
    return completedLessons.includes(day);
  };

  const getBeltColor = (day) => {
    if (day <= 10) return '#FFFFFF'; // White Belt
    if (day <= 20) return '#FFD700'; // Yellow Belt
    return '#FFA500'; // Orange Belt
  };

  const getBeltName = (day) => {
    if (day <= 10) return 'White Belt';
    if (day <= 20) return 'Yellow Belt';
    return 'Orange Belt';
  };

  const getDayStyle = (day, isCompleted, isActive, isLocked) => {
    const beltColor = getBeltColor(day);
    const baseStyle = {
      backgroundColor: isActive ? '#4CAF50' : 
                     isCompleted ? '#45a049' : 
                     '#333',
      borderLeft: `4px solid ${beltColor}`,
      opacity: isLocked ? 0.5 : 1,
      color: 'white',
      transition: 'all 0.3s ease'
    };
    return baseStyle;
  };
  
  return (
    <>
      <BeltHeader>
        <BeltTitle>{getBeltName(currentDay)}</BeltTitle>
        <BeltProgress>
          Day {currentDay} of {totalDays}
        </BeltProgress>
      </BeltHeader>
      <ProgressContainer>
        {[...Array(totalDays)].map((_, index) => {
          const day = index + 1;
          const isCompleted = isLessonCompleted(day);
          const isActive = day === parseInt(currentDay);
          const isLocked = !isLessonAccessible(day);
          
          return (
            <DayButton
              key={day}
              to={isLocked ? '#' : `/lesson/day${day}`}
              active={isActive}
              completed={isCompleted}
              locked={isLocked}
              style={getDayStyle(day, isCompleted, isActive, isLocked)}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                }
              }}
            >
              <DayLabel>Day {day}</DayLabel>
              {isCompleted ? '✓' : isLocked ? '🔒' : ''}
            </DayButton>
          );
        })}
      </ProgressContainer>
    </>
  );
};

export default ProgressBar;
