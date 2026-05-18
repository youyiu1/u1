/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Instagram, 
  Twitter, 
  Facebook, 
  Mail, 
  MapPin, 
  Phone,
  ArrowUpRight
} from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: '平台',
    links: [
      { name: '关于我们', path: '/about' },
      { name: '加入我们', path: '/careers' },
      { name: '社区规范', path: '/rules' },
      { name: '服务协议', path: '/terms' },
    ]
  },
  {
    title: '服务',
    links: [
      { name: '精选家政', path: '/service' },
      { name: '闲置交易', path: '/market' },
      { name: '同城头条', path: '/news' },
      { name: '积分商城', path: '/' },
    ]
  },
  {
    title: '支持',
    links: [
      { name: '常见问题', path: '/faq' },
      { name: '意见反馈', path: '/feedback' },
      { name: '联系邻里', path: '/contact' },
    ]
  }
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white pt-20 pb-12 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Logo & About */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                同城<span className="text-primary italic">生活</span>
              </span>
            </Link>
            <p className="text-base text-white/60 font-medium leading-relaxed max-w-sm">
              连接每一个有温度的邻里，打造更有归宿感的同城社交化生活服务平台。
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary transition-all group border border-white/5">
                  <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-3 gap-8">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        to={link.path} 
                        className="text-sm font-medium text-white/50 hover:text-primary transition-colors flex items-center gap-1 group"
                      >
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter / Contact */}
          <div className="lg:col-span-3 space-y-6">
             <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">联系我们</h4>
             <div className="space-y-3">
               {[
                 { icon: Phone, text: '400-888-9999' },
                 { icon: Mail, text: 'hello@neighbor.com' },
                 { icon: MapPin, text: '滨江区 铂金时代 12F' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 group">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-white/70">{item.text}</span>
                 </div>
               ))}
             </div>
             <div className="pt-4">
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder=" your@email.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                  />
                  <button className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-hover transition-all">
                    订阅
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-white/30">
            © 2026 同城生活. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
             <p className="text-xs font-medium text-white/30">浙ICP备 20240001号-1</p>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-white/50">SYSTEM NORMAL</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
