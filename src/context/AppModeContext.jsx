import React, { createContext, useContext, useState, useEffect } from 'react';

const AppModeContext = createContext();

export function AppModeProvider({ children }) {
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('spectr_app_mode') || 'academy'; // default to academy per new pivot
  });

  useEffect(() => {
    localStorage.setItem('spectr_app_mode', appMode);
    
    // Optional: add a class to the body to globally style based on mode
    if (appMode === 'academy') {
      document.body.classList.add('mode-academy');
      document.body.classList.remove('mode-terminal');
    } else {
      document.body.classList.add('mode-terminal');
      document.body.classList.remove('mode-academy');
    }
  }, [appMode]);

  const toggleMode = () => {
    setAppMode(prev => prev === 'academy' ? 'terminal' : 'academy');
  };

  const setMode = (mode) => {
    if (mode === 'academy' || mode === 'terminal') {
      setAppMode(mode);
    }
  };

  return (
    <AppModeContext.Provider value={{ appMode, toggleMode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
