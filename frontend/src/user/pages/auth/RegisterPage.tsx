import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface RegisterFormState {
  username: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

type RegisterField = {
  key: keyof RegisterFormState;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
};

const BASE_INPUT_CLASS =
  'w-full rounded-xl border border-hairline px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20';

const REGISTER_FIELDS: RegisterField[] = [
  { key: 'username', label: '用户名', type: 'text', placeholder: '请输入用户名' },
  { key: 'email', label: '邮箱地址', type: 'email', placeholder: 'example@email.com' },
  { key: 'password', label: '登录密码', type: 'password', placeholder: '至少 8 位，建议包含字母和数字' },
  { key: 'confirmPassword', label: '确认密码', type: 'password', placeholder: '请再次输入密码' },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (!password) {
    return { score: 0, label: '', color: 'bg-hairline' };
  }
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: '较弱', color: 'bg-red-400' };
  if (score <= 2) return { score: 2, label: '中等', color: 'bg-yellow-400' };
  return { score: 3, label: '较强', color: 'bg-green-400' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormState>({
    username: '',
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const primaryFields = useMemo(
    () => REGISTER_FIELDS.filter((field) => field.key !== 'password' && field.key !== 'confirmPassword'),
    []
  );
  const passwordFields = useMemo(
    () => REGISTER_FIELDS.filter((field) => field.key === 'password' || field.key === 'confirmPassword'),
    []
  );

  const handleChange = (field: keyof RegisterFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSendCode = async () => {
    if (!formData.email || countdown > 0) {
      return;
    }

    setCodeLoading(true);
    setError('');

    try {
      await userApi.sendCode(formData.email);
      setCountdown(60);
      const timer = window.setInterval(() => {
        setCountdown((current) => {
          if (current <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    } catch {
      setError('验证码发送失败，请稍后重试');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(formData.username, formData.email, formData.password, formData.code);
      navigate('/');
    } catch (submitError: any) {
      setError(submitError.message || '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-hairline bg-white p-10 shadow-2xl"
      >
        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-bold text-ink">创建你的同城账号</h1>
          <p className="text-sm text-secondary">注册后即可发布动态、预约服务、收藏闲置和加入社区互动。</p>
        </div>

        {error ? <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          {primaryFields.map((field) => (
            <React.Fragment key={field.key}>
              <FormField
                label={field.label}
                type={field.type}
                value={formData[field.key]}
                placeholder={field.placeholder}
                onChange={handleChange(field.key)}
              />
            </React.Fragment>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="请输入邮箱验证码"
                className={`flex-1 ${BASE_INPUT_CLASS}`}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeLoading || countdown > 0 || !formData.email}
                className="rounded-xl border border-hairline px-6 py-2 text-sm font-bold transition-colors hover:bg-surface-soft disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : codeLoading ? '发送中...' : '获取验证码'}
              </button>
            </div>
          </div>

          {passwordFields.map((field) => (
            <React.Fragment key={field.key}>
              <FormField
                label={field.label}
                type={field.type}
                value={formData[field.key]}
                placeholder={field.placeholder}
                onChange={handleChange(field.key)}
              >
                {field.key === 'password' ? <PasswordStrengthBar strength={strength} /> : null}
              </FormField>
            </React.Fragment>
          ))}

          <div className="flex items-start gap-3">
            <input type="checkbox" required className="mt-0.5 h-5 w-5 cursor-pointer rounded-md border-hairline text-primary focus:ring-primary" />
            <label className="text-xs text-muted">
              我已阅读并同意
              <Link to="/terms" className="text-primary underline">
                服务协议
              </Link>
              和
              <Link to="/privacy" className="text-primary underline">
                隐私政策
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-70"
          >
            {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : '立即注册'}
          </button>

          <div className="text-center text-sm font-bold text-muted">
            已有账号？
            <Link to="/login" className="text-primary hover:underline">
              去登录
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function FormField({
  label,
  type,
  value,
  placeholder,
  onChange,
  children,
}: {
  label: string;
  type: RegisterField['type'];
  value: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-ink">{label}</label>
      <input type={type} required value={value} onChange={onChange} placeholder={placeholder} className={BASE_INPUT_CLASS} />
      {children}
    </div>
  );
}

function PasswordStrengthBar({
  strength,
}: {
  strength: { score: number; label: string; color: string };
}) {
  return (
    <div className="mt-2 flex gap-1">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={`h-1 flex-1 rounded-full transition-colors ${strength.score >= index + 1 ? strength.color : 'bg-hairline'}`} />
      ))}
      {strength.label ? <span className="ml-2 text-[10px] font-bold text-muted">密码强度：{strength.label}</span> : null}
    </div>
  );
}
