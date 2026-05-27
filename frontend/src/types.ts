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
  bio?: string;
  isVerified: boolean;
  followersCount?: number;
  followingCount?: number;
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
  receiverId?: string;
  text?: string;        // 前端使用
  content?: string;     // 后端返回
  timestamp?: string;   // 前端使用
  createTime?: string;  // 后端返回
  isRead?: boolean;
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
  sellerId: string;
  seller?: Seller;
}

export interface Item {
  id: string;
  title: string;
  category: string;
  itemCondition: string;
  price: number;
  originalPrice: number;
  location: string;
  image: string;
  images: string[];
  description: string;
  // 卖家信息（扁平化，后端MarketItemVO返回）
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerVerified?: boolean;
  sellerFollowersCount?: number;
  sellerOnSaleCount?: number;
  sellerSoldCount?: number;
  // 兼容旧结构
  seller?: Seller;
  verified: boolean;
  freeShipping: boolean;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: string | number;
  onSaleCount: number;
  soldCount: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface ServiceDetail extends Omit<Service, 'seller'> {
  seller: ServiceSeller;
}

export interface ServiceSeller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  soldCount: number;
  followersCount: number;
  isFollowing: boolean;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  content: string;
  createTime: string;
  likes: number;
  isLiked?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  serviceName?: string;
  isProcessed?: boolean;
  orderId?: string;
  relatedBookingId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Order {
  id: string;
  bookingId?: string;
  buyerId: string;
  sellerId: string;
  serviceId?: string;
  serviceTitle: string;
  price: number;
  bookingDate: string;
  bookingTime: string;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedTime?: string;
  createTime: string;
  updateTime?: string;
}

export interface ReviewFormData {
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
}

export interface Comment {
  id: string;
  user?: string;
  userName?: string;
  userAvatar?: string;
  text?: string;
  content?: string;
  avatar?: string;
  time?: string;
  createTime?: string;
  likes?: number;
}

export interface Post {
  id: string;
  title?: string;  // 标题
  // 作者信息（后端 NewsVO 扁平返回）
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorTag?: string;
  authorVerified?: boolean;
  authorFollowersCount?: number;
  // 兼容旧结构：如果 author 对象存在则优先使用
  author?: {
    id?: string;
    name: string;
    avatar: string;
    tag: string;
    verified: boolean;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
  };
  category?: string;
  content: string;
  images: string[];
  time?: string;
  createTime?: string;  // 后端返回的创建时间
  location: string;
  likes: number;
  commentsCount: number;
  shares: number;
  collections: number;
  comments: Comment[];
  // 当前用户点赞/收藏状态
  isLiked?: boolean;
  isFavorited?: boolean;
  isFollowing?: boolean;
}
