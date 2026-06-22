import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { AUTH_INPUT_CLASS, AUTH_PRIMARY_ACTION_CLASS, AuthErrorBanner, AuthField, AuthPanelHeader } from '../../components/auth/AuthFormElements';
import type { AuthOutletContext } from '../../components/auth/AuthShell';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { getErrorMessage } from '../../utils/error';
import { readStorageJson, removeStorageValue, writeStorageJson } from '../../utils/jsonStorage';

type RememberedLogin = {
  email: string;
};

type CaptchaState = {
  captchaId: string;
  imageBase64: string;
};

const REMEMBERED_LOGIN_KEY = 'remembered_login';
const preloadRegisterPage = () => import('./RegisterPage');
const CAPTCHA_ERROR_MESSAGE = '图形验证码错误或已过期';

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAnimationState, setHeroBadge } = useOutletContext<AuthOutletContext>();
  const { login } = useAuth();
  const captchaRequestRef = useRef(0);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasErrorExpression, setHasErrorExpression] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaState>({ captchaId: '', imageBase64: '' });
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const redirectTo = location.state?.from || '/';

  const loadCaptcha = async (options?: { clearInput?: boolean; silent?: boolean }) => {
    const requestId = captchaRequestRef.current + 1;
    captchaRequestRef.current = requestId;

    if (!options?.silent) {
      setCaptchaLoading(true);
    }

    try {
      const data = await userApi.getCaptcha();
      if (captchaRequestRef.current !== requestId) {
        return;
      }
      setCaptcha({
        captchaId: data.captchaId,
        imageBase64: data.imageBase64,
      });
      if (options?.clearInput) {
        setCaptchaInput('');
      }
    } catch (captchaError: unknown) {
      if (captchaRequestRef.current !== requestId) {
        return;
      }
      setCaptcha({ captchaId: '', imageBase64: '' });
      if (!options?.silent) {
        setError(getErrorMessage(captchaError, '验证码加载失败，请稍后重试'));
      }
    } finally {
      if (captchaRequestRef.current === requestId) {
        setCaptchaLoading(false);
      }
    }
  };

  useEffect(() => {
    const remembered = readStorageJson<RememberedLogin | null>(localStorage, REMEMBERED_LOGIN_KEY, null);
    if (remembered?.email) {
      setEmail(remembered.email);
      setRememberPassword(true);
      setForgotEmail(remembered.email);
    }
    void loadCaptcha();
  }, []);

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
      showPassword,
      passwordLength: password.length,
      hasError: hasErrorExpression,
    });
  }, [hasErrorExpression, isTyping, password.length, setAnimationState, showPassword]);

  useEffect(() => {
    setHeroBadge(forgotOpen ? { label: '找回密码', to: '/login' } : { label: '账号登录', to: '/' });
  }, [forgotOpen, setHeroBadge]);

  const handleRememberPasswordChange = (checked: boolean) => {
    setRememberPassword(checked);
    if (!checked) {
      removeStorageValue(localStorage, REMEMBERED_LOGIN_KEY);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    if (!captchaInput.trim()) {
      setError('请输入图形验证码');
      setIsLoading(false);
      return;
    }

    if (captchaInput.trim().length !== 4) {
      setError('图形验证码长度应为 4 位');
      setIsLoading(false);
      return;
    }

    if (!captcha.captchaId) {
      setError('验证码未准备好，请刷新后重试');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password, captcha.captchaId, captchaInput.trim());
      if (rememberPassword) {
        writeStorageJson(localStorage, REMEMBERED_LOGIN_KEY, { email });
      } else {
        removeStorageValue(localStorage, REMEMBERED_LOGIN_KEY);
      }
      navigate(redirectTo, { replace: true });
    } catch (submitError: unknown) {
      const message = getErrorMessage(submitError, '登录失败，请稍后重试');
      setError(message);
      void loadCaptcha({ clearInput: true, silent: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    setForgotMessage('');
    if (!forgotEmail.trim()) {
      setForgotMessage('请输入注册邮箱');
      return;
    }
    if (!isEmail(forgotEmail.trim())) {
      setForgotMessage('请输入正确的邮箱格式');
      return;
    }

    setSendingCode(true);
    try {
      await userApi.sendCode(forgotEmail.trim());
      setForgotMessage('验证码已发送，请查收邮箱');
    } catch (sendError: unknown) {
      setForgotMessage(getErrorMessage(sendError, '验证码发送失败，请稍后重试'));
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotMessage('');

    if (!forgotEmail.trim() || !forgotCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setForgotMessage('请完整填写找回密码信息');
      return;
    }
    if (!isEmail(forgotEmail.trim())) {
      setForgotMessage('请输入正确的邮箱格式');
      return;
    }
    if (newPassword.length < 6) {
      setForgotMessage('新密码至少 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotMessage('两次输入的新密码不一致');
      return;
    }

    setForgotLoading(true);
    try {
      await userApi.resetPassword(forgotEmail.trim(), forgotCode.trim(), newPassword);
      setForgotMessage('密码重置成功，请使用新密码登录');
      setPassword(newPassword);
      void loadCaptcha({ clearInput: true, silent: true });
    } catch (resetError: unknown) {
      setForgotMessage(getErrorMessage(resetError, '密码重置失败，请稍后重试'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!forgotOpen ? (
        <>
            <AuthPanelHeader caption="请输入账号密码登录系统" title="欢迎登录" description="登录后即可继续发布、收藏、预约和互动。" />

            <AuthErrorBanner message={error} />

            <form onSubmit={handleSubmit} className="space-y-5">
              <AuthField label="邮箱账号">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (!forgotEmail) {
                      setForgotEmail(event.target.value);
                    }
                  }}
                  placeholder="请输入邮箱账号"
                  className={AUTH_INPUT_CLASS}
                  autoComplete="username"
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                />
              </AuthField>

              <AuthField label="登录密码">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入登录密码"
                    className={`${AUTH_INPUT_CLASS} pr-12`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </AuthField>

              <AuthField label="图形验证码">
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
                    placeholder="请输入右侧验证码"
                    className={`${AUTH_INPUT_CLASS} flex-1 uppercase tracking-[0.2em]`}
                    maxLength={4}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => void loadCaptcha({ clearInput: true })}
                    disabled={captchaLoading}
                    className="theme-action-secondary relative flex h-[45px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-2xl disabled:cursor-not-allowed"
                    title="点击刷新验证码"
                  >
                    {captcha.imageBase64 ? (
                      <img src={captcha.imageBase64} alt="图形验证码" className="block h-[45px] w-[110px] object-cover" />
                    ) : (
                      <span className="text-[12px] font-bold text-muted">加载中</span>
                    )}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity hover:opacity-100">
                      <span className="rounded-full bg-primary p-1.5 text-white shadow-md">
                        <RefreshCw className={`h-3.5 w-3.5 ${captchaLoading ? 'animate-spin' : ''}`} />
                      </span>
                    </div>
                  </button>
                </div>
              </AuthField>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    checked={rememberPassword}
                    onChange={(event) => handleRememberPasswordChange(event.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary/20"
                  />
                  <span className="font-medium">记住密码</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setForgotMessage('');
                    setForgotEmail((current) => current || email);
                  }}
                  className="font-bold text-muted transition-colors hover:text-primary"
                >
                  忘记密码？
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={AUTH_PRIMARY_ACTION_CLASS}
              >
                {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : '立即登录'}
              </button>

              <div className="text-center text-sm font-bold text-muted">
                还没有账号？
                <Link to="/register" onMouseEnter={preloadRegisterPage} onFocus={preloadRegisterPage} className="ml-2 text-primary hover:underline">
                  立即注册
                </Link>
              </div>
            </form>
        </>
      ) : (
        <>
            <div className="mb-8 flex items-center justify-between">
              <AuthPanelHeader caption="通过邮箱验证码找回密码" title="忘记密码" description="填写注册邮箱、验证码和新密码后即可完成重置。" />
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(false);
                  setForgotMessage('');
                }}
                className="theme-action-secondary shrink-0 rounded-2xl px-4 py-2 text-[13px] font-bold"
              >
                返回登录
              </button>
            </div>

            <div className="space-y-4">
              <AuthField label="注册邮箱">
                <input
                  type="text"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="请输入注册邮箱"
                  className={AUTH_INPUT_CLASS}
                  autoComplete="email"
                />
              </AuthField>

              <AuthField label="邮箱验证码">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={forgotCode}
                    onChange={(event) => setForgotCode(event.target.value)}
                    placeholder="请输入邮箱验证码"
                    className={`${AUTH_INPUT_CLASS} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="theme-action-secondary shrink-0 rounded-2xl px-4 text-[13px] font-bold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:text-muted"
                  >
                    {sendingCode ? '发送中...' : '发送验证码'}
                  </button>
                </div>
              </AuthField>

              <AuthField label="新密码">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="请输入新密码"
                  className={AUTH_INPUT_CLASS}
                  autoComplete="new-password"
                />
              </AuthField>

              <AuthField label="确认新密码">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="请再次输入新密码"
                  className={AUTH_INPUT_CLASS}
                  autoComplete="new-password"
                />
              </AuthField>

              {forgotMessage && (
                <div
                  className={`rounded-2xl px-3 py-2 text-[12px] ${
                    forgotMessage.includes('成功') || forgotMessage.includes('已发送') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {forgotMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={forgotLoading}
                className={AUTH_PRIMARY_ACTION_CLASS}
              >
                {forgotLoading ? '提交中...' : '确认重置密码'}
              </button>
            </div>
        </>
      )}
    </div>
  );
}
