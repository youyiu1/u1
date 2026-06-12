import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, CheckCircle2, Loader2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fileApi, userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { getErrorMessage } from '../../utils/error';
import { matchPathByRegex, PROFILE_DETAIL_PATH_REGEX } from '../../utils/pathMatch';

interface EditProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ProfileFormState = {
  name: string;
  tag: string;
  bio: string;
  avatar: string;
  region: string;
  phone: string;
};

function buildInitialForm(user: User | null): ProfileFormState {
  return {
    name: user?.name || '',
    tag: user?.tag || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    region: user?.region || '',
    phone: user?.phone || '',
  };
}

export const EditProfileOverlay: React.FC<EditProfileOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialForm = useMemo(() => buildInitialForm(currentUser), [currentUser]);
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialForm);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsSuccess(false);
    setError(null);
  }, [initialForm, isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const updateField = (key: keyof ProfileFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('昵称不能为空');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let avatarUrl = form.avatar;
      if (avatarFile) {
        avatarUrl = await fileApi.upload(avatarFile);
      }

      const updatedUser = {
        name: form.name.trim(),
        tag: form.tag.trim(),
        bio: form.bio.trim(),
        avatar: avatarUrl,
        region: form.region.trim(),
        phone: form.phone.trim(),
      } as Partial<User>;

      await userApi.update(updatedUser);
      setIsSuccess(true);

      if (currentUser && updateUser) {
        updateUser({ ...currentUser, ...updatedUser } as User);
      }

      setTimeout(() => {
        setIsSuccess(false);
        if (matchPathByRegex(location.pathname, PROFILE_DETAIL_PATH_REGEX)) {
          navigate('/profile', { replace: true });
        }
        onClose();
        onSuccess?.();
      }, 850);
    } catch (err: unknown) {
      setError(getErrorMessage(err, '更新失败'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarSrc = avatarPreview || form.avatar;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/55"
          />

          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.985 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="relative w-full max-w-lg my-auto z-10 will-change-transform"
          >
            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-ink">编辑个人资料</h2>
                  <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-all">
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>

                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-ink mb-2">更新成功</h3>
                    <p className="text-secondary font-medium">个人资料已更新</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative mb-4">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            className="w-24 h-24 rounded-full border-4 border-stone-100 shadow-lg object-cover"
                            alt={form.name || 'avatar'}
                            decoding="async"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full border-4 border-stone-100 shadow-lg bg-surface-soft flex items-center justify-center text-2xl font-black text-primary">
                            {(form.name || 'U').slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-hover transition-colors">
                          <Camera className="w-4 h-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <span className="text-xs font-black text-muted uppercase tracking-widest">点击更换头像</span>
                    </div>

                    <div className="space-y-5">
                      <TextField label="昵称" value={form.name} onChange={(value) => updateField('name', value)} placeholder="输入昵称" />
                      <TextField label="身份标签" value={form.tag} onChange={(value) => updateField('tag', value)} placeholder="如：新晋邻居、家政达人" maxLength={20} />
                      <TextField label="地区" value={form.region} onChange={(value) => updateField('region', value)} placeholder="输入所在地区" />
                      <TextField label="手机号" value={form.phone} onChange={(value) => updateField('phone', value)} placeholder="输入手机号" />
                      <div>
                        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">个人简介</label>
                        <textarea
                          value={form.bio}
                          onChange={(e) => updateField('bio', e.target.value)}
                          placeholder="介绍一下自己"
                          maxLength={100}
                          rows={3}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all resize-none"
                        />
                      </div>

                      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                      <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-3.5 bg-stone-100 text-ink rounded-2xl text-sm font-bold hover:bg-stone-200 transition-colors">
                          取消
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</> : '保存'}
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

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
      />
    </div>
  );
}
