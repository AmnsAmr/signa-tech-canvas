import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '@/config/api';

interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  border: string;
  secondary: string;
  muted: string;
  success: string;
  destructive: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
}

type ThemeSettings = ThemeColors;

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  previewTheme: (colors: Partial<ThemeColors>) => void;
  clearPreview: () => void;
  isLoading: boolean;
}

const defaultTheme: ThemeSettings = {
  primary: '270 85% 60%',
  accent: '320 85% 65%',
  background: '0 0% 99%',
  foreground: '260 20% 15%',
  card: '0 0% 100%',
  border: '260 10% 90%',
  secondary: '260 10% 95%',
  muted: '260 15% 50%',
  success: '150 60% 50%',
  destructive: '0 84% 60%',
  gradientStart: '270 85% 60%',
  gradientEnd: '320 85% 65%',
  gradientDirection: '135deg'
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
    Object.entries(themeSettings).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    // Apply dynamic gradients with proper direction handling
    const direction = themeSettings.gradientDirection || '135deg';
    const gradientPrimary = `linear-gradient(${direction}, hsl(${themeSettings.gradientStart}), hsl(${themeSettings.gradientEnd}))`;
    const gradientHero = `linear-gradient(${direction}, hsl(${themeSettings.gradientStart}) 0%, hsl(${themeSettings.gradientEnd}) 100%)`;
    const gradientSubtle = `linear-gradient(${direction}, hsl(${themeSettings.gradientStart} / 0.05) 0%, hsl(${themeSettings.gradientEnd} / 0.05) 100%)`;
    const gradientCard = `linear-gradient(145deg, hsl(${themeSettings.card}) 0%, hsl(${themeSettings.secondary}) 100%)`;
    
    root.style.setProperty('--gradient-primary', gradientPrimary);
    root.style.setProperty('--gradient-hero', gradientHero);
    root.style.setProperty('--gradient-subtle', gradientSubtle);
    root.style.setProperty('--gradient-card', gradientCard);
    
    // Force update gradient direction variable
    root.style.setProperty('--gradientDirection', direction);
    
    // Update shadow colors
    root.style.setProperty('--shadow-soft', `0 4px 20px hsl(${themeSettings.primary} / 0.1)`);
    root.style.setProperty('--shadow-medium', `0 8px 30px hsl(${themeSettings.primary} / 0.15)`);
    root.style.setProperty('--shadow-strong', `0 20px 40px hsl(${themeSettings.primary} / 0.2)`);
    root.style.setProperty('--shadow-glow', `0 0 40px hsl(${themeSettings.primary} / 0.3)`);
    root.style.setProperty('--shadow-pink', `0 8px 30px hsl(${themeSettings.accent} / 0.2)`);
  };

  const updateTheme = async (newTheme: Partial<ThemeSettings>) => {
    const updatedTheme = { ...theme, ...newTheme };

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
      setTheme(theme);
      throw error;
    }
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