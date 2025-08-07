import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleClick = () => {
    console.log('Dark mode toggle clicked, current state:', isDarkMode);
    toggleDarkMode();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="h-9 w-9 p-0 hover:bg-primary/10 transition-all duration-300"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;