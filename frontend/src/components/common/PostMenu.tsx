/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, AlertTriangle } from 'lucide-react';
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

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
      showToast('删除成功', 'success');
    } catch {
      showToast('删除失败', 'error');
    }
    setIsOpen(false);
  };

  const handleReport = async () => {
    if (!onReport) return;
    try {
      await onReport();
      showToast('举报成功，我们会尽快处理', 'success');
    } catch {
      showToast('举报失败', 'error');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-muted hover:bg-surface-soft rounded-xl transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-hairline overflow-hidden z-50 min-w-[120px]">
          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">删除</span>
            </button>
          )}
          {onReport && (
            <button
              onClick={handleReport}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-muted hover:bg-surface-soft transition-colors border-t border-hairline"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">举报</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
