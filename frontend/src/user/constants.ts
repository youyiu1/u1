/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bike,
  Brush,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  House,
  MoreHorizontal,
  PawPrint,
  Search,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';

export interface CategoryOption {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

const iconClassName = 'h-4 w-4';
const homeIconClassName = 'w-6 h-6';

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', name: '全部', icon: React.createElement(Search, { className: homeIconClassName }) },
  { id: 'domestic', name: '家政', icon: React.createElement(House, { className: homeIconClassName }) },
  { id: 'repair', name: '维修', icon: React.createElement(Wrench, { className: homeIconClassName }) },
  { id: 'pet', name: '宠物', icon: React.createElement(PawPrint, { className: homeIconClassName }) },
  { id: 'market', name: '闲置', icon: React.createElement(ShoppingBag, { className: homeIconClassName }) },
  { id: 'logistics', name: '搬家', icon: React.createElement(Truck, { className: homeIconClassName }) },
  { id: 'health', name: '健康', icon: React.createElement(HeartPulse, { className: homeIconClassName }) },
  { id: 'more', name: '更多', icon: React.createElement(ChevronRight, { className: homeIconClassName }) },
];

export const MARKET_CATEGORIES: CategoryOption[] = [
  { id: 'all', name: '全部', icon: React.createElement(Sparkles, { className: iconClassName }) },
  { id: 'tech', name: '数码', icon: React.createElement(Smartphone, { className: iconClassName }) },
  { id: 'home', name: '家居', icon: React.createElement(Sofa, { className: iconClassName }) },
  { id: 'fashion', name: '美妆', icon: React.createElement(Sparkles, { className: iconClassName }) },
  { id: 'clothing', name: '穿搭', icon: React.createElement(Shirt, { className: iconClassName }) },
  { id: 'sports', name: '户外', icon: React.createElement(Bike, { className: iconClassName }) },
  { id: 'others', name: '其他', icon: React.createElement(MoreHorizontal, { className: iconClassName }) },
];

export const SERVICE_CATEGORIES: CategoryOption[] = [
  { id: 'all', name: '全部分类', icon: React.createElement(Sparkles, { className: iconClassName }) },
  { id: 'domestic', name: '家政保洁', icon: React.createElement(Brush, { className: iconClassName }) },
  { id: 'repair', name: '家庭维修', icon: React.createElement(Wrench, { className: iconClassName }) },
  { id: 'pet', name: '宠物生活', icon: React.createElement(PawPrint, { className: iconClassName }) },
  { id: 'sports', name: '运动私教', icon: React.createElement(Dumbbell, { className: iconClassName }) },
];
