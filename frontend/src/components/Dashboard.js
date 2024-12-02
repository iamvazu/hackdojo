import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const BeltDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const BeltImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const BeltInfo = styled.div`
  flex: 1;
`;

const BeltTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5em;
`;

const BeltSubtitle = styled.p`
  margin: 5px 0;
  color: #666;
`;

const ProgressSection = styled.div`
  margin: 20px 0;
`;

const ProgressBar = styled.div`
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.progress}%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9em;
`;

const beltColors = {
  white: {
    primary: '#f8f9fa',
    secondary: '#e9ecef',
    text: '#333'
  },
  yellow: {
    primary: '#ffd43b',
    secondary: '#fab005',
    text: '#333'
  },
  green: {
    primary: '#51cf66',
    secondary: '#40c057',
    text: '#fff'
  }
};

const Dashboard = ({ currentBelt, completedLessons, totalLessons, points, nextBelt }) => {
  const progress = (completedLessons.length / totalLessons) * 100;
  const pointsToNextBelt = nextBelt ? nextBelt.requiredPoints - points : 0;

  return (
    <DashboardContainer>
      <BeltDisplay>
        <BeltImage color={beltColors[currentBelt]?.primary || beltColors.white.primary}>
          🥋
        </BeltImage>
        <BeltInfo>
          <BeltTitle>{currentBelt.charAt(0).toUpperCase() + currentBelt.slice(1)} Belt</BeltTitle>
          <BeltSubtitle>
            {nextBelt ? `${pointsToNextBelt} points to ${nextBelt.name} belt` : 'Max belt achieved!'}
          </BeltSubtitle>
        </BeltInfo>
      </BeltDisplay>

      <ProgressSection>
        <BeltSubtitle>Progress to Next Belt</BeltSubtitle>
        <ProgressBar>
          <ProgressFill
            color={beltColors[currentBelt]?.secondary || beltColors.white.secondary}
            progress={progress}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </ProgressBar>
      </ProgressSection>

      <StatsGrid>
        <StatCard>
          <StatValue>{completedLessons.length}</StatValue>
          <StatLabel>Lessons Completed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalLessons - completedLessons.length}</StatValue>
          <StatLabel>Lessons Remaining</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{points}</StatValue>
          <StatLabel>Points Earned</StatLabel>
        </StatCard>
      </StatsGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
