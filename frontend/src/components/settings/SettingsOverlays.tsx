/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Bell, Eye, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ChangePasswordOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordOverlay: React.FC<ChangePasswordOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有密码字段');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码至少6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    setIsSubmitting(true);

    try {
      await userApi.changePassword(oldPassword, newPassword);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message || '修改失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
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
            className="relative w-full max-w-md my-auto z-10"
          >
            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-ink">修改登录密码</h2>
                  </div>
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
                    <h3 className="text-2xl font-black text-ink mb-2">密码修改成功</h3>
                    <p className="text-secondary font-medium">请使用新密码重新登录</p>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">当前密码</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="输入当前密码"
                        className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">新密码</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="输入新密码（至少6位）"
                        className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">确认新密码</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="再次输入新密码"
                        className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
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
                          '确认修改'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface NotificationSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsOverlay: React.FC<NotificationSettingsOverlayProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    messageNotify: true,
    followNotify: true,
    likeNotify: true,
    commentNotify: true,
    systemNotify: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    // TODO: 调用后端保存通知设置
    console.log('通知设置:', settings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
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
            className="relative w-full max-w-md my-auto z-10"
          >
            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-blue/10 text-accent-blue rounded-2xl flex items-center justify-center">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-ink">消息通知设置</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 hover:bg-stone-100 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'messageNotify' as const, label: '私信通知', desc: '收到新私信时接收提醒' },
                    { key: 'followNotify' as const, label: '关注通知', desc: '有新粉丝时接收提醒' },
                    { key: 'likeNotify' as const, label: '点赞通知', desc: '动态被点赞时接收提醒' },
                    { key: 'commentNotify' as const, label: '评论通知', desc: '收到评论时接收提醒' },
                    { key: 'systemNotify' as const, label: '系统通知', desc: '接收系统公告和更新通知' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-ink">{item.label}</p>
                        <p className="text-xs text-muted">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleToggle(item.key)}
                        className={`w-12 h-7 rounded-full transition-all relative ${
                          settings[item.key] ? 'bg-primary' : 'bg-stone-300'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                          settings[item.key] ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3.5 bg-stone-100 text-ink rounded-2xl text-sm font-bold hover:bg-stone-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-colors"
                  >
                    保存设置
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface PrivacySettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsOverlay: React.FC<PrivacySettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    profileVisible: 'public',
    postsVisible: 'public',
    showLocation: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 打开时从用户信息加载设置
  useEffect(() => {
    if (isOpen && user) {
      setSettings({
        profileVisible: (user as any).profileVisible || 'public',
        postsVisible: (user as any).postsVisible || 'public',
        showLocation: (user as any).showLocation !== false,
      });
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await userApi.updatePrivacy(settings);
      // 更新本地用户信息
      if (user) {
        (user as any).profileVisible = settings.profileVisible;
        (user as any).postsVisible = settings.postsVisible;
        (user as any).showLocation = settings.showLocation;
        localStorage.setItem('neighborhood_user', JSON.stringify(user));
      }
      onClose();
    } catch (err) {
      console.error('保存隐私设置失败', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
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
            className="relative w-full max-w-md my-auto z-10"
          >
            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-purple/10 text-accent-purple rounded-2xl flex items-center justify-center">
                      <Eye className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-ink">隐私权限设置</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-3 hover:bg-stone-100 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-muted uppercase tracking-widest mb-3">个人资料可见性</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'public', label: '公开' },
                        { value: 'friends', label: '仅好友' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setSettings(prev => ({ ...prev, profileVisible: option.value }))}
                          className={`p-4 rounded-2xl text-sm font-bold border transition-all ${
                            settings.profileVisible === option.value
                              ? 'bg-primary text-white border-primary'
                              : 'bg-stone-50 text-ink border-hairline hover:border-primary/30'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-muted uppercase tracking-widest mb-3">动态可见性</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'public', label: '公开' },
                        { value: 'friends', label: '仅好友' },
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setSettings(prev => ({ ...prev, postsVisible: option.value }))}
                          className={`p-4 rounded-2xl text-sm font-bold border transition-all ${
                            settings.postsVisible === option.value
                              ? 'bg-primary text-white border-primary'
                              : 'bg-stone-50 text-ink border-hairline hover:border-primary/30'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-muted" />
                      <div>
                        <p className="text-sm font-bold text-ink">显示位置信息</p>
                        <p className="text-xs text-muted">在动态中显示你的位置</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showLocation: !prev.showLocation }))}
                      className={`w-12 h-7 rounded-full transition-all relative ${
                        settings.showLocation ? 'bg-primary' : 'bg-stone-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                        settings.showLocation ? 'left-6' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3.5 bg-stone-100 text-ink rounded-2xl text-sm font-bold hover:bg-stone-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      '保存设置'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};