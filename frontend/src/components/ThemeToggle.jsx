import { MoonStar, SunMedium, Circle } from 'lucide-react';
import useTheme from '../hooks/useTheme.js';

const themeIcons = {
  light: SunMedium,
  dark: MoonStar,
  system: Circle,
};

const themeLabels = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const Icon = themeIcons[theme] ?? SunMedium;

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/60 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:text-white"
    >
      <Icon className="h-4 w-4" />
      <span>{themeLabels[theme] ?? 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;
