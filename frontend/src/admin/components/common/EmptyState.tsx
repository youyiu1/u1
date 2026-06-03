import React from 'react';

interface EmptyStateProps {
  text: string;
}

export default function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{text}</p>
    </div>
  );
}
