import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { AUTH_INPUT_CLASS, AUTH_PRIMARY_ACTION_CLASS, AuthErrorBanner, AuthField, AuthPanelHeader } from '../../components/auth/AuthFormElements';
import type { AuthOutletContext } from '../../components/auth/AuthShell';
import { userApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/error';

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

const REGISTER_FIELDS: RegisterField[] = [
  { key: 'username', label: '用户名', type: 'text', placeholder: '请输入用户名' },
  { key: 'email', label: '邮箱地址', type: 'email', placeholder: 'example@email.com' },
  { key: 'password', label: '登录密码', type: 'password', placeholder: '至少 8 位，建议包含字母和数字' },
  { key: 'confirmPassword', label: '确认密码', type: 'password', placeholder: '请再次输入密码' },
];
const preloadLoginPage = () => import('./LoginPage');

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAnimationState, setHeroBadge } = useOutletContext<AuthOutletContext>();
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
  const [isTyping, setIsTyping] = useState(false);
  const [hasErrorExpression, setHasErrorExpression] = useState(false);

  const primaryFields = useMemo(
    () => REGISTER_FIELDS.filter((field) => field.key !== 'password' && field.key !== 'confirmPassword'),
    []
  );
  const passwordFields = useMemo(
    () => REGISTER_FIELDS.filter((field) => field.key === 'password' || field.key === 'confirmPassword'),
    []
  );

  useEffect(() => {
    if (!error) {
      setHasErrorExpression(false);
      return;
    }

    setHasErrorExpression(true);
    const timer = window.setTimeout(() => setHasErrorExpression(false), 1200);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    setAnimationState({
      isTyping,
      showPassword: false,
      passwordLength: formData.password.length,
      hasError: hasErrorExpression,
    });
  }, [formData.password.length, hasErrorExpression, isTyping, setAnimationState]);

  useEffect(() => {
    setHeroBadge({ label: '创建账号', to: '/login' });
  }, [setHeroBadge]);

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
    } catch (sendCodeError: unknown) {
      setError(getErrorMessage(sendCodeError, '验证码发送失败，请稍后重试'));
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
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, '注册失败，请稍后重试'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AuthPanelHeader
          caption="填写基本信息后即可开始使用"
          title="创建账号"
          description="完成注册后即可发布动态、预约服务和加入社区互动。"
        />

      <AuthErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="space-y-5">
          {primaryFields.map((field) => (
            <React.Fragment key={field.key}>
              <FormField
                label={field.label}
                type={field.type}
                value={formData[field.key]}
                placeholder={field.placeholder}
                onChange={handleChange(field.key)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </React.Fragment>
          ))}

          <AuthField label="验证码">
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.code}
                onChange={handleChange('code')}
                placeholder="请输入邮箱验证码"
                className={`flex-1 ${AUTH_INPUT_CLASS}`}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={codeLoading || countdown > 0 || !formData.email}
                className="theme-action-secondary rounded-2xl px-5 py-2 text-sm font-bold disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : codeLoading ? '发送中...' : '获取验证码'}
              </button>
            </div>
          </AuthField>

          {passwordFields.map((field) => (
            <React.Fragment key={field.key}>
              <FormField
                label={field.label}
                type={field.type}
                value={formData[field.key]}
                placeholder={field.placeholder}
                onChange={handleChange(field.key)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
              />
            </React.Fragment>
          ))}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              className="mt-0.5 h-5 w-5 cursor-pointer rounded-md border-hairline text-primary focus:ring-primary"
            />
            <label className="text-xs leading-6 text-muted">
              我已阅读并同意
              <Link to="/terms" className="mx-1 text-primary underline">
                服务协议
              </Link>
              和
              <Link to="/privacy" className="ml-1 text-primary underline">
                隐私政策
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={AUTH_PRIMARY_ACTION_CLASS}
          >
            {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : '立即注册'}
          </button>

          <div className="text-center text-sm font-bold text-muted">
            已有账号？
            <Link to="/login" onMouseEnter={preloadLoginPage} onFocus={preloadLoginPage} className="ml-2 text-primary hover:underline">
              去登录
            </Link>
          </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  type,
  value,
  placeholder,
  onChange,
  onFocus,
  onBlur,
}: {
  label: string;
  type: RegisterField['type'];
  value: string;
  placeholder: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <AuthField label={label}>
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={AUTH_INPUT_CLASS}
      />
    </AuthField>
  );
}
