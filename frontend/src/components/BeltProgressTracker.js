import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaLock, FaCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BeltsContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 0;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const BeltCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  min-width: 120px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.$isActive ? '#f8f9fa' : 'transparent'};
  border: 2px solid ${props => props.$isActive ? '#007bff' : 'transparent'};
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #f8f9fa;
  }
`;

const BeltIcon = styled.div`
  width: 60px;
  height: 12px;
  background-color: ${props => props.$color || '#f8f9fa'};
  border-radius: 6px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${props => props.$isCompleted ? '#28a745' : props.$color || '#f8f9fa'};
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const BeltTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
`;

const Progress = styled.span`
  font-size: 0.8rem;
  color: #6c757d;
`;

const DaysContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  justify-content: center;
`;

const StyledDayButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.$isLocked ? 'not-allowed' : 'pointer'};
  background-color: ${props => {
    if (props.$isLocked) return '#e9ecef';
    if (props.$isCompleted) return '#28a745';
    if (props.$isActive) return '#007bff';
    return '#fff';
  }};
  color: ${props => {
    if (props.$isLocked) return '#6c757d';
    if (props.$isCompleted || props.$isActive) return '#fff';
    return '#212529';
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: ${props => props.$isLocked ? 'none' : 'scale(1.1)'};
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const DayButton = ({ isCompleted, isLocked, isActive, ...props }) => (
  <StyledDayButton
    $isCompleted={isCompleted}
    $isLocked={isLocked}
    $isActive={isActive}
    {...props}
  />
);

const BeltProgressTracker = ({ onDaySelect, currentProgress }) => {
  const [selectedBelt, setSelectedBelt] = useState(null);
  const [expandedBelt, setExpandedBelt] = useState(null);
  const [belts, setBelts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBelts();
  }, []);

  const fetchBelts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/curriculum');
      console.log('API Response:', response.data); // Debug log
      
      if (!response.data || !Array.isArray(response.data.belts)) {
        throw new Error('Invalid curriculum data structure');
      }

      const transformedBelts = response.data.belts.map(belt => ({
        name: belt.displayName || belt.name,
        color: belt.color || '#f8f9fa',
        totalDays: belt.requiredDays || (belt.days ? belt.days.length : 0),
        completedDays: belt.days ? belt.days.filter(day => day.isCompleted).length : 0,
        isCompleted: false,
        days: (belt.days || []).map(day => ({
          ...day,
          isCompleted: day.isCompleted || false,
          isLocked: day.isLocked || false
        }))
      }));
      
      setBelts(transformedBelts);
      
      // Set initial selected belt
      if (currentProgress?.currentBelt) {
        const currentBelt = transformedBelts.find(b => 
          b.name.toLowerCase() === currentProgress.currentBelt.toLowerCase()
        );
        if (currentBelt) {
          setSelectedBelt(currentBelt.name);
          setExpandedBelt(currentBelt.name);
        }
      } else if (transformedBelts.length > 0) {
        setSelectedBelt(transformedBelts[0].name);
        setExpandedBelt(transformedBelts[0].name);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching belts:', error);
      setError('Failed to load belt progression. Please try again later.');
      setLoading(false);
    }
  };

  const handleBeltClick = (beltName) => {
    setSelectedBelt(beltName);
    setExpandedBelt(beltName);
  };

  const handleDayClick = (day) => {
    if (!day.isLocked) {
      onDaySelect({
        day_number: day.day,
        title: day.title,
        content: day.content,
        exercise: day.exercise
      });
    }
  };

  if (loading) return <Progress>Loading belt progression...</Progress>;
  if (error) return <Progress>{error}</Progress>;

  return (
    <Container>
      <BeltsContainer>
        {belts.map((belt) => (
          <BeltCard
            key={belt.name}
            $isActive={selectedBelt === belt.name}
            onClick={() => handleBeltClick(belt.name)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BeltIcon
              $color={belt.color}
              $isActive={selectedBelt === belt.name}
              $isCompleted={belt.isCompleted}
            />
            <BeltTitle>{belt.name}</BeltTitle>
            <Progress>
              {belt.completedDays} / {belt.totalDays} days
            </Progress>
          </BeltCard>
        ))}
      </BeltsContainer>

      <AnimatePresence mode="wait">
        {expandedBelt && (
          <DaysContainer
            key={expandedBelt}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {belts.find(b => b.name === expandedBelt)?.days.map((day) => (
              <DayButton
                key={day.day}
                isCompleted={day.isCompleted}
                isLocked={day.isLocked}
                isActive={currentProgress?.currentDay === day.day}
                onClick={() => handleDayClick(day)}
                whileHover={!day.isLocked ? { scale: 1.1 } : {}}
                whileTap={!day.isLocked ? { scale: 0.95 } : {}}
              >
                {day.isLocked ? <FaLock size={12} /> : day.day}
              </DayButton>
            ))}
          </DaysContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default BeltProgressTracker;
