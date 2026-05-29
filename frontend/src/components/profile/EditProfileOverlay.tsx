/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { userApi, fileApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface EditProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileOverlay: React.FC<EditProfileOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setTag(currentUser.tag || '');
      setBio((currentUser as any).bio || '');
      setAvatar(currentUser.avatar || '');
      setAvatarPreview(null);
      setAvatarFile(null);
      setError(null);
    }
  }, [currentUser, isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('昵称不能为空');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let avatarUrl = avatar;
      if (avatarFile) {
        avatarUrl = await fileApi.upload(avatarFile);
      }

      const updatedUser = {
        name: name.trim(),
        tag: tag.trim(),
        bio: bio.trim(),
        avatar: avatarUrl,
      } as Partial<User>;

      await userApi.update(updatedUser);
      setIsSuccess(true);

      if (updateUser) {
        updateUser({ ...currentUser, ...updatedUser });
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message || '更新失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg my-auto z-10"
          >
            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-ink">编辑个人资料</h2>
                  <button
                    onClick={onClose}
                    className="p-3 hover:bg-stone-100 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>

                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-ink mb-2">更新成功</h3>
                    <p className="text-secondary font-medium">个人资料已更新</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative mb-4">
                        <motion.img
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          src={avatarPreview || avatar || undefined}
                          className="w-24 h-24 rounded-full border-4 border-stone-100 shadow-lg object-cover"
                          alt=""
                        />
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <span className="text-xs font-black text-muted uppercase tracking-widest">点击更换头像</span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">昵称</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="输入昵称"
                          className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">身份标签</label>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          placeholder="如：新晋邻居、美食达人"
                          maxLength={20}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">个人简介</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="介绍一下自己..."
                          maxLength={100}
                          rows={3}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all resize-none"
                        />
                      </div>

                      {error && (
                        <p className="text-red-500 text-xs font-medium">{error}</p>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={onClose}
                          className="flex-1 py-3.5 bg-stone-100 text-ink rounded-2xl text-sm font-bold hover:bg-stone-200 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              保存中...
                            </>
                          ) : (
                            '保存'
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
