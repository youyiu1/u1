import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, MessageSquare, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/error';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, '登录失败，请稍后重试'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-hairline bg-white p-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-2xl font-bold text-ink">欢迎回到同城生活</h1>
          <p className="text-sm text-muted">登录后即可继续发布、收藏、预约和互动。</p>
        </div>

        {error ? <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-bold uppercase text-muted">邮箱账号</label>
            <input
              type="text"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="请输入邮箱账号"
              className="w-full rounded-xl border border-hairline px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-xs font-bold uppercase text-muted">登录密码</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入登录密码"
                className="w-full rounded-xl border border-hairline px-4 py-3 pr-12 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs font-bold">
            <span className="text-muted">测试账号：test1/123456</span>
            <div className="text-muted">
              还没有账号？
              <Link to="/register" className="ml-1 text-primary hover:underline">
                立即注册
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover disabled:opacity-70"
          >
            {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : '立即登录'}
          </button>
        </form>

        <div className="relative mt-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-muted">其他登录方式</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-hairline text-sm font-bold transition-colors hover:bg-surface-soft">
            <MessageSquare className="h-5 w-5 text-[#07C160]" /> 微信登录
          </button>
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-hairline text-sm font-bold transition-colors hover:bg-surface-soft">
            <Smartphone className="h-5 w-5 text-secondary" /> 手机号登录
          </button>
        </div>
      </motion.div>
    </div>
  );
}
