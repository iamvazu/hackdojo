import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const BeltContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #1e1e2e;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const BeltTitle = styled.h2`
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
`;

const DaysContainer = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2a2a3a;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #4a4a5a;
    border-radius: 4px;
  }
`;

const DayCard = styled(Link)`
  flex: 0 0 200px;
  padding: 1rem;
  background: ${props => props.isActive ? '#2ecc71' : props.isCompleted ? '#27ae60' : '#2a2a3a'};
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.isActive ? '#27ae60' : props.isCompleted ? '#219a52' : '#3a3a4a'};
  }

  ${props => !props.isAccessible && `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

const DayTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const DayDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
`;

const BeltProgress = ({ belt, currentDay, completedDays }) => {
  return (
    <BeltContainer>
      <BeltTitle style={{ color: belt.color }}>{belt.name}</BeltTitle>
      <DaysContainer>
        {belt.days.map((lesson) => {
          const isCompleted = completedDays.includes(lesson.day);
          const isActive = lesson.day === currentDay;
          const isAccessible = lesson.day <= currentDay || completedDays.includes(lesson.day - 1);

          return (
            <DayCard
              key={lesson.day}
              to={`/lesson/day${lesson.day}`}
              isCompleted={isCompleted}
              isActive={isActive}
              isAccessible={isAccessible}
            >
              <DayTitle>Day {lesson.day}</DayTitle>
              <DayDescription>{lesson.title}</DayDescription>
            </DayCard>
          );
        })}
      </DaysContainer>
    </BeltContainer>
  );
};

export default BeltProgress;
