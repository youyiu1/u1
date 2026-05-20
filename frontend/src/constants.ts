/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, ChevronRight } from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', name: '全部', icon: React.createElement(Search, { className: "w-6 h-6" }) },
  { id: 'domestic', name: '家政', icon: React.createElement('img', { src: "https://cdn-icons-png.flaticon.com/512/3252/3252971.png", className: "w-6 h-6" }) },
  { id: 'repair', name: '维修', icon: React.createElement('img', { src: "https://cdn-icons-png.flaticon.com/512/3252/3252980.png", className: "w-6 h-6" }) },
  { id: 'pet', name: '宠物', icon: React.createElement('img', { src: "https://cdn-icons-png.flaticon.com/512/3252/3252988.png", className: "w-6 h-6" }) },
  { id: 'market', name: '闲置', icon: React.createElement('img', { src: "https://cdn-icons-png.flaticon.com/512/3252/3252996.png", className: "w-6 h-6" }) },
  { id: 'logistics', name: '搬家', icon: React.createElement('img', { src: "https://cdn-icons-png.flaticon.com/512/3253/3253004.png", className: "w-6 h-6" }) },
  { id: 'health', name: '健康', icon: React.createElement('img', { src: "https://cdn-icons-png.flaticon.com/512/3253/3253012.png", className: "w-6 h-6" }) },
  { id: 'more', name: '更多', icon: React.createElement(ChevronRight, { className: "w-6 h-6" }) },
];