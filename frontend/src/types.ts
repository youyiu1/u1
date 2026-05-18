/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  tag?: string;
  isVerified: boolean;
}

export interface ChatPartner {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  price: number;
  unit: string;
  image: string;
  highlights: string[];
  description: string;
  seller: Seller;
}

export interface Item {
  id: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  originalPrice: number;
  location: string;
  image: string;
  images: string[];
  description: string;
  seller: Seller;
  verified: boolean;
  freeShipping: boolean;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: string;
  onSaleCount: number;
  soldCount: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  avatar?: string;
  time?: string;
}

export interface Post {
  id: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
    tag: string;
    verified: boolean;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
  };
  content: string;
  images: string[];
  time: string;
  location: string;
  likes: number;
  commentsCount: number;
  shares: number;
  collections: number;
  comments: Comment[];
}
