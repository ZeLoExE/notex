import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-xl
        transition-colors duration-300 cursor-pointer
        ${
          isDark
            ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200'
            : 'hover:bg-black/5 text-gray-500 hover:text-gray-700'
        }
      `}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="text-sm font-medium">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}
