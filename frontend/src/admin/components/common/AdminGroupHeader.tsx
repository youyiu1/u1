import React from 'react';
import AdminBackButton from './AdminBackButton';

interface AdminGroupHeaderProps {
  backLabel: string;
  onBack: () => void;
  title?: string;
  subtitle?: string;
  avatar?: string;
  containerClassName?: string;
  backButtonClassName?: string;
  avatarClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function AdminGroupHeader({
  backLabel,
  onBack,
  title,
  subtitle,
  avatar,
  containerClassName = 'flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-1.5',
  backButtonClassName = 'text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0',
  avatarClassName = 'w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700',
  titleClassName = 'text-[11px] font-bold text-gray-800 dark:text-gray-100',
  subtitleClassName = 'text-[10px] text-gray-400',
}: AdminGroupHeaderProps) {
  return (
    <div className={containerClassName}>
      <AdminBackButton label={backLabel} onClick={onBack} className={backButtonClassName} />
      <div className="flex items-center gap-2 min-w-0">
        {avatar ? <img src={avatar} alt={title || ''} className={avatarClassName} /> : null}
        <div>
          {title ? <p className={titleClassName}>{title}</p> : null}
          {subtitle ? <p className={subtitleClassName}>{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}
