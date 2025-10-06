import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || THEMES.LIGHT;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === THEMES.DARK }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
