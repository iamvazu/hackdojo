import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const AnimationContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
`;

const Belt = styled(motion.div)`
  width: 300px;
  height: 60px;
  background: ${props => props.color};
  border-radius: 10px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: #333;
    border-radius: 50%;
  }
`;

const beltColors = {
  white: '#f5f5f5',
  yellow: '#ffd700',
  orange: '#ffa500',
};

const BeltAnimation = ({ newBelt, onComplete }) => {
  return (
    <AnimationContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Belt
        color={beltColors[newBelt]}
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: 1,
          rotate: 0,
          transition: {
            duration: 1,
            type: 'spring',
            stiffness: 100
          }
        }}
        onAnimationComplete={onComplete}
      />
    </AnimationContainer>
  );
};

export default BeltAnimation;
