import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaMoon, FaSun } from 'react-icons/fa';

const STORAGE_KEY = 'theme';

// Saved choice first, otherwise follow the system preference
const getInitialTheme = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const label = isDark ? 'Activer le thème clair' : 'Activer le thème sombre';

  return (
    <Button
      variant="outline-secondary"
      size="sm"
      className={`theme-toggle ${className}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </Button>
  );
}