import { useState, useCallback } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useNotes } from './hooks/useNotes';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      openFiles: () => Promise<{
        files: { path: string; name: string; ext: string; content: string }[];
        errors: { path: string; error: string }[];
        canceled: boolean;
      }>;
    };
  }
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function TitleBar({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`
        titlebar-drag h-9 flex items-center px-4 select-none shrink-0
        ${isDark ? 'bg-black/20' : 'bg-black/5'}
      `}
    >
      <span
        className={`
          text-xs font-semibold tracking-wider
          ${isDark ? 'text-gray-500' : 'text-gray-400'}
        `}
      >
        NoTex
      </span>
    </div>
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`
            px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            backdrop-blur-xl border animate-[fadeInUp_0.3s_ease]
            ${
              t.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-400/30 text-white'
                : 'bg-red-500/90 border-red-400/30 text-white'
            }
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const {
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
  } = useNotes();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('notex_sidebar_collapsed') === 'true';
  });
  const toastIdRef = { current: 0 };

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('notex_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const handleImport = useCallback(async () => {
    if (!window.electronAPI) {
      showToast('Import is only available in the Electron app', 'error');
      return;
    }

    try {
      const result = await window.electronAPI.openFiles();
      if (result.canceled || result.files.length === 0) return;

      const importItems: { title: string; content: string }[] = [];
      const failedFiles: string[] = [];

      for (const file of result.files) {
        const ext = file.ext.toLowerCase();

        if (ext === '.txt' || ext === '.md') {
          importItems.push({ title: file.name, content: file.content });
        } else if (ext === '.json') {
          try {
            const parsed = JSON.parse(file.content);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            let foundValid = false;
            for (const item of items) {
              if (item && typeof item === 'object' && (item.title || item.name)) {
                const title = item.title || item.name || file.name;
                const content = item.content || item.body || item.text || '';
                importItems.push({ title: String(title), content: String(content) });
                foundValid = true;
              }
            }
            if (!foundValid) {
              failedFiles.push(`${file.name} (unrecognized JSON structure)`);
            }
          } catch {
            failedFiles.push(`${file.name} (invalid JSON)`);
          }
        } else {
          failedFiles.push(`${file.name} (unsupported file type)`);
        }
      }

      if (result.errors && result.errors.length > 0) {
        for (const err of result.errors) {
          const name = err.path.split(/[/\\]/).pop() || err.path;
          failedFiles.push(`${name} (${err.error})`);
        }
      }

      if (importItems.length > 0) {
        const count = importNotes(importItems);
        showToast(`${count} note${count !== 1 ? 's' : ''} imported`, 'success');
      }

      if (failedFiles.length > 0) {
        showToast(`Failed: ${failedFiles.join(', ')}`, 'error');
      }
    } catch (err) {
      showToast('Import failed unexpectedly', 'error');
    }
  }, [importNotes, showToast]);

  return (
    <div className="flex flex-col h-full">
      <TitleBar isDark={isDark} />

      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar with CSS transition */}
        <div
          className="shrink-0 overflow-hidden"
          style={{
            width: sidebarCollapsed ? 0 : 288,
            transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Sidebar
            notes={notes}
            folders={folders}
            activeNoteId={activeNoteId}
            searchQuery={searchQuery}
            expandedFolders={expandedFolders}
            isDark={isDark}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            onSearchChange={setSearchQuery}
            onCreateNote={() => createNote()}
            onCreateFolder={createFolder}
            onImport={handleImport}
            onSelectNote={setActiveNoteId}
            onDeleteNote={deleteNote}
            onMoveNote={moveNote}
            onToggleFolder={toggleFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
            onToggleTheme={toggleTheme}
          />
        </div>

        {/* Floating expand button when sidebar is collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className={`
              absolute top-2 left-2 z-50 p-2 rounded-lg
              transition-colors duration-200 cursor-pointer
              ${isDark
                ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200'
                : 'bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-700'}
            `}
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <NoteEditor
          note={activeNote}
          folders={folders}
          isDark={isDark}
          onUpdate={updateNote}
          onDebouncedUpdate={debouncedUpdateNote}
          onMoveNote={moveNote}
          onDelete={deleteNote}
        />
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
