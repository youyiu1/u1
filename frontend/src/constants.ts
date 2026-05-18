/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Item, Notification, Post } from './types';
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

export const TRENDING = [
  { id: 't1', name: '五一小长假去哪玩', posts: '1.2k' },
  { id: 't2', name: '小区楼下新开的咖啡店', posts: '856' },
  { id: 't3', name: '寻找滨江公园慢跑搭子', posts: '432' },
  { id: 't4', name: '二手书共享计划', posts: '210' },
];

export const SUGGESTED_USERS = [
  { 
    id: 'u1', 
    name: '王大厨', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100', 
    desc: '资深美食家',
    followersCount: 1240,
    followingCount: 320,
    isFollowing: false
  },
  { 
    id: 'u2', 
    name: '摄影师小林', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100', 
    desc: '发现身边的美',
    followersCount: 850,
    followingCount: 412,
    isFollowing: true
  },
];

export const POSTS: Post[] = [
  {
    id: 'p1',
    author: {
      id: 'sel1',
      name: '爱生活的李阿姨',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      tag: '社区达人',
      verified: true,
      followersCount: 3420,
      followingCount: 156,
      isFollowing: false
    },
    content: '今天在小区门口发现了一家新开的花店，品种好齐全，老板人也特别好！强烈推荐给各位邻居~ 🌸🌷 有空去逛逛，心情会变好哦！',
    images: [
      'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519340241574-2dec49daa03c?auto=format&fit=crop&q=80&w=800'
    ],
    time: '30分钟前',
    location: '金地格林世界',
    likes: 24,
    commentsCount: 6,
    shares: 2,
    collections: 5,
    comments: [
      { id: 'c1', user: '张三', text: '真的吗？我也正想买点花回家！' },
      { id: 'c2', user: '李四', text: '老板确实很热情，上次送了我一枝向日葵。' }
    ]
  },
  {
     id: 'p2',
     author: {
       id: 'u3',
       name: '张三家的小狗',
       avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=100',
       tag: '萌宠号',
       verified: false,
       followersCount: 128,
       followingCount: 12,
       isFollowing: false
     },
     content: '有人在公园看到一只走失的柯基吗？邻居家的狗跑丢了，大家帮忙关注下，特征是背部有一块深色花纹。希望狗狗快点回家 🙏',
     images: [],
     time: '2小时前',
     location: '滨江公园',
     likes: 86,
     commentsCount: 15,
     shares: 12,
     collections: 8,
     comments: []
  }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: '专业家庭保洁 - 全屋深度除尘除螨及高温消毒',
    category: 'domestic',
    rating: 4.81,
    reviews: 128,
    distance: '1.2km',
    price: 150,
    unit: '次',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=800',
    highlights: ['4小时', '自备工具', '环保药剂'],
    description: '我们提供的不只是保洁，更是为您打造一个健康舒心的居家环境。我们的服务包括：全屋360°除尘、厨卫重垢去除、全屋除螨以及紫外线/高温蒸汽消毒。我们承诺使用环保、母婴级别的清洁药剂，所有服务人员均经过专业技能培训及严格背景调查，确保您的安全与隐私。',
    seller: {
      id: 'sel1',
      name: '芳姐家政',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      rating: '极好',
      onSaleCount: 15,
      soldCount: 450,
      followersCount: 3420,
      followingCount: 156,
      isFollowing: false
    }
  },
  {
    id: 's2',
    title: '上门宠物洗护 - 狗狗SPA与深度清洁',
    category: 'pet',
    rating: 5.0,
    reviews: 86,
    distance: '0.8km',
    price: 88,
    unit: '次',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
    highlights: ['自带设备', '温和沐浴'],
    description: '专业宠物洗护师，3年大厂经验。',
    seller: {
      id: 'sel2',
      name: '毛孩子管家',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      rating: '良好',
      onSaleCount: 8,
      soldCount: 120
    }
  },
  {
    id: 's3',
    title: '家庭电路维修 - 灯具插座安装及电路排查',
    category: 'repair',
    rating: 4.9,
    reviews: 215,
    distance: '2.1km',
    price: 50,
    unit: '时',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800',
    highlights: ['持证上岗', '快速响应'],
    description: '10年经验电工，解决各种疑难杂症。',
    seller: {
       id: 'sel3',
       name: '老李师傅',
       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
       rating: '极佳',
       onSaleCount: 4,
       soldCount: 890
    }
  },
  {
    id: 's4',
    title: '深夜厨房代客烹饪 - 邻里私房菜配送',
    category: 'domestic',
    rating: 4.95,
    reviews: 42,
    distance: '0.5km',
    price: 35,
    unit: '菜',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
    highlights: ['健康少油', '家里的味道'],
    description: '为您烹饪最纯正的家常用餐。',
    seller: {
       id: 'sel1',
       name: '芳姐家政',
       avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
       rating: '极好',
       onSaleCount: 15,
       soldCount: 450
    }
  }
];

export const ITEMS: Item[] = [
  {
    id: 'i1',
    title: "德龙 (De'Longhi) 意式半自动咖啡机 - 95成新",
    category: 'market',
    condition: '95成新',
    price: 3200,
    originalPrice: 5480,
    location: '浦东新区',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800'],
    description: '成色很好，用了不到半年。',
    seller: {
      id: 'sel3',
      name: 'CoffeeLover',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      rating: '极好',
      onSaleCount: 12,
      soldCount: 156
    },
    verified: true,
    freeShipping: true
  },
  {
    id: 'i2',
    title: '宜家 (IKEA) 简约原木风书桌',
    category: 'market',
    condition: '8成新',
    price: 260,
    originalPrice: 899,
    location: '静安区',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800'],
    description: '搬家回血处理，自提优先。',
    seller: {
       id: 'sel4',
       name: '上海漂泊客',
       avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
       rating: '诚信',
       onSaleCount: 5,
       soldCount: 24
    },
    verified: false,
    freeShipping: false
  },
  {
    id: 'i3',
    title: 'Nintendo Switch 日版蓝红 - 带健身环',
    category: 'market',
    condition: '99新',
    price: 1800,
    originalPrice: 2400,
    location: '徐汇区',
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&q=80&w=800'],
    description: '吃灰半年，全套包装齐全。',
    seller: {
       id: 'sel2',
       name: '毛孩子管家',
       avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
       rating: '良好',
       onSaleCount: 8,
       soldCount: 120
    },
    verified: true,
    freeShipping: true
  },
  {
    id: 'i4',
    title: '大疆 DJI Mini 3 Pro 无人机 - 畅飞套装',
    category: 'market',
    condition: '95新',
    price: 4500,
    originalPrice: 5999,
    location: '黄浦区',
    image: 'https://images.unsplash.com/photo-1473960103862-da8a85940ff3?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1473960103862-da8a85940ff3?auto=format&fit=crop&q=80&w=800'],
    description: '炸机退役，没时间飞了。',
    seller: {
       id: 'sel5',
       name: '云端视界',
       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
       rating: '大神',
       onSaleCount: 2,
       soldCount: 12
    },
    verified: true,
    freeShipping: true
  }
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: '预订成功',
    content: '您的家庭保洁服务已预订成功，预订时间：2024-05-24 09:00',
    time: '2小时前',
    read: false
  },
  {
    id: 'n2',
    title: '新消息',
    content: '您关注的商品 "德龙咖啡机" 有了新的咨询',
    time: '昨天',
    read: true
  }
];
