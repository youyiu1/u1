/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PostMenuProps {
  onDelete?: () => Promise<void>;
  onReport?: () => Promise<void>;
  isOwner?: boolean;
}

export const PostMenu: React.FC<PostMenuProps> = ({ onDelete, onReport, isOwner = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runAction = async (action?: () => Promise<void>, successMessage?: string, errorMessage?: string) => {
    if (!action) return;
    try {
      await action();
      if (successMessage) {
        showToast(successMessage, 'success');
      }
    } catch {
      if (errorMessage) {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="rounded-xl p-2 text-muted transition-all hover:bg-surface-soft"
        aria-label="打开更多操作"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="theme-card absolute right-0 top-full z-50 mt-1 min-w-[120px] overflow-hidden rounded-xl shadow-lg">
          {isOwner && onDelete && (
            <button
              onClick={() => runAction(onDelete, '删除成功', '删除失败')}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">删除</span>
            </button>
          )}

          {onReport && (
            <button
              onClick={() => runAction(onReport, '举报成功，我们会尽快处理', '举报失败')}
              className="flex w-full items-center gap-2 border-t border-hairline px-4 py-3 text-sm text-muted transition-colors hover:bg-surface-soft"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">举报</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
