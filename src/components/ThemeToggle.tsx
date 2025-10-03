import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  onToggle?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export default function ThemeToggle({ 
  onToggle, 
  size = 'icon', 
  variant = 'ghost',
  showLabel = false 
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    document.body.classList.add('dark-mode-switch');
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    onToggle?.();
    
    setTimeout(() => {
      setIsAnimating(false);
      document.body.classList.remove('dark-mode-switch');
    }, 400);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={toggleTheme}
      className="relative overflow-hidden group theme-transition"
      disabled={isAnimating}
    >
      <div className={isAnimating ? 'theme-icon-rotate' : ''}>
        <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
      </div>
      {showLabel && (
        <span className="ml-2">{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Button>
  );
}
