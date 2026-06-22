import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCircle2, Eye, Loader2, Lock, MapPin, ShieldCheck, X } from 'lucide-react';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { getErrorMessage } from '../../utils/error';

interface ChangePasswordOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface NotificationSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrivacySettingsOverlayProps {
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

type PrivacySettings = {
  profileVisible: string;
  postsVisible: string;
  showLocation: boolean;
};

type ToggleOption = {
  key: keyof NotificationSettings;
  label: string;
  desc: string;
};

const defaultNotificationSettings: NotificationSettings = {
  pushEnabled: true,
  messageNotify: true,
  followNotify: true,
  likeNotify: true,
  commentNotify: true,
  systemNotify: false,
};

const defaultPrivacySettings: PrivacySettings = {
  profileVisible: 'public',
  postsVisible: 'public',
  showLocation: true,
};

const NOTIFICATION_OPTIONS: ToggleOption[] = [
  { key: 'messageNotify', label: '私信提醒', desc: '有新消息时提醒我' },
  { key: 'followNotify', label: '关注提醒', desc: '有人关注我时提醒' },
  { key: 'likeNotify', label: '点赞提醒', desc: '内容收到点赞时提醒' },
  { key: 'commentNotify', label: '评论提醒', desc: '内容收到评论时提醒' },
  { key: 'systemNotify', label: '系统提醒', desc: '接收系统公告和服务通知' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: '公开' },
  { value: 'friends', label: '仅好友' },
];

function hasNotificationChanges(current: NotificationSettings, initial: NotificationSettings) {
  return Object.keys(current).some((key) => current[key as keyof NotificationSettings] !== initial[key as keyof NotificationSettings]);
}

function hasPrivacyChanges(current: PrivacySettings, initial: PrivacySettings) {
  return Object.keys(current).some((key) => current[key as keyof PrivacySettings] !== initial[key as keyof PrivacySettings]);
}

function confirmDiscardIfNeeded(dirty: boolean) {
  if (!dirty) {
    return true;
  }
  return window.confirm('当前有未保存的修改，确定要关闭吗？');
}

export const ChangePasswordOverlay: React.FC<ChangePasswordOverlayProps> = ({ isOpen, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
  }, [isOpen]);

  const dirty = Boolean(oldPassword || newPassword || confirmPassword);
  const canSubmit = !isSubmitting && Boolean(oldPassword && newPassword && confirmPassword);

  const handleClose = () => {
    if (isSuccess || confirmDiscardIfNeeded(dirty)) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写完整密码信息');
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
      window.setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 900);
    } catch (err: unknown) {
      setError(getErrorMessage(err, '修改失败，请稍后重试'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Lock className="h-5 w-5" />}
      iconClass="bg-primary/10 text-primary"
      title="修改登录密码"
      description="只保留必要项，改完立即生效。"
    >
      {isSuccess ? (
        <SuccessPanel title="密码修改成功" description="下次登录请使用新密码。" />
      ) : (
        <div className="space-y-4">
          <PasswordField
            label="当前密码"
            value={oldPassword}
            onChange={setOldPassword}
            placeholder="请输入当前密码"
            autoComplete="current-password"
          />
          <PasswordField
            label="新密码"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="请输入不少于 6 位的新密码"
            autoComplete="new-password"
          />
          <PasswordField
            label="确认新密码"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="请再次输入新密码"
            autoComplete="new-password"
          />
          {error ? <InlineError message={error} /> : null}
          <ActionButtons
            onCancel={handleClose}
            onSave={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={!canSubmit}
            saveText="确认修改"
          />
        </div>
      )}
    </ModalShell>
  );
};

export const NotificationSettingsOverlay: React.FC<NotificationSettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [initialSettings, setInitialSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }
    const nextSettings = {
      pushEnabled: user.pushEnabled !== false,
      messageNotify: user.messageNotify !== false,
      followNotify: user.followNotify !== false,
      likeNotify: user.likeNotify !== false,
      commentNotify: user.commentNotify !== false,
      systemNotify: user.systemNotify === true,
    };
    setSettings(nextSettings);
    setInitialSettings(nextSettings);
    setIsSubmitting(false);
    setError(null);
  }, [isOpen, user]);

  const dirty = hasNotificationChanges(settings, initialSettings);

  const handleClose = () => {
    if (confirmDiscardIfNeeded(dirty)) {
      onClose();
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((current) => {
      if (key === 'pushEnabled') {
        if (current.pushEnabled) {
          return {
            pushEnabled: false,
            messageNotify: false,
            followNotify: false,
            likeNotify: false,
            commentNotify: false,
            systemNotify: false,
          };
        }
        return {
          ...current,
          pushEnabled: true,
        };
      }

      const next = {
        ...current,
        [key]: !current[key],
      };
      if (!current[key]) {
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
      setInitialSettings(settings);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, '保存通知设置失败'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Bell className="h-5 w-5" />}
      iconClass="bg-sky-100 text-sky-600"
      title="通知设置"
      description="先控制总开关，再按类型细分提醒。"
    >
      <div className="space-y-3">
        <SectionLabel title="接收通知" />
        <ToggleCard
          label="站内通知"
          desc="关闭后，不再接收任何提醒"
          checked={settings.pushEnabled}
          onClick={() => handleToggle('pushEnabled')}
        />
        <SectionLabel title="提醒类型" />
        {NOTIFICATION_OPTIONS.map((option) => (
          <ToggleCard
            key={option.key}
            label={option.label}
            desc={option.desc}
            checked={settings[option.key]}
            onClick={() => handleToggle(option.key)}
            disabled={!settings.pushEnabled}
          />
        ))}
      </div>
      {error ? <InlineError className="mt-4" message={error} /> : null}
      <ActionButtons
        onCancel={handleClose}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        disabled={!dirty || isSubmitting}
        saveText="保存设置"
        className="pt-5"
      />
    </ModalShell>
  );
};

export const PrivacySettingsOverlay: React.FC<PrivacySettingsOverlayProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [initialSettings, setInitialSettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }
    const nextSettings = {
      profileVisible: user.profileVisible || 'public',
      postsVisible: user.postsVisible || 'public',
      showLocation: user.showLocation !== false,
    };
    setSettings(nextSettings);
    setInitialSettings(nextSettings);
    setIsSubmitting(false);
    setError(null);
  }, [isOpen, user]);

  const dirty = hasPrivacyChanges(settings, initialSettings);

  const handleClose = () => {
    if (confirmDiscardIfNeeded(dirty)) {
      onClose();
    }
  };

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
      setInitialSettings(settings);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, '保存隐私设置失败'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      icon={<ShieldCheck className="h-5 w-5" />}
      iconClass="bg-emerald-100 text-emerald-600"
      title="隐私设置"
      description="保持选项简单，只控制资料、动态和地区。"
    >
      <div className="space-y-5">
        <VisibilityGroup
          label="谁可以看到我的资料"
          value={settings.profileVisible}
          onChange={(value) => setSettings((current) => ({ ...current, profileVisible: value }))}
        />
        <VisibilityGroup
          label="谁可以看到我的动态"
          value={settings.postsVisible}
          onChange={(value) => setSettings((current) => ({ ...current, postsVisible: value }))}
        />
        <ToggleCard
          icon={<MapPin className="h-4 w-4" />}
          label="显示我的地区"
          desc="在主页和内容里显示所在地区"
          checked={settings.showLocation}
          onClick={() => setSettings((current) => ({ ...current, showLocation: !current.showLocation }))}
        />
      </div>
      {error ? <InlineError className="mt-4" message={error} /> : null}
      <ActionButtons
        onCancel={handleClose}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        disabled={!dirty || isSubmitting}
        saveText="保存设置"
        className="pt-5"
      />
    </ModalShell>
  );
};

