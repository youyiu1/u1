/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPin, Phone, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const FOOTER_GROUPS = [
  {
    title: '平台',
    links: [
      { name: '首页', path: '/' },
      { name: '同城动态', path: '/news' },
    ],
  },
  {
    title: '服务',
    links: [
      { name: '生活服务', path: '/service' },
      { name: '闲置交易', path: '/market' },
    ],
  },
  {
    title: '支持',
    links: [
      { name: '登录', path: '/login' },
      { name: '注册', path: '/register' },
    ],
  },
] as const;

const CONTACT_ITEMS = [
  { icon: Phone, text: '400-888-9999' },
  { icon: MapPin, text: '杭州市滨江区' },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12 lg:px-20">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold">同城生活</p>
                <p className="text-xs text-white/50">邻里服务与本地信息平台</p>
              </div>
            </Link>

            <p className="max-w-xl text-sm leading-7 text-white/70">
              提供同城生活服务、闲置交易和社区动态，页面内容保持真实简洁，方便用户日常浏览与发布。
            </p>

            <div className="flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              {CONTACT_ITEMS.map(({ icon: Icon, text }) => (
                <span key={text} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-white">{group.title}</h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-sm text-white/70 transition-colors hover:text-primary">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 同城生活</p>
          <p>浙 ICP 备 20240001 号</p>
        </div>
      </div>
    </footer>
  );
}
