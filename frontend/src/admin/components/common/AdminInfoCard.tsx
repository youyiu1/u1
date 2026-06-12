import React from 'react';

interface AdminInfoCardProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export default function AdminInfoCard({
  label,
  value,
  valueClassName = 'mt-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200 break-words',
}: AdminInfoCardProps) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-2.5 bg-gray-50/40 dark:bg-gray-800/20">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className={valueClassName}>{value}</p>
    </div>
  );
}
