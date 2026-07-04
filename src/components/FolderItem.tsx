import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Folder, Trash2, Pencil } from 'lucide-react';
import { NoteListItem } from './NoteListItem';
import type { Note } from '../types';

interface FolderItemProps {
  id: string;
  name: string;
  notes: Note[];
  isExpanded: boolean;
  activeNoteId: string | null;
  isDark: boolean;
  draggedNoteId: string | null;
  onToggle: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDropNote: (noteId: string, folderId: string) => void;
  onDragStartNote: (noteId: string) => void;
  onDragEndNote: () => void;
}

export function FolderItem({
  id,
  name,
  notes,
  isExpanded,
  activeNoteId,
  isDark,
  draggedNoteId,
  onToggle,
  onRename,
  onDelete,
  onSelectNote,
  onDeleteNote,
  onDropNote,
  onDragStartNote,
  onDragEndNote,
}: FolderItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(name);
    setIsEditing(true);
  };

  const handleRenameSubmit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== name) {
      onRename(id, trimmed);
    } else {
      setEditName(name);
    }
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete folder "${name}"? Notes inside will be moved to uncategorized.`)) {
      onDelete(id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCountRef.current = 0;
    setIsDragOver(false);
    const noteId = e.dataTransfer.getData('text/plain');
    if (noteId) {
      onDropNote(noteId, id);
    }
  };

  const isDropTarget = isDragOver && draggedNoteId;

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Folder header row */}
      <div
        className={`
          flex items-center gap-2 px-2 py-2 rounded-xl group cursor-pointer
          transition-all duration-200
          ${
            isDropTarget
              ? isDark
                ? 'bg-purple-500/20 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'bg-blue-500/15 border border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
              : isDragOver
                ? isDark
                  ? 'bg-white/8 border border-white/20'
                  : 'bg-black/8 border border-gray-300'
                : isDark
                  ? 'hover:bg-white/5 text-gray-300 border border-transparent'
                  : 'hover:bg-black/5 text-gray-600 border border-transparent'
          }
        `}
        onClick={() => {
          if (!isEditing) onToggle(id);
        }}
      >
        <ChevronRight
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
        <Folder size={16} className="shrink-0 opacity-60" />

        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRenameSubmit();
              }
              if (e.key === 'Escape') {
                setEditName(name);
                setIsEditing(false);
              }
            }}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            className={`
              flex-1 text-sm bg-transparent border-b outline-none min-w-0
              ${isDark ? 'border-purple-400 text-white' : 'border-blue-400 text-gray-800'}
            `}
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate">{name}</span>
        )}

        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            isDark ? 'bg-white/10 text-gray-500' : 'bg-black/5 text-gray-400'
          }`}
        >
          {notes.length}
        </span>

        {/* Actions — visible on hover */}
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          {!isEditing && (
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={startEditing}
              className={`p-1 rounded-lg cursor-pointer ${
                isDark ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-black/5 text-gray-400'
              }`}
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={handleDelete}
            className={`p-1 rounded-lg cursor-pointer ${
              isDark
                ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400'
                : 'hover:bg-red-500/10 text-gray-400 hover:text-red-500'
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Nested notes */}
      {isExpanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {notes.map(note => (
            <NoteListItem
              key={note.id}
              id={note.id}
              title={note.title}
              updatedAt={note.updatedAt}
              isActive={note.id === activeNoteId}
              isDark={isDark}
              onSelect={onSelectNote}
              onDelete={onDeleteNote}
              onDragStart={onDragStartNote}
              onDragEnd={onDragEndNote}
            />
          ))}
          {notes.length === 0 && (
            <p className={`text-xs pl-8 py-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              No notes yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
