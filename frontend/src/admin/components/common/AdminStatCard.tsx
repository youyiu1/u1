import React from 'react';

interface AdminStatCardProps {
  title: string;
  value: number;
  colorClassName: string;
  unitText: string;
}

export default function AdminStatCard({
  title,
  value,
  colorClassName,
  unitText,
}: AdminStatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${colorClassName}`}>{value}</span>
        <span className="text-xs text-slate-500">{unitText}</span>
      </div>
    </div>
  );
}
