import React from 'react';
import styled from 'styled-components';
import BeltSystem from './components/BeltSystem';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: #1e1e1e;
    color: #fff;
    line-height: 1.5;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

function App() {
  return (
    <AppContainer>
      <GlobalStyle />
      <Navbar />
      <MainContent>
        <BeltSystem />
      </MainContent>
      <Footer />
    </AppContainer>
  );
}

export default App;
