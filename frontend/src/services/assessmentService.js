import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const submitBeltAssessment = async (code, currentBelt) => {
  try {
    const response = await axios.post(`${BASE_URL}/submit-assessment`, {
      code,
      currentBelt
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit assessment');
  }
};

export const getBeltRequirements = (belt) => {
  const requirements = {
    white: {
      title: "White Belt Final Project",
      description: "Create a program that combines the concepts you've learned in the White Belt course:",
      requirements: [
        "Use input/output operations",
        "Implement conditional statements",
        "Handle basic calculations",
        "Include proper error handling",
        "Add helpful user prompts"
      ]
    },
    yellow: {
      title: "Yellow Belt Final Project",
      description: "Create an advanced program showcasing your Yellow Belt skills:",
      requirements: [
        "Use loops effectively",
        "Implement multiple functions",
        "Handle complex calculations",
        "Include data validation",
        "Create an interactive user experience"
      ]
    }
  };

  return requirements[belt] || null;
};
