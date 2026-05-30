/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { DashboardStats, Dynamic, Order } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats;
  dynamics: Dynamic[];
  orders: Order[];
  onNavigate: (tab: string, filter?: string) => void;
}

export default function DashboardView({ stats, dynamics, orders, onNavigate }: DashboardViewProps) {
  // Format numbers with commas
  const formatNum = (num: number) => {
    return num.toLocaleString();
  };

  const basePV = Math.max(stats.totalUsers * 8, 1200);
  const baseUV = Math.max(stats.totalUsers * 3, 450);

  const pvData = [
    { name: '周一', '浏览量(PV)': Math.floor(basePV * 0.74), '访客数(UV)': Math.floor(baseUV * 0.68) },
    { name: '周二', '浏览量(PV)': Math.floor(basePV * 0.88), '访客数(UV)': Math.floor(baseUV * 0.82) },
    { name: '周三', '浏览量(PV)': Math.floor(basePV * 1.15), '访客数(UV)': Math.floor(baseUV * 1.05) },
    { name: '周四', '浏览量(PV)': Math.floor(basePV * 0.92), '访客数(UV)': Math.floor(baseUV * 0.86) },
    { name: '周五', '浏览量(PV)': Math.floor(basePV * 1.28), '访客数(UV)': Math.floor(baseUV * 1.18) },
    { name: '周六', '浏览量(PV)': Math.floor(basePV * 1.62), '访客数(UV)': Math.floor(baseUV * 1.48) },
    { name: '周日', '浏览量(PV)': Math.floor(basePV * 1.45), '访客数(UV)': Math.floor(baseUV * 1.32) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Section 1: Core Data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('/admin/users')}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-secondary select-none">总用户数</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px] fill">group</span>
            </div>
          </div>
          <div className="font-data-mono text-headline-xl font-bold text-on-surface mb-2">
            {formatNum(stats.totalUsers)}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm select-none">
            <span className="material-symbols-outlined text-[16px] text-status-normal font-bold">trending_up</span>
            <span className="text-status-normal font-semibold">+{stats.totalUsersTrend}%</span>
            <span className="text-on-surface-variant/60 ml-1">较上月</span>
          </div>
        </motion.div>

        {/* New Dynamics */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('/admin/posts')}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-secondary select-none">新增动态</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed/30 flex items-center justify-center text-on-secondary-fixed-variant group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">explore</span>
            </div>
          </div>
          <div className="font-data-mono text-headline-xl font-bold text-on-surface mb-2">
            {formatNum(stats.newPosts)}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm select-none">
            <span className="material-symbols-outlined text-[16px] text-status-normal font-bold">trending_up</span>
            <span className="text-status-normal font-semibold">+{stats.newPostsTrend}%</span>
            <span className="text-on-surface-variant/60 ml-1">较上周</span>
          </div>
        </motion.div>

        {/* On-sale Goods */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('/admin/market')}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-secondary select-none">在售商品</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-on-tertiary-fixed-variant group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div className="font-data-mono text-headline-xl font-bold text-on-surface mb-2">
            {formatNum(stats.activeGoods)}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm select-none">
            <span className="material-symbols-outlined text-[16px] text-status-error font-bold">trending_down</span>
            <span className="text-status-error font-semibold">{stats.activeGoodsTrend}%</span>
            <span className="text-on-surface-variant/60 ml-1">较上月</span>
          </div>
        </motion.div>

        {/* Active Services */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('/admin/services')}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-secondary select-none">活跃服务</span>
            <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">home_repair_service</span>
            </div>
          </div>
          <div className="font-data-mono text-headline-xl font-bold text-on-surface mb-2">
            {formatNum(stats.activeServices)}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm select-none">
            <span className="material-symbols-outlined text-[16px] text-status-normal font-bold">trending_up</span>
            <span className="text-status-normal font-semibold">+{stats.activeServicesTrend}%</span>
            <span className="text-on-surface-variant/60 ml-1">较上月</span>
          </div>
        </motion.div>

        {/* Monthly Orders */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('/admin/orders')}
          className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-label-md text-secondary select-none">当月订单</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <div className="font-data-mono text-headline-xl font-bold text-on-surface mb-2">
            {formatNum(stats.monthlyOrders)}
          </div>
          <div className="flex items-center gap-1 font-body-sm text-body-sm select-none">
            <span className="material-symbols-outlined text-[16px] text-status-normal font-bold">trending_up</span>
            <span className="text-status-normal font-semibold">+{stats.monthlyOrdersTrend}%</span>
            <span className="text-on-surface-variant/60 ml-1">较上月</span>
          </div>
        </motion.div>
      </div>

      {/* Analytical Statistics Visual Panel */}
      <div className="space-y-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-5">
          <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-4 select-none">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">query_stats</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">同城运营多维交叉数据分析中心</h2>
            </div>
            <span className="font-data-mono text-xs text-outline bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
              数据周期：截止 2026年5月 实时
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. 折线统计图 (Line Chart) */}
            <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px]">
              <div className="mb-2 select-none">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  历史业务增长趋势 (折线图)
                </span>
                <p className="text-[11px] text-outline mt-0.5">展示过去半年度核心业务板块的新增增长轨迹</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { name: '12月', '新增动态': 240, '在售商品': 180, '活跃服务': 85, '当月订单': 120 },
                      { name: '1月', '新增动态': 310, '在售商品': 220, '活跃服务': 95, '当月订单': 155 },
                      { name: '2月', '新增动态': 430, '在售商品': 310, '活跃服务': 110, '当月订单': 210 },
                      { name: '3月', '新增动态': stats.newPosts > 50 ? Math.floor(stats.newPosts * 0.7) : 380, '在售商品': stats.activeGoods > 50 ? Math.floor(stats.activeGoods * 0.8) : 290, '活跃服务': stats.activeServices > 20 ? Math.floor(stats.activeServices * 0.8) : 120, '当月订单': stats.monthlyOrders > 20 ? Math.floor(stats.monthlyOrders * 0.75) : 180 },
                      { name: '4月', '新增动态': stats.newPosts > 30 ? Math.floor(stats.newPosts * 0.85) : 480, '在售商品': stats.activeGoods > 30 ? Math.floor(stats.activeGoods * 0.9) : 340, '活跃服务': stats.activeServices > 15 ? Math.floor(stats.activeServices * 0.9) : 138, '当月订单': stats.monthlyOrders > 15 ? Math.floor(stats.monthlyOrders * 0.9) : 230 },
                      { name: '5月', '新增动态': stats.newPosts, '在售商品': stats.activeGoods, '活跃服务': stats.activeServices, '当月订单': stats.monthlyOrders },
                    ]}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      content={(props: any) => {
                        const { active, payload, label } = props;
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 border border-outline-variant/30 rounded-xl shadow-lg text-on-surface text-xs">
                              <p className="font-bold mb-1">{label}</p>
                              <div className="space-y-1.5">
                                {payload.map((entry: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-secondary select-none">{entry.name}:</span>
                                    <span className="font-data-mono font-bold ml-auto">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Line type="monotone" dataKey="新增动态" stroke="#0ea5e9" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="在售商品" stroke="#f43f5e" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="活跃服务" stroke="#eab308" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="当月订单" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. 扇形统计图 (Pie Chart) */}
            <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px]">
              <div className="select-none mb-2">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  当前业务成分占比 (扇形图)
                </span>
                <p className="text-[11px] text-outline mt-0.5">当前同城四大版块活跃业务分布百分比</p>
              </div>

              <div className="h-[150px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '新增动态', value: stats.newPosts || 1, color: '#0ea5e9' },
                        { name: '在售商品', value: stats.activeGoods || 1, color: '#f43f5e' },
                        { name: '活跃服务', value: stats.activeServices || 1, color: '#eab308' },
                        { name: '当月订单', value: stats.monthlyOrders || 1, color: '#8b5cf6' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {[
                        { name: '新增动态', value: stats.newPosts || 1, color: '#0ea5e9' },
                        { name: '在售商品', value: stats.activeGoods || 1, color: '#f43f5e' },
                        { name: '活跃服务', value: stats.activeServices || 1, color: '#eab308' },
                        { name: '当月订单', value: stats.monthlyOrders || 1, color: '#8b5cf6' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={(props: any) => {
                        const { active, payload } = props;
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md px-2.5 py-1.5 border border-outline-variant/30 rounded-lg shadow-md text-on-surface text-xs">
                              <span className="font-semibold" style={{ color: data.color }}>{data.name}</span>
                              <span className="font-data-mono font-bold ml-2">{data.value} 件</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none pb-1">
                  <span className="text-[9px] text-outline">板块活跃</span>
                  <span className="font-data-mono font-bold text-xs text-on-surface">
                    {formatNum((stats.newPosts || 0) + (stats.activeGoods || 0) + (stats.activeServices || 0) + (stats.monthlyOrders || 0))}
                  </span>
                </div>
              </div>

              {/* Pie legend details */}
              <div className="flex-1 flex flex-col justify-end space-y-1 mt-1 select-none">
                {[
                  { name: '新增动态', value: stats.newPosts || 1, color: '#0ea5e9' },
                  { name: '在售商品', value: stats.activeGoods || 1, color: '#f43f5e' },
                  { name: '活跃服务', value: stats.activeServices || 1, color: '#eab308' },
                  { name: '当月订单', value: stats.monthlyOrders || 1, color: '#8b5cf6' },
                ].map((item, index) => {
                  const total = (stats.newPosts || 0) + (stats.activeGoods || 0) + (stats.activeServices || 0) + (stats.monthlyOrders || 0) || 4;
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="flex justify-between items-center text-xs px-1">
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

            {/* 3. 条形统计图 (Bar Chart) */}
            <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px]">
              <div className="mb-2 select-none">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-normal" />
                  周度周期负荷走势对比 (条形图)
                </span>
                <p className="text-[11px] text-outline mt-0.5">每日多版块互动及交易活跃度条形对比</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: '周一', '新增动态': Math.floor((stats.newPosts || 100) * 0.11), '在售商品': Math.floor((stats.activeGoods || 100) * 0.10), '活跃服务': Math.floor((stats.activeServices || 100) * 0.08), '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.11) },
                      { name: '周二', '新增动态': Math.floor((stats.newPosts || 100) * 0.14), '在售商品': Math.floor((stats.activeGoods || 100) * 0.12), '活跃服务': Math.floor((stats.activeServices || 100) * 0.12), '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.13) },
                      { name: '周三', '新增动态': Math.floor((stats.newPosts || 100) * 0.17), '在售商品': Math.floor((stats.activeGoods || 100) * 0.14), '活跃服务': Math.floor((stats.activeServices || 100) * 0.11), '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.14) },
                      { name: '周四', '新增动态': Math.floor((stats.newPosts || 100) * 0.12), '在售商品': Math.floor((stats.activeGoods || 100) * 0.11), '活跃服务': Math.floor((stats.activeServices || 100) * 0.10), '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.12) },
                      { name: '周五', '新增动态': Math.floor((stats.newPosts || 100) * 0.16), '在售商品': Math.floor((stats.activeGoods || 100) * 0.15), '活跃服务': Math.floor((stats.activeServices || 100) * 0.15), '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.16) },
                      { name: '周六', '新增动态': Math.floor((stats.newPosts || 100) * 0.15) + 6, '在售商品': Math.floor((stats.activeGoods || 100) * 0.19) + 4, '活跃服务': Math.floor((stats.activeServices || 100) * 0.22) + 2, '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.20) + 5 },
                      { name: '周日', '新增动态': Math.floor((stats.newPosts || 100) * 0.15) + 4, '在售商品': Math.floor((stats.activeGoods || 100) * 0.19) + 2, '活跃服务': Math.floor((stats.activeServices || 100) * 0.22) + 2, '当月订单': Math.floor((stats.monthlyOrders || 100) * 0.14) + 4 },
                    ]}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      content={(props: any) => {
                        const { active, payload, label } = props;
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 border border-outline-variant/30 rounded-xl shadow-lg text-on-surface text-xs">
                              <p className="font-bold mb-1">{label}</p>
                              <div className="space-y-1.5">
                                {payload.map((entry: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-secondary select-none">{entry.name}:</span>
                                    <span className="font-data-mono font-bold ml-auto">{entry.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Bar dataKey="新增动态" fill="#0ea5e9" radius={[3, 3, 0, 0]} barSize={8} />
                    <Bar dataKey="在售商品" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={8} />
                    <Bar dataKey="活跃服务" fill="#eab308" radius={[3, 3, 0, 0]} barSize={8} />
                    <Bar dataKey="当月订单" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. 平台流量与浏览统计 (Area Chart) */}
            <div className="bg-surface-container-low/20 rounded-xl border border-outline-variant/20 p-4 flex flex-col justify-between h-[360px]">
              <div className="mb-2 select-none">
                <span className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-normal" />
                  同城平台流量与浏览统计 (面积图)
                </span>
                <p className="text-[11px] text-outline mt-0.5">展示每日页面浏览量 (PV) 与独立访客数 (UV) 的波峰轨迹</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={pvData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      content={(props: any) => {
                        const { active, payload, label } = props;
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 border border-outline-variant/30 rounded-xl shadow-lg text-on-surface text-xs">
                              <p className="font-bold mb-1">{label}</p>
                              <div className="space-y-1.5">
                                {payload.map((entry: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-secondary select-none">{entry.name}:</span>
                                    <span className="font-data-mono font-bold ml-auto">{formatNum(entry.value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Area type="monotone" dataKey="浏览量(PV)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPV)" activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="访客数(UV)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUV)" activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Pending Tasks */}
      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">待处理事项</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task Card 1 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border-l-4 border-l-status-pending shadow-sm flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-pending font-bold">home_repair_service</span>
                <span className="font-headline-md text-headline-md text-on-surface select-none">待审核服务</span>
              </div>
              <span className="font-data-mono text-headline-xl font-bold text-status-pending">12</span>
            </div>
            <div className="flex justify-between items-end mt-4">
              <span className="font-body-sm text-body-sm text-secondary select-none">需人工确认资质与描述</span>
              <button
                onClick={() => onNavigate('/admin/services', 'pending')}
                className="px-4 py-1.5 bg-surface-container border border-outline-variant/50 text-on-surface text-label-md font-label-md rounded-lg hover:bg-surface-container-highest cursor-pointer transition-colors focus:outline-none"
              >
                去处理
              </button>
            </div>
          </div>

          {/* Task Card 2 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border-l-4 border-l-status-error shadow-sm flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-error font-bold">gavel</span>
                <span className="font-headline-md text-headline-md text-on-surface select-none">违规内容</span>
              </div>
              <span className="font-data-mono text-headline-xl font-bold text-status-error">5</span>
            </div>
            <div className="flex justify-between items-end mt-4">
              <span className="font-body-sm text-body-sm text-secondary select-none">包含举报及机审拦截项</span>
              <button
                onClick={() => onNavigate('/admin/posts', 'pending')}
                className="px-4 py-1.5 bg-status-error text-on-primary text-label-md font-label-md rounded-lg hover:opacity-90 cursor-pointer transition-all border-none focus:outline-none"
              >
                去处理
              </button>
            </div>
          </div>

          {/* Task Card 3 */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border-l-4 border-l-status-unlisted shadow-sm flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-status-unlisted font-bold">warning</span>
                <span className="font-headline-md text-headline-md text-on-surface select-none">异常订单</span>
              </div>
              <span className="font-data-mono text-headline-xl font-bold text-status-unlisted">3</span>
            </div>
            <div className="flex justify-between items-end mt-4">
              <span className="font-body-sm text-body-sm text-secondary select-none">退款纠纷及超时未处理</span>
              <button
                onClick={() => onNavigate('/admin/orders', 'abnormal')}
                className="px-4 py-1.5 bg-surface-container border border-outline-variant/50 text-on-surface text-label-md font-label-md rounded-lg hover:bg-surface-container-highest cursor-pointer transition-colors focus:outline-none"
              >
                去处理
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

