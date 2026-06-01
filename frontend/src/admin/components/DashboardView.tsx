/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { DashboardStats, Dynamic, Order, Service } from '../types';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats;
  dynamics: Dynamic[];
  orders: Order[];
  services: Service[];
  onNavigate: (tab: string, filter?: string) => void;
}

type ChartSize = { width: number; height: number };

function ChartShell({ height, children }: { height: number; children: (size: ChartSize) => ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const nextWidth = Number.isFinite(rect.width) ? Math.max(0, Math.floor(rect.width)) : 0;
      const nextHeight = Number.isFinite(height) ? Math.max(0, Math.floor(height)) : 0;
      setSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }
        return { width: nextWidth, height: nextHeight };
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [height]);

  return (
    <div ref={ref} className="relative w-full min-w-0" style={{ height, minHeight: height }}>
      {size.width >= 24 && size.height >= 24 ? (
        children(size)
      ) : (
        <div className="h-full w-full rounded-lg bg-surface-container-low animate-pulse" />
      )}
    </div>
  );
}

export default function DashboardView({ stats, dynamics, orders, services, onNavigate }: DashboardViewProps) {
  const formatNum = (num: number) => num.toLocaleString();

  const summaryItems = [
    {
      title: '总用户数',
      value: formatNum(stats.totalUsers),
      trend: `+${stats.totalUsersTrend}%`,
      icon: 'group',
      color: 'text-primary',
      bg: 'bg-primary-fixed/30',
      onClick: () => onNavigate('/admin/users'),
    },
    {
      title: '新增动态',
      value: formatNum(stats.newPosts),
      trend: `+${stats.newPostsTrend}%`,
      icon: 'explore',
      color: 'text-status-normal',
      bg: 'bg-secondary-fixed/30',
      onClick: () => onNavigate('/admin/posts'),
    },
    {
      title: '在售商品',
      value: formatNum(stats.activeGoods),
      trend: `${stats.activeGoodsTrend}%`,
      icon: 'shopping_bag',
      color: 'text-status-error',
      bg: 'bg-tertiary-fixed/30',
      onClick: () => onNavigate('/admin/market'),
    },
    {
      title: '活跃服务',
      value: formatNum(stats.activeServices),
      trend: `+${stats.activeServicesTrend}%`,
      icon: 'home_repair_service',
      color: 'text-status-normal',
      bg: 'bg-surface-variant',
      onClick: () => onNavigate('/admin/services'),
    },
    {
      title: '当月订单',
      value: formatNum(stats.monthlyOrders),
      trend: `+${stats.monthlyOrdersTrend}%`,
      icon: 'receipt_long',
      color: 'text-primary',
      bg: 'bg-primary/10',
      onClick: () => onNavigate('/admin/orders'),
    },
  ];

  const weeklyTrendData = [
    { name: '周一', '新增动态': 240, '在售商品': 180, '活跃服务': 85, '当月订单': 120 },
    { name: '周二', '新增动态': 310, '在售商品': 220, '活跃服务': 95, '当月订单': 155 },
    { name: '周三', '新增动态': 430, '在售商品': 310, '活跃服务': 110, '当月订单': 210 },
    { name: '周四', '新增动态': Math.max(stats.newPosts, 280), '在售商品': Math.max(stats.activeGoods, 220), '活跃服务': Math.max(stats.activeServices, 100), '当月订单': Math.max(stats.monthlyOrders, 170) },
    { name: '周五', '新增动态': Math.max(stats.newPosts, 360), '在售商品': Math.max(stats.activeGoods, 260), '活跃服务': Math.max(stats.activeServices, 130), '当月订单': Math.max(stats.monthlyOrders, 220) },
    { name: '周六', '新增动态': Math.max(stats.newPosts, 410), '在售商品': Math.max(stats.activeGoods, 300), '活跃服务': Math.max(stats.activeServices, 150), '当月订单': Math.max(stats.monthlyOrders, 260) },
    { name: '周日', '新增动态': Math.max(stats.newPosts, 380), '在售商品': Math.max(stats.activeGoods, 280), '活跃服务': Math.max(stats.activeServices, 140), '当月订单': Math.max(stats.monthlyOrders, 230) },
  ];

  const mixData = [
    { name: '新增动态', value: stats.newPosts || 1, color: '#0ea5e9' },
    { name: '在售商品', value: stats.activeGoods || 1, color: '#f43f5e' },
    { name: '活跃服务', value: stats.activeServices || 1, color: '#eab308' },
    { name: '当月订单', value: stats.monthlyOrders || 1, color: '#8b5cf6' },
  ];

  const pvData = [
    { name: '周一', '浏览量(PV)': 640, '访客数(UV)': 180 },
    { name: '周二', '浏览量(PV)': 720, '访客数(UV)': 195 },
    { name: '周三', '浏览量(PV)': 880, '访客数(UV)': 230 },
    { name: '周四', '浏览量(PV)': 790, '访客数(UV)': 210 },
    { name: '周五', '浏览量(PV)': 960, '访客数(UV)': 250 },
    { name: '周六', '浏览量(PV)': 1120, '访客数(UV)': 300 },
    { name: '周日', '浏览量(PV)': 1080, '访客数(UV)': 285 },
  ];

  const pendingServiceCount = services.filter((service) => service.status === 'pending').length;
  const pendingDynamicCount = dynamics.filter((dynamic) => dynamic.status === 'pending').length;
  const abnormalOrderCount = orders.filter((order) => order.status === 'abnormal').length;

  const orderTasks = [
    { title: '审核服务', count: pendingServiceCount, desc: '真实待处理：服务待审核', path: '/admin/services', filter: 'pending', icon: 'home_repair_service', color: 'border-l-status-pending' },
    { title: '违规内容', count: pendingDynamicCount, desc: '真实待处理：动态待审核', path: '/admin/posts', filter: 'pending', icon: 'gavel', color: 'border-l-status-error' },
    { title: '异常订单', count: abnormalOrderCount, desc: '真实待处理：异常订单', path: '/admin/orders', filter: 'abnormal', icon: 'warning', color: 'border-l-status-unlisted' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryItems.map((item) => (
          <motion.div
            key={item.title}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={item.onClick}
            className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-md text-label-md text-secondary select-none">{item.title}</span>
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </div>
            </div>
            <div className="font-data-mono text-headline-xl font-bold text-on-surface mb-2">{item.value}</div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm select-none">
              <span className={`material-symbols-outlined text-[16px] ${item.color} font-bold`}>trending_up</span>
              <span className="text-status-normal font-semibold">{item.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-5 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 select-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary font-bold">query_stats</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">同城运营数据分析中心</h2>
          </div>
          <span className="font-data-mono text-xs text-outline bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">实时数据</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px] min-w-0">
            <div className="mb-2 select-none">
              <div className="font-semibold text-on-surface flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                业务增长趋势
              </div>
              <p className="text-[11px] text-outline mt-0.5">展示过去一周核心业务板块变化</p>
            </div>
            <ChartShell height={250}>
              {({ width, height }) => (
                <LineChart width={width} height={height} data={weeklyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="新增动态" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="在售商品" stroke="#f43f5e" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="活跃服务" stroke="#eab308" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="当月订单" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ChartShell>
          </div>

          <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px] min-w-0">
            <div className="select-none mb-2">
              <div className="font-semibold text-on-surface flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                当前业务占比
              </div>
              <p className="text-[11px] text-outline mt-0.5">展示后台四大板块的分布情况</p>
            </div>

            <div className="relative flex-1 min-w-0">
              <ChartShell height={150}>
                {({ width, height }) => (
                  <>
                    <PieChart width={width} height={height}>
                      <Pie data={mixData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                        {mixData.map((entry, index) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none pb-1">
                      <span className="text-[9px] text-outline">板块总量</span>
                      <span className="font-data-mono font-bold text-xs text-on-surface">{formatNum(mixData.reduce((sum, item) => sum + item.value, 0))}</span>
                    </div>
                  </>
                )}
              </ChartShell>

              <div className="mt-2 space-y-1 select-none">
                {mixData.map((item) => {
                  const total = mixData.reduce((sum, n) => sum + n.value, 0) || 1;
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={item.name} className="flex justify-between items-center text-xs px-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-secondary text-[11px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-data-mono">
                        <span className="font-bold text-on-surface text-[11px]">{formatNum(item.value)}</span>
                        <span className="text-outline-variant text-[10px] bg-surface-container px-1 rounded">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px] min-w-0">
            <div className="mb-2 select-none">
              <div className="font-semibold text-on-surface flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-status-normal" />
                周度业务对比
              </div>
              <p className="text-[11px] text-outline mt-0.5">每天多版块活跃度条形对比</p>
            </div>
            <ChartShell height={250}>
              {({ width, height }) => (
                <BarChart width={width} height={height} data={weeklyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="新增动态" fill="#0ea5e9" radius={[3, 3, 0, 0]} barSize={8} />
                  <Bar dataKey="在售商品" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={8} />
                  <Bar dataKey="活跃服务" fill="#eab308" radius={[3, 3, 0, 0]} barSize={8} />
                  <Bar dataKey="当月订单" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={8} />
                </BarChart>
              )}
            </ChartShell>
          </div>

          <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px] min-w-0">
            <div className="mb-2 select-none">
              <div className="font-semibold text-on-surface flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-status-normal" />
                平台流量趋势
              </div>
              <p className="text-[11px] text-outline mt-0.5">展示页面浏览量 PV 与独立访客 UV</p>
            </div>
            <ChartShell height={250}>
              {({ width, height }) => (
                <AreaChart width={width} height={height} data={pvData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Area type="monotone" dataKey="浏览量(PV)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPV)" />
                  <Area type="monotone" dataKey="访客数(UV)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUV)" />
                </AreaChart>
              )}
            </ChartShell>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">待处理事项</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orderTasks.map((task) => (
            <div key={task.title} className={`bg-surface-container-lowest rounded-xl p-5 border-l-4 ${task.color} shadow-sm flex flex-col justify-between h-[140px]`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-status-pending font-bold">{task.icon}</span>
                  <span className="font-headline-md text-headline-md text-on-surface select-none">{task.title}</span>
                </div>
                <span className="font-data-mono text-headline-xl font-bold text-status-pending">{task.count}</span>
              </div>
              <div className="flex justify-between items-end mt-4 gap-3">
                <span className="font-body-sm text-body-sm text-secondary select-none">{task.desc}</span>
                <button onClick={() => onNavigate(task.path, task.filter)} className="px-4 py-1.5 bg-surface-container border border-outline-variant/50 text-on-surface text-label-md font-label-md rounded-lg hover:bg-surface-container-highest cursor-pointer transition-colors focus:outline-none">
                  去处理
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5">
          <h3 className="font-semibold text-on-surface mb-4">最新动态</h3>
          <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
            {dynamics.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-outline-variant/10 pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-on-surface truncate">{item.title}</div>
                  <div className="text-xs text-outline">{item.author} · {item.time}</div>
                </div>
                <button className="text-xs font-semibold text-primary" onClick={() => onNavigate('/admin/posts')}>查看</button>
              </div>
            ))}
            {dynamics.length === 0 && <div className="text-sm text-outline">暂无动态数据</div>}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-5">
          <h3 className="font-semibold text-on-surface mb-4">最近订单</h3>
          <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
            {orders.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-outline-variant/10 pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-on-surface truncate">{item.serviceName}</div>
                  <div className="text-xs text-outline">{item.buyerName} · {item.status}</div>
                </div>
                <button className="text-xs font-semibold text-primary" onClick={() => onNavigate('/admin/orders')}>查看</button>
              </div>
            ))}
            {orders.length === 0 && <div className="text-sm text-outline">暂无订单数据</div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
