/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Store } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCaptcha = () => {
    const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i += 1) {
      code += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    setGeneratedCaptcha(code);
    drawCaptcha(code);
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 6; i += 1) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.4)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.stroke();
    }

    for (let i = 0; i < 36; i += 1) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random(), 0, 2 * Math.PI);
      ctx.fill();
    }

    const colors = ['#4f46e5', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626'];
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i += 1) {
      const char = code[i];
      const fontSize = 23 + Math.floor(Math.random() * 4);
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

      const x = 15 + i * 23 + Math.random() * 4;
      const y = canvas.height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 28 - 14) * Math.PI / 180;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('请输入用户名和密码');
      return;
    }

    if (!captchaInput.trim()) {
      setErrorMessage('请输入图形验证码');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== generatedCaptcha.toUpperCase()) {
      setErrorMessage('验证码错误，请重新输入');
      setCaptchaInput('');
      generateCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminApi.login(username.trim(), password);
      if (res.success && res.code === 200) {
        setIsLoading(false);
        onLoginSuccess(username.trim());
        return;
      }

      setIsLoading(false);
      setErrorMessage(res.msg || res.message || '登录失败，请检查账号和密码');
      setCaptchaInput('');
      generateCaptcha();
    } catch {
      setIsLoading(false);
      setErrorMessage('登录失败，请稍后重试');
      setCaptchaInput('');
      generateCaptcha();
    }
  };

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center font-body-md text-on-surface p-6 w-full">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-outline-variant/30 overflow-hidden relative z-10 flex flex-col transition-all">
        <div className="px-8 pt-10 pb-6 text-center border-b border-surface-container-highest">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight mb-2 select-none">
            同城生活社区平台
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant/80 tracking-[0.3em] font-semibold">
            管理后台
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-error-container text-on-error-container text-xs p-3 rounded-lg border border-error/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-status-error">error</span>
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="username">
                用户名 / 邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">person</span>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="请输入管理员用户名或邮箱"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="请输入登录密码"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="captcha">
                图形验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="w-4 h-4 text-outline" />
                  </div>
                  <input
                    id="captcha"
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="请输入右侧验证码"
                    maxLength={4}
                    autoComplete="off"
                    required
                  />
                </div>
                <div
                  onClick={generateCaptcha}
                  className="relative group cursor-pointer border border-outline-variant rounded-lg overflow-hidden bg-slate-50 transition-colors hover:border-primary shrink-0 h-[45px] w-[110px]"
                  title="点击刷新验证码"
                >
                  <canvas ref={canvasRef} width={110} height={43} className="w-full h-full block" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-white text-[16px] bg-indigo-600 p-1 rounded-full shadow-md">refresh</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center">
              测试账号：test1/123456
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-headline-md text-headline-md text-on-primary bg-primary hover:bg-primary-container cursor-pointer transition-all active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>正在登录...</span>
                </div>
              ) : (
                '登录'
              )}
            </button>
          </form>
        </div>

        <div className="bg-surface-container-low py-4 text-center border-t border-outline-variant/20">
          <p className="font-data-mono text-data-mono text-on-surface-variant/60">管理端安全登录</p>
        </div>
      </div>
    </div>
  );
}
