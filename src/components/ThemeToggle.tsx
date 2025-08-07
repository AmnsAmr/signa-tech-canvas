import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleDarkMode}
      className="h-9 w-9 p-0 hover:bg-primary/10 transition-all duration-300"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        <Sun className={`h-4 w-4 absolute transition-all duration-300 ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
        <Moon className={`h-4 w-4 absolute transition-all duration-300 ${isDarkMode ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
      </div>
    </Button>
  );
};

export default ThemeToggle;