function ModalShell({
  isOpen,
  onClose,
  icon,
  iconClass,
  title,
  description,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/45"
            aria-label="关闭弹层"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.985 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="theme-card relative z-10 w-full max-w-[440px] rounded-[28px] shadow-2xl"
          >
            <div className="border-b border-hairline px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}>{icon}</div>
                  <div>
                    <h2 className="text-[20px] font-black text-ink">{title}</h2>
                    <p className="mt-1 text-[13px] text-muted">{description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="theme-action-secondary rounded-xl p-2 text-muted transition-colors hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function SectionLabel({ title }: { title: string }) {
  return <div className="text-[11px] font-black uppercase tracking-[0.18em] text-muted">{title}</div>;
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-sm font-bold text-ink">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="theme-input-surface w-full rounded-2xl border border-transparent px-4 py-3 text-sm text-ink outline-none transition-all focus:border-primary/20 focus:ring-4 focus:ring-primary/8"
      />
    </div>
  );
}

function ToggleCard({
  icon,
  label,
  desc,
  checked,
  onClick,
  disabled = false,
}: {
  key?: React.Key;
  icon?: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`theme-card-muted flex items-center justify-between rounded-2xl px-4 py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        {icon ? <div className="mt-0.5 text-muted">{icon}</div> : null}
        <div>
          <p className="text-sm font-bold text-ink">{label}</p>
          <p className="text-xs text-muted">{desc}</p>
        </div>
      </div>
      <SwitchButton checked={checked} onClick={onClick} disabled={disabled} />
    </div>
  );
}

function VisibilityGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <label className="ml-1 text-sm font-bold text-ink">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        {VISIBILITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
              value === option.value
                ? 'border-primary bg-primary text-white'
                : 'theme-action-secondary text-ink hover:border-primary/25'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InlineError({ message, className = '' }: { message: string; className?: string }) {
  return <p className={`text-xs font-medium text-red-500 ${className}`}>{message}</p>;
}

function SuccessPanel({ title, description }: { title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-black text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </motion.div>
  );
}

function ActionButtons({
  onCancel,
  onSave,
  isSubmitting,
  disabled,
  saveText,
  className = 'pt-4',
}: {
  onCancel: () => void;
  onSave: () => void;
  isSubmitting: boolean;
  disabled: boolean;
  saveText: string;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        className="theme-action-secondary flex-1 rounded-2xl py-3 text-sm font-bold transition-colors"
      >
        取消
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          saveText
        )}
      </button>
    </div>
  );
}

function SwitchButton({
  checked,
  onClick,
  disabled = false,
}: {
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative h-7 w-12 rounded-full transition-all ${
        checked ? 'bg-primary' : 'bg-[var(--color-hairline-strong)]'
      } disabled:cursor-not-allowed`}
    >
      <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-[var(--color-surface-panel)] shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}
