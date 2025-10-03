import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      applyTheme(savedTheme, false);
    } else {
      applyTheme('dark', false);
    }
  }, []);

  const applyTheme = (newTheme: Theme, animate = true) => {
    if (animate) {
      setIsTransitioning(true);
      document.body.classList.add('dark-mode-switch');
    }

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (animate) {
      setTimeout(() => {
        setIsTransitioning(false);
        document.body.classList.remove('dark-mode-switch');
      }, 400);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme, true);
  };

  return {
    theme,
    toggleTheme,
    isTransitioning,
    setTheme: (newTheme: Theme) => applyTheme(newTheme, true)
  };
}
