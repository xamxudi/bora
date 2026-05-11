import React, { createContext, useContext, useState, useEffect } from 'react';

const UIModeContext = createContext();
export const useUIMode = () => {
  const context = useContext(UIModeContext);
  if (!context) {
    throw new Error('useUIMode must be used within a UIModeProvider');
  }
  return context;
};

export const UIModeProvider = ({ children }) => {
  // Lấy UI mode từ localStorage hoặc mặc định là "basic"
  const [uiMode, setUIMode] = useState(() => {
    const savedMode = localStorage.getItem('ui-mode');
    return savedMode || 'basic';
  });

  // Lưu UI mode vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('ui-mode', uiMode);
  }, [uiMode]);

  const toggleUIMode = () => {
    setUIMode(prevMode => prevMode === 'basic' ? 'advanced' : 'basic');
  };

  const setUIMode_manual = (mode) => {
    if (mode === 'basic' || mode === 'advanced') {
      setUIMode(mode);
    }
  };

  const value = {
    uiMode,
    toggleUIMode,
    setUIMode: setUIMode_manual,
    isBasicMode: uiMode === 'basic',
    isAdvancedMode: uiMode === 'advanced'
  };

  return (
    <UIModeContext.Provider value={value}>
      {children}
    </UIModeContext.Provider>
  );
};