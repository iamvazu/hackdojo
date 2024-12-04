import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #2d2d2d;
  padding: 1rem 2rem;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);
  position: sticky;
  bottom: 0;
  z-index: 1000;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterText = styled.p`
  color: #fff;
  margin: 0;
  font-size: 0.9rem;
`;

const FooterLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #FFD700;
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>© 2023 HackDojo</FooterText>
        <FooterLink href="#">Help</FooterLink>
        <FooterLink href="#">Terms</FooterLink>
        <FooterLink href="#">Privacy</FooterLink>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;
