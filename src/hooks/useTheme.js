import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Force dark theme only
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    // Always add dark class
    root.classList.add('dark');
  }, []);

  return [theme, setTheme];
};
