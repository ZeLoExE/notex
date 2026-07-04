import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
}

export function SearchBar({ value, onChange, isDark }: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}
      />
      <input
        type="text"
        placeholder="Search notes..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`
          w-full pl-9 pr-8 py-2.5 rounded-xl text-sm
          transition-colors duration-300
          ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50'
              : 'bg-white/70 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
          }
          outline-none
        `}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer ${
            isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
