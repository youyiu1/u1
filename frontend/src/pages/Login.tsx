/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, MessageSquare, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, email.split('@')[0]);
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-3xl border border-hairline shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-ink mb-2">登录同城生活</h1>
          <p className="text-sm text-muted">发现身边精彩，连接社区每一刻</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted ml-1">账号/邮箱</label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入您的账号或邮箱"
                className="w-full pl-4 pr-4 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-muted ml-1">密码</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入您的密码"
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-bold">
             <Link to="/forgot" className="text-primary hover:underline">忘记密码？</Link>
             <div className="text-muted">
               还没有账号？ <Link to="/register" className="text-primary hover:underline">立即注册</Link>
             </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : '登录'}
          </button>
        </form>

        <div className="mt-8 relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline"></div>
          </div>
          <span className="relative bg-white px-4 text-[10px] text-muted uppercase font-bold tracking-widest">
            或者使用以下方式登录
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 h-12 border border-hairline rounded-xl hover:bg-surface-soft transition-colors font-bold text-sm">
            <MessageSquare className="w-5 h-5 text-[#07C160]" /> 微信登录
          </button>
          <button className="flex items-center justify-center gap-2 h-12 border border-hairline rounded-xl hover:bg-surface-soft transition-colors font-bold text-sm">
            <Smartphone className="w-5 h-5 text-secondary" /> 手机登录
          </button>
        </div>
      </motion.div>
    </div>
  );
}
