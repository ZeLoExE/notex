import { FileText, Trash2, GripVertical } from 'lucide-react';

interface NoteListItemProps {
  id: string;
  title: string;
  updatedAt: number;
  isActive: boolean;
  isDark: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart?: (noteId: string) => void;
  onDragEnd?: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function NoteListItem({
  id,
  title,
  updatedAt,
  isActive,
  isDark,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
}: NoteListItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      onDelete(id);
    }
  };

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(id);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => onSelect(id)}
      className={`
        w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5
        transition-all duration-200 group cursor-pointer select-none
        ${
          isActive
            ? isDark
              ? 'bg-purple-500/20 border border-purple-400/30 text-white'
              : 'bg-blue-500/15 border border-blue-400/30 text-gray-800'
            : isDark
              ? 'hover:bg-white/5 text-gray-300 border border-transparent'
              : 'hover:bg-black/5 text-gray-600 border border-transparent'
        }
      `}
    >
      <GripVertical
        size={14}
        className={`shrink-0 opacity-0 group-hover:opacity-40 transition-opacity ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}
      />
      <FileText size={15} className="shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {title || 'Untitled'}
        </p>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {formatRelativeTime(updatedAt)}
        </p>
      </div>
      <button
        onClick={handleDelete}
        className={`
          opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg
          transition-all duration-200 cursor-pointer
          ${
            isDark
              ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400'
              : 'hover:bg-red-500/10 text-gray-400 hover:text-red-500'
          }
        `}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
