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
  phone?: string;
  region?: string;
  status?: string;
  createdAt?: string;
  pushEnabled?: boolean;
  messageNotify?: boolean;
  followNotify?: boolean;
  likeNotify?: boolean;
  commentNotify?: boolean;
  systemNotify?: boolean;
  profileVisible?: string;
  postsVisible?: string;
  showLocation?: boolean;
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
  text?: string;
  content?: string;
  messageType?: 'text' | 'image' | string;
  mediaUrl?: string;
  timestamp?: string;
  createTime?: string;
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
  images?: string[];
  highlights: string[];
  description: string;
  sellerId: string;
  seller?: Seller;
  status?: 'pending' | 'active' | 'rejected';
  rejectReason?: string;
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
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  sellerVerified?: boolean;
  sellerFollowersCount?: number;
  sellerOnSaleCount?: number;
  sellerSoldCount?: number;
  seller?: Seller;
  verified: boolean;
  freeShipping: boolean;
  status?: 'pending' | 'active' | 'sold' | 'removed' | 'rejected';
  rejectReason?: string;
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
  parentId?: string;
  user?: string;
  userName?: string;
  userAvatar?: string;
  text?: string;
  content?: string;
  avatar?: string;
  time?: string;
  createTime?: string;
  likes?: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  title?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorTag?: string;
  authorVerified?: boolean;
  authorFollowersCount?: number;
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
  createTime?: string;
  location: string;
  likes: number;
  commentsCount: number;
  shares: number;
  collections: number;
  comments: Comment[];
  status?: 'pending' | 'normal' | 'removed';
  rejectReason?: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  isFollowing?: boolean;
  tags?: string[];
}
