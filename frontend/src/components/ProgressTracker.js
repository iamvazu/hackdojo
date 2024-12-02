import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WeekContainer = styled.div`
  margin-top: 20px;
`;

const WeekTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
`;

const Progress = styled.div`
  width: ${props => props.$percentage}%;
  height: 100%;
  background: ${props => props.$color || '#4CAF50'};
  border-radius: 10px;
  transition: width 0.3s ease;
`;

const LessonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0;
`;

const LessonItem = styled.li`
  padding: 8px;
  margin: 5px 0;
  background: ${props => props.$completed ? '#e8f5e9' : '#f5f5f5'};
  border-radius: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.$completed ? '#c8e6c9' : '#eeeeee'};
  }
`;

const CheckMark = styled.span`
  color: #4CAF50;
  margin-right: 10px;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Stat = styled.div`
  text-align: center;
  
  .number {
    font-size: 24px;
    font-weight: bold;
    color: #2196f3;
  }
  
  .label {
    font-size: 14px;
    color: #666;
  }
`;

function ProgressTracker({ curriculum, currentWeek, currentDay, completedLessons = [], onSelectLesson }) {
  // Return early if curriculum is not loaded
  if (!curriculum) {
    return (
      <ProgressContainer>
        <div>Loading curriculum...</div>
      </ProgressContainer>
    );
  }

  const totalLessons = Object.values(curriculum).reduce(
    (total, week) => total + week.lessons.length,
    0
  );
  
  const progressPercentage = (completedLessons.length / totalLessons) * 100;

  return (
    <ProgressContainer>
      <ProgressStats>
        <Stat>
          <div className="number">{completedLessons.length}</div>
          <div className="label">Completed</div>
        </Stat>
        <Stat>
          <div className="number">{totalLessons}</div>
          <div className="label">Total Lessons</div>
        </Stat>
        <Stat>
          <div className="number">{Math.round(progressPercentage)}%</div>
          <div className="label">Progress</div>
        </Stat>
      </ProgressStats>

      <ProgressBar>
        <Progress $percentage={progressPercentage} />
      </ProgressBar>

      {Object.entries(curriculum).map(([weekId, weekData]) => (
        <WeekContainer key={weekId}>
          <WeekTitle>{weekData.title}</WeekTitle>
          <LessonList>
            {weekData.lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.day);
              return (
                <LessonItem
                  key={lesson.day}
                  $completed={isCompleted}
                  $active={currentWeek === weekId && currentDay === lesson.day}
                  onClick={() => onSelectLesson(weekId, lesson.day)}
                >
                  {isCompleted && <CheckMark>✓</CheckMark>}
                  Day {lesson.day}: {lesson.title}
                </LessonItem>
              );
            })}
          </LessonList>
        </WeekContainer>
      ))}
    </ProgressContainer>
  );
}

export default ProgressTracker;
