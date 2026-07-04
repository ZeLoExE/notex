import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Icon
        size={48}
        className="mb-4 text-gray-400 dark:text-gray-500 opacity-60"
      />
      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
