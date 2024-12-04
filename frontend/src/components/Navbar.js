import React from 'react';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  background: #2d2d2d;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavbarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled.a`
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #FFD700;
  }
`;

function Navbar() {
  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo>HackDojo</Logo>
        <NavLinks>
          <NavLink href="#">Lessons</NavLink>
          <NavLink href="#">Dashboard</NavLink>
          <NavLink href="#">Profile</NavLink>
          <NavLink href="#">Logout</NavLink>
        </NavLinks>
      </NavbarContent>
    </NavbarContainer>
  );
}

export default Navbar;
