/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isRemember, setIsRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Captcha states and refs
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateCaptcha = () => {
    let code = '';
    const pool = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    for (let i = 0; i < 4; i++) {
      code += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    setGeneratedCaptcha(code);
    draw(code);
  };

  const draw = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and background
    ctx.fillStyle = '#f8fafc'; // light slate
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.45)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, 0.35)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw characters with distinct translation & rotation
    const colors = ['#4f46e5', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const fontSize = 23 + Math.floor(Math.random() * 6);
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      const x = 15 + i * 23 + Math.random() * 5;
      const y = canvas.height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 32 - 16) * Math.PI / 180;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    // Generate captcha once after component mounts
    generateCaptcha();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMessage('请输入账号和密码');
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
      const res = await adminApi.login(username, password);
      setIsLoading(false);
      if (res.code === 200) {
        onLoginSuccess(username);
      } else {
        setErrorMessage(res.msg);
        generateCaptcha();
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('登录失败，系统网关未知错误');
      generateCaptcha();
    }
  };

  return (
    <div className="geometric-bg min-h-screen flex items-center justify-center font-body-md text-on-surface p-6 w-full">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-outline-variant/30 overflow-hidden relative z-10 flex flex-col transition-all">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-surface-container-highest">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight mb-2 select-none">
            同城生活社区平台
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant/80 uppercase tracking-widest font-semibold">
            管理后台
          </p>
        </div>

        {/* Input Form */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Error Message banner */}
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

            {/* Username Input */}
            <div className="space-y-1.5Packed">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="username">
                账号
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
                  placeholder="请输入管理员账号"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
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
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Graphical Captcha Input */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="captcha">
                安全图形验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">shield</span>
                  </div>
                  <input
                    id="captcha"
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="请输入右侧验证码"
                    maxLength={4}
                    required
                    autoComplete="off"
                  />
                </div>
                <div 
                  onClick={generateCaptcha} 
                  className="relative group cursor-pointer border border-outline-variant rounded-lg overflow-hidden bg-slate-50 transition-colors hover:border-primary shrink-0 h-[45px] w-[110px]" 
                  title="看不清？点击更换验证码"
                >
                  <canvas
                    ref={canvasRef}
                    width={110}
                    height={43}
                    className="w-full h-full block"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-white text-[16px] bg-indigo-600 p-1 rounded-full shadow-md">refresh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remember Me & Forget Pass */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={isRemember}
                  onChange={(e) => setIsRemember(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                />
                <label className="ml-2 block font-body-sm text-body-sm text-on-surface-variant select-none" htmlFor="remember-me">
                  自动登录
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => alert('Demo提示：超管账号为 admin，密码为 123456')}
                  className="font-body-sm text-body-sm text-primary hover:text-on-primary-fixed-variant transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  忘记密码?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
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
            </div>
          </form>
        </div>

        {/* Footing Version */}
        <div className="bg-surface-container-low py-4 text-center border-t border-outline-variant/20">
          <p className="font-data-mono text-data-mono text-on-surface-variant/60">
            v2.4.0 (Enterprise Build)
          </p>
        </div>
      </div>
    </div>
  );
}
