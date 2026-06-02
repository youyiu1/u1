/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  tag?: string;
  status: 'normal' | 'disabled';
  adminRole: 'USER' | 'READONLY_ADMIN' | 'ADMIN' | 'SUPER_ADMIN';
  verified: 'verified' | 'unverified';
  region: string;
  registerTime: string;
  followersCount: number;
  followingCount: number;
  dynamicsCount: number;
  goodsCount: number;
  servicesCount: number;
}

export interface Dynamic {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  category: string;
  time: string;
  images: string[];
  status: 'pending' | 'normal' | 'removed';
  likes: number;
  commentsCount: number;
  comments: Comment[];
  rejectReason?: string;
  userId?: string;
  authorTag?: string;
  verifiedUser?: boolean;
}

export interface Goods {
  id: string;
  title: string;
  price: number;
  category: 'tech' | 'home' | 'fashion' | 'clothing' | 'sports' | 'others';
  condition: string; // e.g., '涔濇垚鏂?, '鍏垚鏂?
  sellerName: string;
  sellerId: string;
  sellerAvatar: string;
  sellerTag?: string;
  sellerRating: number;
  location: string;
  distance: string;
  images: string[];
  description: string;
  time: string;
  status: 'active' | 'sold' | 'removed' | 'pending';
  rejectReason?: string;
}

export interface Service {
  id: string;
  title: string;
  category: string; // e.g. "缁翠慨瀹夎 / 瀹剁數娓呮礂"
  providerId?: string;
  providerName: string;
  providerAvatar: string;
  providerTag?: string;
  isVerifiedProvider?: boolean;
  price: number;
  unit: string; // e.g., "/娆?, "/灏忔椂"
  rating: number | string; // e.g., 4.9 or '-'
  reviewCount: number;
  time: string;
  status: 'pending' | 'active' | 'rejected';
  area: string;
  phone: string;
  description: string;
  rejectReason?: string;
}

export interface Step {
  name: string;
  time: string;
}

export interface FeeItem {
  name: string;
  value: number;
  isDiscount?: boolean;
}

export interface Order {
  id: string;
  buyerId?: string;
  buyerName: string;
  buyerTag?: string;
  buyerAvatar?: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerId?: string;
  sellerName: string;
  sellerTag?: string;
  sellerAvatar?: string;
  sellerPhone: string;
  sellerRating: string;
  serviceName: string;
  price: number;
  paymentPrice: number;
  scheduleTime: string;
  buildTime: string;
  status: 'pending_payment' | 'pending_execution' | 'completed' | 'canceled' | 'abnormal';
  cancelReason?: string;
  steps: Step[];
  remark: string;
  feeBreakdown: FeeItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'dynamic' | 'goods' | 'service';
  parentId?: string;
  status: 'normal' | 'disabled';
  order: number;
  subCount?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  target: 'all' | 'specific';
  time: string;
  status: 'sent' | 'scheduled';
  read: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalUsersTrend: number; // percentage, positive is up, negative down
  newPosts: number;
  newPostsTrend: number;
  activeGoods: number;
  activeGoodsTrend: number;
  activeServices: number;
  activeServicesTrend: number;
  monthlyOrders: number;
  monthlyOrdersTrend: number;
}

export interface ManagedComment {
  id: string;
  targetType: 'dynamic' | 'goods' | 'service';
  targetId: string;
  targetTitle: string;
  authorName: string;
  authorTag?: string;
  authorAvatar: string;
  content: string;
  time: string;
  status: 'pending' | 'normal' | 'flagged' | 'hidden';
}

export interface BlacklistItem {
  id: string;
  targetType: 'user' | 'keyword' | 'ip';
  targetValue: string;
  reason: string;
  creator: string;
  time: string;
}

export interface ManagedImage {
  id: string;
  url: string;
  name: string;
  size: string;
  category: 'dynamic' | 'goods' | 'avatar' | 'banner';
  uploader: string;
  uploaderTag?: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'flagged';
}

export interface ManagedMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderTag?: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverTag?: string;
  receiverAvatar: string;
  content: string;
  messageType: 'text' | 'image' | string;
  mediaUrl: string;
  isRead: boolean;
  createTime: string;
}

export interface LoginLogItem {
  id: string;
  userId: string;
  username: string;
  ip: string;
  device: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
  failReason?: string;
}

export interface OperationLogItem {
  id: string;
  operator: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  time: string;
  status: 'success' | 'failed';
  details?: string;
}

export interface SystemMenu {
  id: string;
  parentId?: string;
  name: string;
  path: string;
  icon: string;
  order: number;
  status: 'active' | 'disabled';
  type: 'directory' | 'menu' | 'button';
  permissionCode?: string;
}

export interface SystemRole {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'disabled';
  createTime: string;
  memberCount: number;
  menuIds: string[];
  permissionCodes: string[];
}

export interface SystemPermission {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  status: 'active' | 'disabled';
  createTime: string;
}

