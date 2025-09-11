// src/context/AppContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wallet, setWallet] = useState(null);

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      language, setLanguage,
      activeTab, setActiveTab,
      isSidebarOpen, setIsSidebarOpen,
      wallet, setWallet
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);