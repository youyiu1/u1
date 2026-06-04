import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCircle2, Eye, Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

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

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有密码字段');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密码至少 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await userApi.changePassword(oldPassword, newPassword);
      if (!success) {
        setError('当前密码不正确');
        return;
      }
      setIsSuccess(true);
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsSuccess(false);
        onClose();
        onSuccess?.();
      }, 900);
    } catch (err: any) {
      setError(err.message || '修改失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Lock className="w-6 h-6" />}
      iconClass="bg-primary/10 text-primary"
      title="修改登录密码"
    >
      {isSuccess ? (
        <SuccessPanel title="密码修改成功" description="请使用新密码重新登录" />
      ) : (
        <div className="space-y-5">
          <PasswordField label="当前密码" value={oldPassword} onChange={setOldPassword} placeholder="输入当前密码" />
          <PasswordField label="新密码" value={newPassword} onChange={setNewPassword} placeholder="输入新密码（至少 6 位）" />
          <PasswordField label="确认新密码" value={confirmPassword} onChange={setConfirmPassword} placeholder="再次输入新密码" />
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
          <ActionButtons onCancel={onClose} onSave={handleSubmit} isSubmitting={isSubmitting} saveText="确认修改" />
        </div>
      )}
    </ModalShell>
  );
};

interface NotificationSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationSettings = {
  pushEnabled: boolean;
  messageNotify: boolean;
  followNotify: boolean;
  likeNotify: boolean;
  commentNotify: boolean;
  systemNotify: boolean;
};

type ToggleOption = {
  key: keyof NotificationSettings;
  label: string;
  desc: string;
};

type VisibilityOption = {
  value: string;
  label: string;
};

const defaultNotificationSettings: NotificationSettings = {
  pushEnabled: true,
  messageNotify: true,
  followNotify: true,
  likeNotify: true,
  commentNotify: true,
  systemNotify: false,
};

const NOTIFICATION_OPTIONS: ToggleOption[] = [
  { key: 'pushEnabled', label: '总通知开关', desc: '关闭后不再接收站内提醒' },
  { key: 'messageNotify', label: '私信通知', desc: '收到新私信时接收提醒' },
  { key: 'followNotify', label: '关注通知', desc: '有新粉丝时接收提醒' },
  { key: 'likeNotify', label: '点赞通知', desc: '动态被点赞时接收提醒' },
  { key: 'commentNotify', label: '评论通知', desc: '收到评论时接收提醒' },
  { key: 'systemNotify', label: '系统通知', desc: '接收系统公告和更新通知' },
];

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  { value: 'public', label: '公开' },
  { value: 'friends', label: '仅好友' },
];

