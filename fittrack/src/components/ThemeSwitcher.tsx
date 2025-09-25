'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Button from '@/components/Button';

// Simple icons for theme switcher
const SunIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SystemIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only render after hydration to prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { name: 'light', icon: <SunIcon />, label: 'Light' },
    { name: 'dark', icon: <MoonIcon />, label: 'Dark' },
    { name: 'system', icon: <SystemIcon />, label: 'System' },
  ] as const;

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
      {themes.map((themeOption) => (
        <Button
          key={themeOption.name}
          variant={theme === themeOption.name ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTheme(themeOption.name)}
          className="flex items-center gap-1.5"
        >
          {themeOption.icon}
          <span className="hidden sm:inline">{themeOption.label}</span>
        </Button>
      ))}
    </div>
  );
}