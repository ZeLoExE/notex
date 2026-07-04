import { Bold, Italic, Underline, Type, Palette, Image } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor;
  isDark: boolean;
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

export function EditorToolbar({ editor, isDark }: EditorToolbarProps) {
  const [showColors, setShowColors] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Read font size from current selection
  const syncFontSize = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const attrs = editor.getAttributes('textStyle');
    if (attrs.style) {
      const match = attrs.style.match(/font-size:\s*(\d+)px/);
      if (match) {
        setFontSize(parseInt(match[1], 10));
        return;
      }
    }
    // No inline font-size at cursor — default to 16
    setFontSize(16);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', syncFontSize);
    editor.on('transaction', syncFontSize);
    return () => {
      editor.off('selectionUpdate', syncFontSize);
      editor.off('transaction', syncFontSize);
    };
  }, [editor, syncFontSize]);

  const handleFontSizeInput = (e: React.FormEvent<HTMLInputElement>) => {
    const raw = (e.target as HTMLInputElement).value;
    const val = parseInt(raw, 10);
    if (isNaN(val)) return;
    const clamped = Math.max(8, Math.min(72, val));
    setFontSize(clamped);
    editor.chain().focus().setFontSize(`${clamped}px`).run();
  };

  const handleFontSizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please use an image under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const btnBase = `
    p-1.5 rounded-lg transition-colors duration-200 cursor-pointer
    ${isDark
      ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200'
      : 'hover:bg-black/5 text-gray-500 hover:text-gray-700'}
  `;

  const btnActive = `
    p-1.5 rounded-lg cursor-pointer
    ${isDark ? 'bg-white/15 text-white' : 'bg-black/10 text-gray-800'}
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
      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? btnActive : btnBase}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? btnActive : btnBase}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      {/* Underline */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? btnActive : btnBase}
        title="Underline"
      >
        <Underline size={16} />
      </button>

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      {/* Font size */}
      <Type size={14} className="opacity-60" />
      <input
        type="number"
        min={8}
        max={72}
        step={1}
        value={fontSize}
        onInput={handleFontSizeInput}
        onKeyDown={handleFontSizeKeyDown}
        className={inputBase}
        title="Font size (8–72px)"
      />
      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>px</span>

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      {/* Text color */}
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
                  if (c.value) {
                    editor.chain().focus().setColor(c.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
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

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      {/* Image */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <button
        onClick={() => imageInputRef.current?.click()}
        className={btnBase}
        title="Insert Image"
      >
        <Image size={16} />
      </button>
    </div>
  );
}
