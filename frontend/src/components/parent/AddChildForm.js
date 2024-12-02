import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #666;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #43a047;
  }
  
  &:disabled {
    background: #bdbdbd;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
`;

function AddChildForm() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    school: '',
    goals: '',
    dreams: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create child profile');
      }

      setSuccess('Child profile created successfully!');
      setTimeout(() => {
        navigate('/parent/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Title>Create Child Profile</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Child's Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="age">Age</Label>
          <Input
            type="number"
            id="age"
            name="age"
            min="5"
            max="18"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="school">School</Label>
          <Input
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="goals">Learning Goals</Label>
          <TextArea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="What would your child like to learn?"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="dreams">Future Dreams</Label>
          <TextArea
            id="dreams"
            name="dreams"
            value={formData.dreams}
            onChange={handleChange}
            placeholder="What does your child dream of becoming?"
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </Button>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Form>
    </FormContainer>
  );
}

export default AddChildForm;
