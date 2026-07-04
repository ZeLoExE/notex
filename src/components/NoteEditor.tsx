import { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TiptapImage from '@tiptap/extension-image';
import { PenLine, FolderInput, FolderMinus, Trash2 } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { EmptyState } from './EmptyState';
import { FontSize } from '../extensions/FontSize';
import type { Note, Folder } from '../types';

interface NoteEditorProps {
  note: Note | null;
  folders: Folder[];
  isDark: boolean;
  onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onDebouncedUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  onMoveNote: (noteId: string, folderId: string | null) => void;
  onDelete: (id: string) => void;
}

export function NoteEditor({
  note,
  folders,
  isDark,
  onUpdate,
  onDebouncedUpdate,
  onMoveNote,
  onDelete,
}: NoteEditorProps) {
  const [moveDropdownOpen, setMoveDropdownOpen] = useState(false);
  const moveDropdownRef = useRef<HTMLDivElement>(null);
  const lastNoteIdRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontSize,
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: note?.content || '',
    editorProps: {
      attributes: {
        class: `min-h-[400px] outline-none leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (!note) return;
      const html = editor.getHTML();
      onDebouncedUpdate(note.id, { content: html });
    },
  });

  // Sync editor content when active note changes
  useEffect(() => {
    if (!editor || !note) return;
    if (note.id !== lastNoteIdRef.current) {
      lastNoteIdRef.current = note.id;
      const currentContent = editor.getHTML();
      if (currentContent !== note.content) {
        editor.commands.setContent(note.content || '');
      }
    }
  }, [editor, note?.id, note?.content]);

  // Click-outside for move dropdown
  useEffect(() => {
    if (!moveDropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (moveDropdownRef.current && !moveDropdownRef.current.contains(e.target as Node)) {
        setMoveDropdownOpen(false);
      }
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoveDropdownOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [moveDropdownOpen]);

  const handleDelete = () => {
    if (note && window.confirm('Delete this note?')) onDelete(note.id);
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon={PenLine} title="Select a note" subtitle="Choose a note from the sidebar or create a new one" />
      </div>
    );
  }

  const currentFolder = folders.find(f => f.id === note.folderId);
  const handleMoveToFolder = (folderId: string | null) => {
    onMoveNote(note.id, folderId);
    setMoveDropdownOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Top bar */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          {currentFolder && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
              {currentFolder.name}
            </span>
          )}

          {/* Move dropdown — click-based */}
          <div className="relative" ref={moveDropdownRef}>
            <button
              onClick={() => setMoveDropdownOpen(p => !p)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-black/5 text-gray-500'}`}
            >
              <FolderInput size={14} />
              Move to...
            </button>
            {moveDropdownOpen && (
              <div className={`absolute top-full left-0 mt-1 py-1 rounded-xl z-50 min-w-[180px] ${isDark ? 'glass-dark shadow-xl' : 'glass-light shadow-lg'}`}>
                {note.folderId && (
                  <button onClick={() => handleMoveToFolder(null)} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 cursor-pointer ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600'}`}>
                    <FolderMinus size={14} />
                    Uncategorized
                  </button>
                )}
                {folders.map(f => (
                  <button key={f.id} onClick={() => handleMoveToFolder(f.id)} className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 cursor-pointer ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-black/5 text-gray-600'} ${f.id === note.folderId ? 'opacity-50' : ''}`} disabled={f.id === note.folderId}>
                    {f.name}
                  </button>
                ))}
                {folders.length === 0 && <p className={`px-3 py-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No folders yet</p>}
              </div>
            )}
          </div>
        </div>

        <button onClick={handleDelete} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors duration-200 ${isDark ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400' : 'hover:bg-red-500/10 text-gray-400 hover:text-red-500'}`}>
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <input
            type="text"
            value={note.title}
            onChange={e => onUpdate(note.id, { title: e.target.value })}
            placeholder="Untitled"
            className={`w-full text-3xl font-bold bg-transparent border-none outline-none mb-4 ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-800 placeholder-gray-300'}`}
          />

          {editor && (
            <>
              <div className={`flex items-center gap-1 mb-4 pb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <EditorToolbar editor={editor} isDark={isDark} />
              </div>

              <EditorContent editor={editor} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
