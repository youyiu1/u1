/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Search,
  ChevronRight,
  House,
  Wrench,
  PawPrint,
  ShoppingBag,
  Truck,
  HeartPulse,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', name: '全部', icon: React.createElement(Search, { className: 'w-6 h-6' }) },
  { id: 'domestic', name: '家政', icon: React.createElement(House, { className: 'w-6 h-6' }) },
  { id: 'repair', name: '维修', icon: React.createElement(Wrench, { className: 'w-6 h-6' }) },
  { id: 'pet', name: '宠物', icon: React.createElement(PawPrint, { className: 'w-6 h-6' }) },
  { id: 'market', name: '闲置', icon: React.createElement(ShoppingBag, { className: 'w-6 h-6' }) },
  { id: 'logistics', name: '搬家', icon: React.createElement(Truck, { className: 'w-6 h-6' }) },
  { id: 'health', name: '健康', icon: React.createElement(HeartPulse, { className: 'w-6 h-6' }) },
  { id: 'more', name: '更多', icon: React.createElement(ChevronRight, { className: 'w-6 h-6' }) },
];
