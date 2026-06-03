import React from 'react';

interface AdminBackButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export default function AdminBackButton({
  label,
  onClick,
  className = 'text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0',
}: AdminBackButtonProps) {
  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  );
}
