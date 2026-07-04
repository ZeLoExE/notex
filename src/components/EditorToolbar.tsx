import { Bold, Italic, Underline, Type, Palette } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface EditorToolbarProps {
  isDark: boolean;
  getCursorFontSize: () => number | null;
  onApplyFontSize: (size: number) => void;
  onTextColor: (color: string) => void;
}

const TEXT_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
];

function execCmd(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function EditorToolbar({
  isDark,
  getCursorFontSize,
  onApplyFontSize,
  onTextColor,
}: EditorToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const syncFromCursor = useCallback(() => {
    const size = getCursorFontSize();
    if (size !== null) setFontSize(size);
  }, [getCursorFontSize]);

  useEffect(() => {
    document.addEventListener('selectionchange', syncFromCursor);
    return () => document.removeEventListener('selectionchange', syncFromCursor);
  }, [syncFromCursor]);

  // Use onInput (not onChange) — fires on every keystroke AND spinner click
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const raw = (e.target as HTMLInputElement).value;
    const val = parseInt(raw, 10);
    if (isNaN(val)) return;
    const clamped = Math.max(8, Math.min(72, val));
    setFontSize(clamped);
    onApplyFontSize(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const btnBase = `
    p-1.5 rounded-lg transition-colors duration-200 cursor-pointer
    ${isDark
      ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200'
      : 'hover:bg-black/5 text-gray-500 hover:text-gray-700'}
  `;

  const inputBase = `
    w-16 text-center text-xs py-0.5 rounded-md border outline-none
    transition-colors duration-200
    ${isDark
      ? 'bg-white/5 border-white/10 text-white focus:border-purple-500/50'
      : 'bg-white/70 border-gray-200 text-gray-800 focus:border-blue-400'}
  `;

  return (
    <div className={`flex items-center gap-1 flex-wrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
      <button onClick={() => execCmd('bold')} className={btnBase} title="Bold"><Bold size={16} /></button>
      <button onClick={() => execCmd('italic')} className={btnBase} title="Italic"><Italic size={16} /></button>
      <button onClick={() => execCmd('underline')} className={btnBase} title="Underline"><Underline size={16} /></button>

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      <Type size={14} className="opacity-60" />
      <input
        type="number"
        min={8}
        max={72}
        step={1}
        value={fontSize}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={inputBase}
        title="Font size (8–72px)"
      />
      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>px</span>

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      <div className="relative">
        <button onClick={() => setShowColors(p => !p)} className={btnBase} title="Text Color">
          <Palette size={16} />
        </button>
        {showColors && (
          <div className={`absolute top-full left-0 mt-1 p-2 rounded-xl z-50 flex gap-1.5 ${isDark ? 'glass-dark shadow-xl' : 'glass-light shadow-lg'}`}>
            {TEXT_COLORS.map(c => (
              <button
                key={c.value || 'default'}
                onClick={() => {
                  if (c.value) execCmd('foreColor', c.value);
                  else execCmd('removeFormat');
                  setShowColors(false);
                }}
                className="w-6 h-6 rounded-full border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value || (isDark ? '#e2e8f0' : '#1f2937') }}
                title={c.label}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
