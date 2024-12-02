import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const AssessmentContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
`;

const ProjectForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  min-height: 150px;
  font-family: 'Monaco', monospace;
`;

const SubmitButton = styled(motion.button)`
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: #45a049;
  }
`;

const Badge = styled(motion.div)`
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-top: 20px;
`;

const BadgeIcon = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
`;

const whiteToYellowProject = {
  title: "White Belt Final Project",
  description: "Create a program that combines the concepts you've learned in the White Belt course:",
  requirements: [
    "Use input/output operations",
    "Implement conditional statements",
    "Handle basic calculations",
    "Include proper error handling",
    "Add helpful user prompts"
  ],
  template: `# White Belt Final Project
# Create a program that:
# 1. Takes user input
# 2. Uses if/else statements
# 3. Performs calculations
# 4. Provides clear output

# Your code here:
`
};

const BeltAssessment = ({ currentBelt, onBeltComplete }) => {
  const [code, setCode] = useState(whiteToYellowProject.template);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Here you would typically send the code to be evaluated
    // For now, we'll simulate success
    setSubmitted(true);
    
    // Animate and update belt status
    setTimeout(() => {
      onBeltComplete('yellow');
    }, 2000);
  };

  return (
    <AssessmentContainer>
      <Title>Belt Assessment</Title>
      {!submitted ? (
        <ProjectForm onSubmit={handleSubmit}>
          <div>
            <h3>{whiteToYellowProject.title}</h3>
            <p>{whiteToYellowProject.description}</p>
            <ul>
              {whiteToYellowProject.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          <TextArea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
          />
          <SubmitButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Submit Project
          </SubmitButton>
        </ProjectForm>
      ) : (
        <AnimatePresence>
          <Badge
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BadgeIcon>🥋</BadgeIcon>
            <h3>Congratulations!</h3>
            <p>You've earned your Yellow Belt!</p>
            <p>Continue your journey with new challenges.</p>
          </Badge>
        </AnimatePresence>
      )}
    </AssessmentContainer>
  );
};

export default BeltAssessment;
