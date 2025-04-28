import React from 'react';
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