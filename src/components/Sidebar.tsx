import { useState, useRef } from 'react';
import { FileText, FolderPlus, Plus, SearchX, Upload, Inbox, PanelLeftClose } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { FolderItem } from './FolderItem';
import { NoteListItem } from './NoteListItem';
import { ThemeToggle } from './ThemeToggle';
import { EmptyState } from './EmptyState';
import type { Note, Folder } from '../types';

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  searchQuery: string;
  expandedFolders: Set<string>;
  isDark: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSearchChange: (query: string) => void;
  onCreateNote: () => void;
  onCreateFolder: () => void;
  onImport: () => void;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onMoveNote: (noteId: string, folderId: string | null) => void;
  onToggleFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onToggleTheme: () => void;
}

export function Sidebar({
  notes,
  folders,
  activeNoteId,
  searchQuery,
  expandedFolders,
  isDark,
  collapsed,
  onToggleCollapse,
  onSearchChange,
  onCreateNote,
  onCreateFolder,
  onImport,
  onSelectNote,
  onDeleteNote,
  onMoveNote,
  onToggleFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleTheme,
}: SidebarProps) {
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const uncategorizedDragRef = useRef<HTMLDivElement>(null);
  const [uncategorizedDragOver, setUncategorizedDragOver] = useState(false);

  // Filter notes by search
  const query = searchQuery.toLowerCase().trim();
  const filteredNotes = query
    ? notes.filter(n => {
        const titleMatch = n.title.toLowerCase().includes(query);
        const bodyText = n.content.replace(/<[^>]*>/g, '').toLowerCase();
        return titleMatch || bodyText.includes(query);
      })
    : notes;

  const filteredFolderIds = query
    ? new Set(
        folders
          .filter(f => filteredNotes.some(n => n.folderId === f.id))
          .map(f => f.id)
      )
    : null;

  const folderNotes = (folderId: string) =>
    filteredNotes.filter(n => n.folderId === folderId);

  const uncategorizedNotes = filteredNotes.filter(n => n.folderId === null);

  const hasNoNotes = notes.length === 0;
  const hasNoResults = query && filteredNotes.length === 0;

  const handleDragStartNote = (noteId: string) => {
    setDraggedNoteId(noteId);
  };

  const handleDragEndNote = () => {
    setDraggedNoteId(null);
    setUncategorizedDragOver(false);
  };

  const handleDropOnFolder = (noteId: string, folderId: string) => {
    onMoveNote(noteId, folderId);
    setDraggedNoteId(null);
  };

  const handleDropOnUncategorized = (e: React.DragEvent) => {
    e.preventDefault();
    setUncategorizedDragOver(false);
    const noteId = e.dataTransfer.getData('text/plain');
    if (noteId) {
      onMoveNote(noteId, null);
    }
    setDraggedNoteId(null);
  };

  const handleUncategorizedDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleUncategorizedDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setUncategorizedDragOver(true);
  };

  const handleUncategorizedDragLeave = (e: React.DragEvent) => {
    if (uncategorizedDragRef.current && !uncategorizedDragRef.current.contains(e.relatedTarget as Node)) {
      setUncategorizedDragOver(false);
    }
  };

  return (
    <aside
      className={`
        h-full flex flex-col shrink-0 transition-colors duration-300
        ${isDark ? 'glass-dark' : 'glass-light'}
      `}
      style={{ width: 288 }}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1
            className={`
              text-lg font-bold tracking-tight
              ${isDark ? 'text-white' : 'text-gray-800'}
            `}
          >
            NoTex
          </h1>
          <button
            onClick={onToggleCollapse}
            className={`
              p-1.5 rounded-lg transition-colors duration-200 cursor-pointer
              ${isDark ? 'hover:bg-white/10 text-gray-500 hover:text-gray-300' : 'hover:bg-black/5 text-gray-400 hover:text-gray-600'}
            `}
            title="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          isDark={isDark}
        />

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onCreateNote()}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
              text-sm font-medium transition-colors duration-200 cursor-pointer
              ${
                isDark
                  ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20'
                  : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 border border-blue-500/20'
              }
            `}
          >
            <Plus size={15} />
            New Note
          </button>
          <button
            onClick={onCreateFolder}
            className={`
              flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-sm font-medium transition-colors duration-200 cursor-pointer
              ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                  : 'bg-black/5 hover:bg-black/10 text-gray-500 border border-gray-200'
              }
            `}
            title="New Folder"
          >
            <FolderPlus size={15} />
          </button>
          <button
            onClick={onImport}
            className={`
              flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-sm font-medium transition-colors duration-200 cursor-pointer
              ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10'
                  : 'bg-black/5 hover:bg-black/10 text-gray-500 border border-gray-200'
              }
            `}
            title="Import Files"
          >
            <Upload size={15} />
          </button>
        </div>
      </div>

      {/* Notes/Folders list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {/* Empty states */}
        {hasNoNotes && !query && (
          <EmptyState
            icon={FileText}
            title="No notes yet"
            subtitle="Create your first note to get started"
          />
        )}
        {hasNoResults && (
          <EmptyState
            icon={SearchX}
            title="No notes found"
            subtitle="Try a different search term"
          />
        )}

        {/* Folders */}
        {!hasNoNotes &&
          folders.map(folder => {
            if (filteredFolderIds && !filteredFolderIds.has(folder.id)) return null;
            return (
              <FolderItem
                key={folder.id}
                id={folder.id}
                name={folder.name}
                notes={folderNotes(folder.id)}
                isExpanded={expandedFolders.has(folder.id)}
                activeNoteId={activeNoteId}
                isDark={isDark}
                draggedNoteId={draggedNoteId}
                onToggle={onToggleFolder}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
                onSelectNote={onSelectNote}
                onDeleteNote={onDeleteNote}
                onDropNote={handleDropOnFolder}
                onDragStartNote={handleDragStartNote}
                onDragEndNote={handleDragEndNote}
              />
            );
          })}

        {/* Uncategorized notes — also a drop zone */}
        {!hasNoNotes && (
          <div
            ref={uncategorizedDragRef}
            onDragOver={handleUncategorizedDragOver}
            onDragEnter={handleUncategorizedDragEnter}
            onDragLeave={handleUncategorizedDragLeave}
            onDrop={handleDropOnUncategorized}
            className={`
              mt-1 rounded-xl transition-all duration-200
              ${
                uncategorizedDragOver && draggedNoteId
                  ? isDark
                    ? 'bg-purple-500/10 border border-dashed border-purple-400/30'
                    : 'bg-blue-500/10 border border-dashed border-blue-400/30'
                  : 'border border-transparent'
              }
            `}
          >
            {!query && folders.length > 0 && (
              <p
                className={`
                  text-xs font-medium uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5
                  ${isDark ? 'text-gray-500' : 'text-gray-400'}
                `}
              >
                <Inbox size={12} />
                Uncategorized
                {uncategorizedDragOver && draggedNoteId && (
                  <span className="text-[10px] opacity-60">(drop here)</span>
                )}
              </p>
            )}
            <div className="space-y-0.5">
              {uncategorizedNotes.map(note => (
                <NoteListItem
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  updatedAt={note.updatedAt}
                  isActive={note.id === activeNoteId}
                  isDark={isDark}
                  onSelect={onSelectNote}
                  onDelete={onDeleteNote}
                  onDragStart={handleDragStartNote}
                  onDragEnd={handleDragEndNote}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme toggle at bottom */}
      <div
        className={`p-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
      >
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </aside>
  );
}
