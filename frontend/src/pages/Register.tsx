/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-3xl border border-hairline shadow-2xl"
      >
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-ink mb-2">创建您的账号</h1>
          <p className="text-sm text-secondary">欢迎来到同城生活，开启您的优质社区旅程。</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">昵称</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="如何称呼您？"
              className="w-full px-4 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">电子邮箱</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="输入6位验证码"
                className="flex-1 px-4 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
              <button
                type="button"
                className="px-6 py-2 border border-hairline rounded-xl font-bold text-sm hover:bg-surface-soft transition-colors"
              >
                获取验证码
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">设置密码</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="至少8位字符"
              className="w-full px-4 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
            <div className="flex gap-1 mt-2">
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-primary rounded-full"></div>
              <div className="h-1 flex-1 bg-hairline rounded-full"></div>
              <div className="h-1 flex-1 bg-hairline rounded-full"></div>
              <span className="text-[10px] text-primary font-bold ml-2">强度：中</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">确认密码</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="再次输入密码"
              className="w-full px-4 py-3 rounded-xl border border-hairline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
             <input type="checkbox" required className="w-5 h-5 rounded-md border-hairline text-primary focus:ring-primary cursor-pointer" />
             <label className="text-xs text-muted">
               点击注册即代表您同意我们的 <Link to="/terms" className="text-primary underline">服务协议</Link> 和 <Link to="/privacy" className="text-primary underline">隐私政策</Link>。
             </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : '立即注册'}
          </button>

          <div className="text-center text-sm font-bold text-muted">
            已有账号？ <Link to="/login" className="text-primary hover:underline">立即登录</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}