export const NotificationSettingsOverlay: React.FC<NotificationSettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setSettings({
        pushEnabled: user.pushEnabled !== false,
        messageNotify: user.messageNotify !== false,
        followNotify: user.followNotify !== false,
        likeNotify: user.likeNotify !== false,
        commentNotify: user.commentNotify !== false,
        systemNotify: user.systemNotify === true,
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'pushEnabled' && prev.pushEnabled) {
        return {
          ...next,
          messageNotify: false,
          followNotify: false,
          likeNotify: false,
          commentNotify: false,
          systemNotify: false,
        };
      }
      if (key !== 'pushEnabled' && !prev[key]) {
        next.pushEnabled = true;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const success = await userApi.updateNotificationSettings(settings);
      if (!success) {
        setError('保存通知设置失败');
        return;
      }
      if (user) {
        updateUser({ ...user, ...settings } as User);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '保存通知设置失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Bell className="w-6 h-6" />}
      iconClass="bg-accent-blue/10 text-accent-blue"
      title="消息通知设置"
    >
      <div className="space-y-4">
        {NOTIFICATION_OPTIONS.map((option) => (
          <React.Fragment key={option.key}>
            <ToggleRow
              settingsKey={option.key}
              label={option.label}
              desc={option.desc}
              settings={settings}
              onToggle={handleToggle}
              disabled={option.key !== 'pushEnabled' && !settings.pushEnabled}
            />
          </React.Fragment>
        ))}
      </div>
      {error && <p className="mt-4 text-red-500 text-xs font-medium">{error}</p>}
      <ActionButtons onCancel={onClose} onSave={handleSave} isSubmitting={isSubmitting} className="pt-6" />
    </ModalShell>
  );
};

interface PrivacySettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySettingsOverlay: React.FC<PrivacySettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    profileVisible: 'public',
    postsVisible: 'public',
    showLocation: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setSettings({
        profileVisible: user.profileVisible || 'public',
        postsVisible: user.postsVisible || 'public',
        showLocation: user.showLocation !== false,
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const success = await userApi.updatePrivacy(settings);
      if (!success) {
        setError('保存隐私设置失败');
        return;
      }
      if (user) {
        updateUser({ ...user, ...settings } as User);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || '保存隐私设置失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Eye className="w-6 h-6" />}
      iconClass="bg-accent-purple/10 text-accent-purple"
      title="隐私权限设置"
    >
      <div className="space-y-6">
        <VisibilityGroup
          label="个人资料可见性"
          value={settings.profileVisible}
          onChange={(value) => setSettings(prev => ({ ...prev, profileVisible: value }))}
        />
        <VisibilityGroup
          label="动态可见性"
          value={settings.postsVisible}
          onChange={(value) => setSettings(prev => ({ ...prev, postsVisible: value }))}
        />
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-muted" />
            <div>
              <p className="text-sm font-bold text-ink">显示位置信息</p>
              <p className="text-xs text-muted">在个人资料和动态中展示你的地区</p>
            </div>
          </div>
          <SwitchButton checked={settings.showLocation} onClick={() => setSettings(prev => ({ ...prev, showLocation: !prev.showLocation }))} />
        </div>
      </div>
      {error && <p className="mt-4 text-red-500 text-xs font-medium">{error}</p>}
      <ActionButtons onCancel={onClose} onSave={handleSave} isSubmitting={isSubmitting} className="pt-6" />
    </ModalShell>
  );
};

function ModalShell({
  isOpen,
  onClose,
  icon,
  iconClass,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
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
            className="relative w-full max-w-md my-auto z-10 will-change-transform"
          >
            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconClass}`}>{icon}</div>
                    <h2 className="text-2xl font-black text-ink">{title}</h2>
                  </div>
                  <button onClick={onClose} className="p-3 hover:bg-stone-100 rounded-full transition-all">
                    <X className="w-5 h-5 text-ink" />
                  </button>
                </div>
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 bg-stone-50 border border-hairline rounded-2xl text-sm font-medium placeholder:text-muted/40 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all"
      />
    </div>
  );
}

function SuccessPanel({ title, description }: { title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="w-20 h-20 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-black text-ink mb-2">{title}</h3>
      <p className="text-secondary font-medium">{description}</p>
    </motion.div>
  );
}

function ActionButtons({
  onCancel,
  onSave,
  isSubmitting,
  saveText = '保存设置',
  className = 'pt-4',
}: {
  onCancel: () => void;
  onSave: () => void;
  isSubmitting: boolean;
  saveText?: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <button onClick={onCancel} className="flex-1 py-3.5 bg-stone-100 text-ink rounded-2xl text-sm font-bold hover:bg-stone-200 transition-colors">
        取消
      </button>
      <button onClick={onSave} disabled={isSubmitting} className="flex-1 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />保存中...</> : saveText}
      </button>
    </div>
  );
}

function ToggleRow({
  settingsKey,
  label,
  desc,
  settings,
  onToggle,
  disabled = false,
}: {
  settingsKey: keyof NotificationSettings;
  label: string;
  desc: string;
  settings: NotificationSettings;
  onToggle: (key: keyof NotificationSettings) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-4 bg-stone-50 rounded-2xl ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="text-sm font-bold text-ink">{label}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <SwitchButton checked={settings[settingsKey]} onClick={() => onToggle(settingsKey)} disabled={disabled} />
    </div>
  );
}

function SwitchButton({ checked, onClick, disabled = false }: { checked: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-7 rounded-full transition-all relative disabled:cursor-not-allowed ${checked ? 'bg-primary' : 'bg-stone-300'}`}
    >
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
}

function VisibilityGroup({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-black text-muted uppercase tracking-widest mb-3">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        {VISIBILITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`p-4 rounded-2xl text-sm font-bold border transition-all ${
              value === option.value
                ? 'bg-primary text-white border-primary'
                : 'bg-stone-50 text-ink border-hairline hover:border-primary/30'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
