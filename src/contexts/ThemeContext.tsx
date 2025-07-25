import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '@/config/api';

interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  border: string;
}

interface ThemeSettings {
  colors: ThemeColors;
  darkMode: boolean;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  toggleDarkMode: () => void;
  resetTheme: () => void;
  previewTheme: (colors: Partial<ThemeColors>) => void;
  clearPreview: () => void;
  isLoading: boolean;
}

const defaultTheme: ThemeSettings = {
  colors: {
    primary: '270 85% 60%',
    accent: '320 85% 65%',
    background: '0 0% 99%',
    foreground: '260 20% 15%',
    card: '0 0% 100%',
    border: '260 10% 90%'
  },
  darkMode: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const loadTheme = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/theme'));
      if (response.ok) {
        const savedTheme = await response.json();
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(themeSettings.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply dark mode
    if (themeSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const updateTheme = async (newTheme: Partial<ThemeSettings>) => {
    const updatedTheme = {
      ...theme,
      ...newTheme,
      colors: { ...theme.colors, ...newTheme.colors }
    };

    // Optimistically update the theme
    setTheme(updatedTheme);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/admin/theme'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedTheme)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save theme');
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      // Revert to previous theme on error
      setTheme(theme);
      throw error;
    }
  };

  const toggleDarkMode = () => {
    updateTheme({ darkMode: !theme.darkMode });
  };

  const resetTheme = () => {
    updateTheme(defaultTheme);
  };

  const previewTheme = (colors: Partial<ThemeColors>) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${key}`, value);
      }
    });
  };

  const clearPreview = () => {
    applyTheme(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        toggleDarkMode,
        resetTheme,
        previewTheme,
        clearPreview,
        isLoading
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};