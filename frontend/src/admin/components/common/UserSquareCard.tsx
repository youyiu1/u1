import React from 'react';
import { getPrimaryImage } from '../../utils/images';

interface UserSquareCardProps {
  key?: React.Key;
  title: string;
  userType: string;
  subtitle: string;
  avatar?: string;
  className?: string;
  buttonLabel?: string;
  onClick: () => void;
}

export default function UserSquareCard({ title, userType, subtitle, avatar, className = '', buttonLabel = '查看详情', onClick }: UserSquareCardProps) {
  const avatarSrc = getPrimaryImage(avatar);

  return (
    <div
      className={`w-full text-left p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-sm transition-all flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {avatarSrc ? (
          <img src={avatarSrc} alt={title} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
            {title.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{title}</p>
          <p className="text-[10px] text-primary font-semibold truncate">{userType}</p>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 truncate">{subtitle}</p>
      <div className="pt-0.5">
        <button
          type="button"
          onClick={onClick}
          className="inline-flex w-full justify-center text-[10px] px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 cursor-pointer"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
