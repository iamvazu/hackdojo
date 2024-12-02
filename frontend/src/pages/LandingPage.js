import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  color: white;
`;

const Header = styled.header`
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled(Link)`
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.primary {
    background: #4caf50;
    color: white;
    &:hover {
      background: #43a047;
    }
  }
  
  &.secondary {
    border: 2px solid #4caf50;
    color: white;
    &:hover {
      background: rgba(76, 175, 80, 0.1);
    }
  }
`;

const Hero = styled.section`
  padding: 4rem 2rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  
  span {
    color: #4caf50;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Feature = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #4caf50;
  }
  
  p {
    opacity: 0.9;
    line-height: 1.6;
  }
`;

const CTASection = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.05);
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 1rem 3rem;
  font-size: 1.25rem;
  background: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #43a047;
    transform: translateY(-2px);
  }
`;

function LandingPage() {
  return (
    <Container>
      <Header>
        <Logo>HackDojo</Logo>
        <Nav>
          <NavButton to="/login" className="secondary">Login</NavButton>
          <NavButton to="/register" className="primary">Sign Up</NavButton>
        </Nav>
      </Header>

      <Hero>
        <Title>
          Learn to Code with <span>AI-Powered</span> Guidance
        </Title>
        <Subtitle>
          Transform your child into a coding ninja through interactive lessons and personalized mentoring
        </Subtitle>
        <CTAButton to="/register">Start Learning Today</CTAButton>
      </Hero>

      <Features>
        <Feature>
          <h3>Interactive Python Learning</h3>
          <p>
            Step-by-step lessons designed to make programming fun and engaging for children.
            Build real projects and games while learning fundamental coding concepts.
          </p>
        </Feature>

        <Feature>
          <h3>AI Sensei Guidance</h3>
          <p>
            Get instant help from our AI Sensei who provides personalized explanations
            and guidance when stuck on challenging problems.
          </p>
        </Feature>

        <Feature>
          <h3>Belt Progression System</h3>
          <p>
            Progress through different belt levels as you master new skills.
            Track achievements and earn badges for completing challenges.
          </p>
        </Feature>
      </Features>

      <CTASection>
        <Title>Ready to Begin the Journey?</Title>
        <Subtitle>Join thousands of young coders mastering Python with HackDojo</Subtitle>
        <CTAButton to="/register">Create Free Account</CTAButton>
      </CTASection>
    </Container>
  );
}

export default LandingPage;
