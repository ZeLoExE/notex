import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note, Folder } from '../types';

const NOTES_KEY = 'notex_notes';
const FOLDERS_KEY = 'notex_folders';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => loadFromStorage(NOTES_KEY, []));
  const [folders, setFolders] = useState<Folder[]>(() => loadFromStorage(FOLDERS_KEY, []));
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  }, [folders]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const createNote = useCallback((folderId: string | null = null) => {
    const newNote: Note = {
      id: generateId(),
      title: '',
      content: '',
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    if (folderId) {
      setExpandedFolders(prev => new Set(prev).add(folderId));
    }
    return newNote.id;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
      )
    );
  }, []);

  // Debounced save for content changes
  const debouncedUpdateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateNote(id, updates);
    }, 300);
  }, [updateNote]);

  const moveNote = useCallback((noteId: string, folderId: string | null) => {
    updateNote(noteId, { folderId });
  }, [updateNote]);

  const createFolder = useCallback(() => {
    const newFolder: Folder = {
      id: generateId(),
      name: 'New Folder',
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
    setExpandedFolders(prev => new Set(prev).add(newFolder.id));
    return newFolder.id;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    // Move all notes in this folder to uncategorized
    setNotes(prev =>
      prev.map(n =>
        n.folderId === id ? { ...n, folderId: null } : n
      )
    );
    setFolders(prev => prev.filter(f => f.id !== id));
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, name } : f))
    );
  }, []);

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const importNotes = useCallback((items: { title: string; content: string }[]) => {
    const now = Date.now();
    const newNotes: Note[] = items.map((item, i) => ({
      id: generateId() + i,
      title: item.title,
      content: item.content,
      folderId: null,
      createdAt: now,
      updatedAt: now,
    }));
    setNotes(prev => [...newNotes, ...prev]);
    return newNotes.length;
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId) ?? null;

  return {
    notes,
    folders,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    searchQuery,
    setSearchQuery,
    expandedFolders,
    createNote,
    deleteNote,
    updateNote,
    debouncedUpdateNote,
    moveNote,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleFolder,
    importNotes,
  };
}
