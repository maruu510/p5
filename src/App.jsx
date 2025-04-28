import React from 'react';
import "./components/global.css";
import { AppProvider } from './context/AppContext.jsx';
import TuComponente from './components/TuComponente/TuComponente.jsx';

function App() {
  return (
    <AppProvider>
      <TuComponente />
    </AppProvider>
  );
}

export default App;