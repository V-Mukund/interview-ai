'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Apply theme to HTML
  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;

    html.classList.remove('light', 'dark');
    html.classList.add(newTheme);

    // Safe body styling to preserve other classes (e.g. font classes)
    document.body.classList.remove('bg-black', 'bg-white', 'text-white', 'text-black');
    document.body.classList.add(
      newTheme === 'dark' ? 'bg-black' : 'bg-white',
      newTheme === 'dark' ? 'text-white' : 'text-black'
    );
  };

  // Load saved theme on startup
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem('app-theme') as Theme) || 'dark';

    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Set theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    localStorage.setItem('app-theme', newTheme);

    applyTheme(newTheme);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}