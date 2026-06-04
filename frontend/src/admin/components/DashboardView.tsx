/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
type SummaryItem = {
  title: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
  bg: string;
  onClick: () => void;
};
type DashboardTask = {
  title: string;
  count: number;
  desc: string;
  path: string;
  filter: string;
  icon: string;
  color: string;
};

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

  const summaryItems: SummaryItem[] = [
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

  const orderTasks: DashboardTask[] = [
    { title: '审核服务', count: pendingServiceCount, desc: '真实待处理：服务待审核', path: '/admin/services', filter: 'pending', icon: 'home_repair_service', color: 'border-l-status-pending' },
    { title: '违规内容', count: pendingDynamicCount, desc: '真实待处理：动态待审核', path: '/admin/posts', filter: 'pending', icon: 'gavel', color: 'border-l-status-error' },
    { title: '异常订单', count: abnormalOrderCount, desc: '真实待处理：异常订单', path: '/admin/orders', filter: 'abnormal', icon: 'warning', color: 'border-l-status-unlisted' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryItems.map((item) => (
          <React.Fragment key={item.title}>
            <DashboardSummaryCard item={item} />
          </React.Fragment>
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
          <ChartPanel title="业务增长趋势" description="展示过去一周核心业务板块变化" dotClassName="bg-primary">
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
          </ChartPanel>

          <ChartPanel title="当前业务占比" description="展示后台四大板块的分布情况" dotClassName="bg-secondary">
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
          </ChartPanel>

          <ChartPanel title="周度业务对比" description="每天多版块活跃度条形对比" dotClassName="bg-status-normal">
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
          </ChartPanel>

          <ChartPanel title="平台流量趋势" description="展示页面浏览量 PV 与独立访客 UV" dotClassName="bg-status-normal">
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
          </ChartPanel>
        </div>
      </div>

      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">待处理事项</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orderTasks.map((task) => (
            <React.Fragment key={task.title}>
              <TaskCard task={task} onNavigate={onNavigate} />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverviewList
          title="最新动态"
          emptyText="暂无动态数据"
          items={dynamics.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: `${item.author} · ${item.time}`,
            path: '/admin/posts',
          }))}
          onNavigate={onNavigate}
        />

        <OverviewList
          title="最近订单"
          emptyText="暂无订单数据"
          items={orders.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.serviceName,
            subtitle: `${item.buyerName} · ${item.status}`,
            path: '/admin/orders',
          }))}
          onNavigate={onNavigate}
        />
      </div>
    </motion.div>
  );
}

function DashboardSummaryCard({ item }: { item: SummaryItem }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={item.onClick}
      className="group cursor-pointer rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="font-label-md text-label-md text-secondary">{item.title}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color} transition-transform group-hover:scale-110`}>
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
        </div>
      </div>
      <div className="mb-2 font-data-mono text-headline-xl font-bold text-on-surface">{item.value}</div>
      <div className="flex items-center gap-1 font-body-sm text-body-sm">
        <span className={`material-symbols-outlined text-[16px] font-bold ${item.color}`}>trending_up</span>
        <span className="font-semibold text-status-normal">{item.trend}</span>
      </div>
    </motion.div>
  );
}

function ChartPanel({
  title,
  description,
  dotClassName,
  children,
}: {
  title: string;
  description: string;
  dotClassName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-[360px] min-w-0 flex-col justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low/20 p-4">
      <div className="mb-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-on-surface">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
          {title}
        </div>
        <p className="mt-0.5 text-[11px] text-outline">{description}</p>
      </div>
      {children}
    </div>
  );
}

function TaskCard({
  task,
  onNavigate,
}: {
  task: DashboardTask;
  onNavigate: (tab: string, filter?: string) => void;
}) {
  return (
    <div className={`flex h-[140px] flex-col justify-between rounded-xl border-l-4 bg-surface-container-lowest p-5 shadow-sm ${task.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined font-bold text-status-pending">{task.icon}</span>
          <span className="font-headline-md text-headline-md text-on-surface">{task.title}</span>
        </div>
        <span className="font-data-mono text-headline-xl font-bold text-status-pending">{task.count}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="font-body-sm text-body-sm text-secondary">{task.desc}</span>
        <button
          onClick={() => onNavigate(task.path, task.filter)}
          className="rounded-lg border border-outline-variant/50 bg-surface-container px-4 py-1.5 text-label-md font-label-md text-on-surface transition-colors hover:bg-surface-container-highest focus:outline-none"
        >
          去处理
        </button>
      </div>
    </div>
  );
}

function OverviewList({
  title,
  emptyText,
  items,
  onNavigate,
}: {
  title: string;
  emptyText: string;
  items: Array<{ id: string; title: string; subtitle: string; path: string }>;
  onNavigate: (tab: string, filter?: string) => void;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5">
      <h3 className="mb-4 font-semibold text-on-surface">{title}</h3>
      <div className="max-h-[280px] space-y-3 overflow-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border-b border-outline-variant/10 pb-3 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-on-surface">{item.title}</div>
              <div className="text-xs text-outline">{item.subtitle}</div>
            </div>
            <button className="text-xs font-semibold text-primary" onClick={() => onNavigate(item.path)}>
              查看
            </button>
          </div>
        ))}
        {items.length === 0 ? <div className="text-sm text-outline">{emptyText}</div> : null}
      </div>
    </div>
  );
}
