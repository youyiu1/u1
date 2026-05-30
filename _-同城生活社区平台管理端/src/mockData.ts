/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Dynamic, Goods, Service, Order, CategoryItem, NotificationItem, DashboardStats, ManagedComment, BlacklistItem, ManagedImage, LoginLogItem, OperationLogItem } from './types';

// Avatars from prototype
export const AVATARS = {
  admin: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAutf8uw-UP_WcJF6DedJ7BJ-58j6AAoLLsPj5uet4SuxCOsbEVOsOt8J5Q8cq0EcOJjh94kvPemlbPGCcdd89_oNXUsQRyuMWCsUQlagzBJhnOTUtw94XVV1AIw494VL8MRVgRwo0k2vWHujUJ-JYDSlLcvmZOOau40QddlzoeAwLsvEYy0BeAyExWOUQIL9zD8ULX6ruVNErCoPp9-hFCH6zrLtpvJwLdnaYJ1EBsCdh4kv_Dyp_5tUU8mZI1XzDOqNQ03ZcnPHZ4',
  linQingfeng: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnptQFBS0zmjRhJeXxO1tHXMbz6Ex3j_HEvwrbqg6pNEET__9uPNpn6R4yRYqU7myyNC9MXf1342qtpuqlY-NybWk4FaIugm_YpZ6DwahAH1PtmplMsFv0hL9a_KqEUDIcjLn_uI5ebIm-i7yqvEWAEO-zv0MewXlVvZAV9bmegFJ-DmmZRzKN6LUemTCVRsnMWL4QolbPUVn-TqgndXXDRrB1MF4Yy7sFAJcXcDp-04nzw8nFXlq4JxZzOOsVs5PtI4s2Yz-5lW_N',
  linQingfengDetail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGA10T5J7eZ30RzM0l9xg4WNfqgcwZCiny40d59xhZzCymBP8vD7WjguufO9vlbpyy10G92yQHZ66iHSy1hhkDmsz_G8JUNxLmuo2PSXB2DoPpD5WVXHWSXcfodGaN68warxPbf6CS8HjKPGJ1QRHBMPhM8HKyuoZm-fSKliAPoaOCXYtrhy75I16EUFmhX-7iYaM22u9TwgzAcNXmesuhtCJG-cGv_Mk28ouGw8y-LaOzG62tskb6UjjECNzqUfg7pb1kVSdixmsP',
  zhangWuji: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYR561aT8b1hWrnCmwRp1nMRCywDD6wdnrwMz3Km1NwGO8dCj1A_hiA0LVMEOOcjFkuwmmO7KQX6gDdIGFgwUaVVa5Mm8dKp3liNBUOU7YL6Q9yDDFZZmZ3CGIurzZfW1mKvVqJ_7cR-PvsBW0hXpZvar4LqYRQOy2IhYxR39KkIB_U8LSu5LzmYB19sZVEF9qdFvLCrFWtvRg8zG1p4JRFCN7V1_bTZmqXZphDCLlHZulCc5LdsIvqiVeYSIE1jvw2sbdEDiWJy7d',
  wangXiaoming: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZt6zbFmKn295ZsB9OXGeZmReyAA6ad6FPxTQ-mL1MnhgXhIpLc8GToaPzeWBFSeIyYQdZ-0yLPRlmqwiBCJelNWmWmCUg600iTslCc7OJsF-g5vvnRxPJAv2hks4GcofhZT9dm4X-QzlIbHnnP56qsX24bcXKP_-OfSstd-GhZq_PCYU2uL_CmnOFssd9XA0UGTSNQeRpHgXYGaWf7NJvrMOrh5RPXXYnuhQ40YcMGviC5tTuQG9Vez9pRDszfNel8mLObGPytNNR',
  corporateAdmin: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAutf8uw-UP_WcJF6DedJ7BJ-58j6AAoLLsPj5uet4SuxCOsbEVOsOt8J5Q8cq0EcOJjh94kvPemlbPGCcdd89_oNXUsQRyuMWCsUQlagzBJhnOTUtw94XVV1AIw494VL8MRVgRwo0k2vWHujUJ-JYDSlLcvmZOOau40QddlzoeAwLsvEYy0BeAyExWOUQIL9zD8ULX6ruVNErCoPp9-hFCH6zrLtpvJwLdnaYJ1EBsCdh4kv_Dyp_5tUU8mZI1XzDOqNQ03ZcnPHZ4',
  genericUser: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB51BLmXrMHY3W_3w8lDMModFpDoXFpkEON0rvWsuR4TSbZDq63XDgYYu13h7muskvXx8GQfArBB5Aeb1BwnDeAxGZiFeN6A33g6O-xWwCXoplVZdCLi1mU2W--fIz1leAMb8JGnm5urSA40Dm5ExCbWsNSpr3XqujWCsxUzADuiE-4h_0E8oWAxQ9s2nDRgcouqlKl6nCuYrBrdMEXoWhJ0z38k-hx-jef_OcdV0Kq9xHZJ7O3K1_aL7SMjcZCpmTAK3odD-fEkDJJ'
};

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 12480,
  totalUsersTrend: 12.5,
  newPosts: 3291,
  newPostsTrend: 8.2,
  activeGoods: 8405,
  activeGoodsTrend: -2.4,
  activeServices: 1024,
  activeServicesTrend: 15.0,
  monthlyOrders: 5630,
  monthlyOrdersTrend: 4.8
};

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-88392-A',
    name: '林清风',
    email: 'lin.qingfeng@example.com',
    phone: '+86 138****4567',
    avatar: AVATARS.linQingfeng,
    status: 'normal',
    verified: 'verified',
    region: '北京市 朝阳区',
    registerTime: '2023-10-15 14:30:22',
    followersCount: 8932,
    followingCount: 1240,
    dynamicsCount: 342,
    goodsCount: 15,
    servicesCount: 4
  },
  {
    id: 'USR-10293-B',
    name: '张无忌',
    email: 'zhang.wuji@example.com',
    phone: '+86 139****8888',
    avatar: AVATARS.zhangWuji,
    status: 'disabled',
    verified: 'unverified',
    region: '深圳市 南山区',
    registerTime: '2023-11-02 09:15:00',
    followersCount: 3,
    followingCount: 12,
    dynamicsCount: 1,
    goodsCount: 1,
    servicesCount: 0
  },
  {
    id: 'USR-98432-C',
    name: '王小明',
    email: 'wang.xiaoming@example.com',
    phone: '+86 135****2211',
    avatar: AVATARS.wangXiaoming,
    status: 'normal',
    verified: 'verified',
    region: '上海市 静安区',
    registerTime: '2022-01-15 11:20:00',
    followersCount: 521,
    followingCount: 88,
    dynamicsCount: 14,
    goodsCount: 2,
    servicesCount: 1
  }
];

export const INITIAL_DYNAMICS: Dynamic[] = [
  {
    id: 'DYN-1001',
    title: '周末发现了一家超好吃的私房汉堡店！就在市中心那条老街的拐角处。店面不大但是装修很有格调。推荐他们的招牌黑松露牛肉堡，肉饼鲜嫩多汁，加上特制的酱料简直绝了。价格略贵但绝对物超所值，强烈推荐给大家去试试！🍔🍟✨ #周末探店 #同城美食 #汉堡控',
    author: '王小明',
    authorAvatar: AVATARS.wangXiaoming,
    category: 'food',
    time: '2023-10-25 14:30:22',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClA3Xn024iQfgp91jnC01LOBOWfC_tz49J-rcWXbUKT_yLjYDY2YE8XqYrv8uEB0fp4kUCfcKxrqo62SN9rsFFBRxCTaFONFmuFDQRuSxyIbtM_Z7i6QfkIwAiwYFsI5ashIjvwFkywcmz-sSsvpdt6a6-AWIUKHOwtJjuL_fdVTpBIJiQcKg5DVG5f8fSo6p64LhLB0cAvEVnQ8Wx1Ml28u0ClAIvue2MqYk05Q4EbkCfSHpT6fhsp8iescJ-h3mLy_zdbLhIO9Rc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3tMgLaKw9Sh9vacNH1nDGyQMJWdO-KdfBleAztiOv0iCK1TcbUDtUDk8Kktm4DcLdky5MQ007Cb3QC4AfFaTxA6YeGCGynvc7w_Actr_NEBLoN_7PfTfpj_ks0e2ywNxK0zzIciP9GbwU9Ved00yujBloQV8PfDMWaq-bieNpf-5StprMh5qZPe6juGg46IwA9-yz_psRIsNW2loeaMB9LNkM-rkklxgXRntMuSLVUJ_eEut1simweROriDpdJf8zRJhHefNQ3vp8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgwZLxbosVxZN9o8Pp0rMOlEUZe8Vjn171lv9BpQOGMMs5SAa3YBhErqbu0UVLQScJOvWlwAG5Y74Mqof5gJn9gnh4Wt0CMYr23bVxGpsssvB7Y2u4aNhWGwHhz9O3qimBbJVo3j6o5KHKxUFAQaeH21rx79B-cMd7pB8dEcNY8O9czb83yJ6W9MjXB_6ZGRSE8d9BKCfTnZU-5vDrO88ZBCfDPyz95TbHLAHqWl3wgOE01FbGgVI3eH8V_rDIZnMRPxJdeWHZwqJi',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANS7x529O8ASsavGLiueINXLofRjBBPNukeFSBv7wtOsXIPpbrXavYlWedJsVJaNEbNLIcSQ9pxHZ5Llw0vciGh6gLZFW7DYfsV_2Hju41Kx_C52yzsD-C6PpuJfJ4OJ3Qqjk8Rsa4jV30l2ejl4gSsfG-DUXXiouOq6FIsngM6Tga6mPF3D1j6X0TZ6JR857aDS1ytVOL6_EnXccY0vPw8NGl5UFah3OI-RWbLROmcvieQhPM4a8oQFOvdsebsNtcLjEXzDLYaot9'
    ],
    status: 'pending',
    likes: 12,
    commentsCount: 3,
    userId: 'USR-98432-C',
    verifiedUser: true,
    comments: [
      {
        id: '101',
        author: '李四_1990',
        avatar: AVATARS.linQingfeng,
        text: '看着好有食欲！求具体地址啊楼主！',
        time: '2023-10-25 15:02'
      },
      {
        id: '102',
        author: '张三不吃鱼',
        avatar: AVATARS.zhangWuji,
        text: '前天刚去过，确实不错，就是排队太久了。',
        time: '2023-10-25 16:30'
      }
    ]
  },
  {
    id: 'DYN-1002',
    title: '有没有推荐的靠谱家政阿姨？最好是在高新区附近，平时家里带带孩子，弄一顿晚饭。要求做饭好吃，干活利索，有健康证。谢谢大家！',
    author: '李四_1990',
    authorAvatar: AVATARS.linQingfeng,
    category: 'help',
    time: '2023-10-24 09:15:00',
    images: [],
    status: 'normal',
    likes: 45,
    commentsCount: 28,
    comments: []
  },
  {
    id: 'DYN-1003',
    title: '高价回收各类二手手机，老旧机坏机不论机型，联系电话138xxxx... 上门自提，绝对高价。',
    author: '黑心中介',
    authorAvatar: AVATARS.zhangWuji,
    category: 'life',
    time: '2023-10-23 22:10:05',
    images: [],
    status: 'removed',
    likes: 0,
    commentsCount: 0,
    rejectReason: '垃圾广告',
    comments: []
  }
];

export const INITIAL_GOODS: Goods[] = [
  {
    id: 'GDS-20231027-01',
    title: '99新 MacBook Pro M1 16G 512G',
    price: 5800,
    category: 'electronics',
    condition: '九成新',
    sellerName: '张三丰',
    sellerId: 'UID-8821',
    sellerAvatar: AVATARS.zhangWuji,
    sellerRating: 4.8,
    location: '南山区 科技园',
    distance: '2.5 km',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQHgCeKTz_Hfzw-xJ52i9CKCTGWq6wToGoZNUbSe7TbDw72uFrzFIGwT7o86pPe3E7S__vB-1oNJ_JKFxd87DdX3IwsxVwxLjnqKUTq2Bxj40_47x4-oxg2e5YACQIvV9ZHk3_DngRBU40k91r3Qlrxn806B8eMyfiD55937FaNb3RW5ympLdieT-jQrkR-Wi5hkjf4xK0eas2-cK4V4EkMICWNX7hBXFzGeonXAXd1EDjplkhUCsYKwWW-8pmP-w2YdTjYi9apjn4'
    ],
    description: '自用一手 MacBook Pro M1芯片，16G内存，512G固态硬盘。电池健康度89%，无拆无修，屏幕无划痕，外观仅有极轻微使用痕迹。带原装充电器和包装盒。因换新电脑闲置出售，支持同城面交验机。',
    time: '2023-10-27 14:30',
    status: 'active'
  },
  {
    id: 'GDS-20231026-02',
    title: '宜家米克书桌 白色 105x50 厘米',
    price: 150,
    category: 'furniture',
    condition: '八成新',
    sellerName: '李四',
    sellerId: 'UID-3342',
    sellerAvatar: AVATARS.linQingfeng,
    sellerRating: 4.5,
    location: '福田区 景田',
    distance: '4.8 km',
    images: [],
    description: '宜家经典白色米克书桌。带一个抽屉和一个侧柜，收纳空间非常大。由于搬家急售。有一些常见的使用划痕，侧板有轻微受潮，功能完好。需要自提。',
    time: '2023-10-26 09:15',
    status: 'removed'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'SRV-001',
    title: '专业上门空调清洗维修',
    category: '维修安装 / 家电清洗',
    providerName: '王师傅',
    providerAvatar: AVATARS.zhangWuji,
    isVerifiedProvider: true,
    price: 120,
    unit: '/次',
    rating: '-',
    reviewCount: 0,
    time: '2023-10-24 14:30',
    status: 'pending',
    area: '全市范围 (加收远程费)',
    phone: '138****8888',
    description: '从事家电清洗维修行业10年，专业清洗挂机、柜机、中央空调。使用环保清洗剂，高温蒸汽杀菌。承诺清洗不干净不收费，维修修不好不收费。\n\n注：高空作业需另加收安全费50元。'
  },
  {
    id: 'SRV-002',
    title: '周末金毛代遛服务 (限南山区)',
    category: '宠物服务 / 代遛狗',
    providerName: '李同学',
    providerAvatar: AVATARS.linQingfeng,
    price: 45,
    unit: '/小时',
    rating: 4.9,
    reviewCount: 128,
    time: '2023-10-20 09:15',
    status: 'active',
    area: '南山区高新区附近',
    phone: '139****5678',
    description: '大学生兼职代遛狗，本人非常喜欢小动物，自家也有一头2岁的金毛。懂得科学带狗，配备有拾便袋。每次代遛时间可以商议，最长不超过3小时，保障爱宠安全健康。'
  },
  {
    id: 'SRV-003',
    title: '高回报兼职打字员',
    category: '其他 / 未知',
    providerName: '张三',
    providerAvatar: AVATARS.genericUser,
    price: 999,
    unit: '/天',
    rating: '-',
    reviewCount: 0,
    time: '2023-10-25 10:00',
    status: 'rejected',
    area: '居家兼职',
    phone: '137****1111',
    description: '招聘电脑手机打字员，简单易学。1千字给30元，日结。需要加微信沟通交入职押金。',
    rejectReason: '垃圾骗局/网络兼职交费'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-20231024-001',
    buyerName: '李四',
    buyerPhone: '138****1234',
    buyerAddress: '阳光小区 3栋 2单元 401',
    sellerName: '张师傅',
    sellerPhone: '139****5678',
    sellerRating: '4.9',
    serviceName: '上门空调清洗服务-深度清洁',
    price: 128.00,
    paymentPrice: 128.00,
    scheduleTime: '2023-10-25 14:00',
    buildTime: '2023-10-24 10:15:00',
    status: 'pending_execution',
    remark: '客户备注：家里有一台壁挂式空调和一台柜机，都需要深度清洗，最近感觉吹出来的风有异味。希望能带垫布，避免弄脏地板。',
    steps: [
      { name: '买家已下单', time: '2023-10-24 10:15:00' },
      { name: '支付成功', time: '2023-10-24 10:16:22' },
      { name: '商家已接单，待执行', time: '2023-10-24 10:20:11' }
    ],
    feeBreakdown: [
      { name: '基础服务费 (壁挂机)', value: 60.00 },
      { name: '基础服务费 (柜机)', value: 88.00 },
      { name: '平台优惠券', value: 20.00, isDiscount: true }
    ]
  },
  {
    id: 'ORD-20231024-002',
    buyerName: '王五',
    buyerPhone: '135****4321',
    buyerAddress: '海馨苑 12栋 B座 1802',
    sellerName: '社区保洁阿姨',
    sellerPhone: '136****1122',
    sellerRating: '4.8',
    serviceName: '日常两居室保洁 2小时',
    price: 80.00,
    paymentPrice: 80.00,
    scheduleTime: '2023-10-24 09:00',
    buildTime: '2023-10-23 15:30:00',
    status: 'completed',
    remark: '定期保洁，自带卫生工具。',
    steps: [
      { name: '买家已下单', time: '2023-10-23 15:30:00' },
      { name: '支付成功', time: '2023-10-23 15:31:00' },
      { name: '商家已接单', time: '2023-10-23 15:40:00' },
      { name: '保洁服务中', time: '2023-10-24 09:00:00' },
      { name: '服务完成，款项已付拓', time: '2023-10-24 11:15:00' }
    ],
    feeBreakdown: [
      { name: '2小时日常清洁费', value: 80.00 }
    ]
  },
  {
    id: 'ORD-20231023-089',
    buyerName: '赵六',
    buyerPhone: '137****9988',
    buyerAddress: '锦绣花园 8栋 2单元 102',
    sellerName: '急速管道疏通',
    sellerPhone: '131****5544',
    sellerRating: '4.2',
    serviceName: '夜间紧急管道疏通',
    price: 250.00,
    paymentPrice: 250.00,
    scheduleTime: '2023-10-23 23:30',
    buildTime: '2023-10-23 23:05:00',
    status: 'abnormal',
    remark: '极度紧急！卫生间地漏反水严重，需要马上安排师傅师傅上门疏通！已线上付了夜间加急费用。',
    steps: [
      { name: '买家已下单', time: '2023-10-23 23:05:00' },
      { name: '支付成功', time: '2023-10-23 23:06:15' },
      { name: '商家接单失败', time: '2023-10-23 23:25:00' }
    ],
    feeBreakdown: [
      { name: '地漏基本疏通服务', value: 150.00 },
      { name: '夜间特急加班服务费', value: 100.00 }
    ]
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  // Dynamidc Categories
  { id: 'cat-dyn-1', name: '社区互助', type: 'dynamic', order: 1, status: 'normal' },
  { id: 'cat-dyn-2', name: '失物招领', type: 'dynamic', order: 2, status: 'normal' },
  { id: 'cat-dyn-3', name: '二手交易', type: 'dynamic', order: 3, status: 'disabled' },
  { id: 'cat-dyn-4', name: '同城活动', type: 'dynamic', order: 4, status: 'normal' },
  { id: 'cat-dyn-5', name: '美食探店', type: 'dynamic', order: 5, status: 'normal' },

  // Goods Categories
  { id: 'cat-gds-1', name: '数码电子', type: 'goods', order: 1, status: 'normal' },
  { id: 'cat-gds-2', name: '家居日用', type: 'goods', order: 2, status: 'normal' },
  { id: 'cat-gds-3', name: '服饰鞋包', type: 'goods', order: 3, status: 'normal' },
  { id: 'cat-gds-4', name: '图书音像', type: 'goods', order: 4, status: 'normal' },
  { id: 'cat-gds-5', name: '其他闲置', type: 'goods', order: 5, status: 'normal' },

  // Service Categories
  { id: 'cat-srv-1', name: '家政清洁', type: 'service', order: 1, status: 'normal', subCount: 6 },
  { id: 'cat-srv-2', name: '维修跑腿', type: 'service', order: 2, status: 'normal', subCount: 4 }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf-101',
    title: '系统维护升级公告',
    content: '为提供更好的服务体验，系统将于本周五凌晨2点进行例行维护，预计耗时2小时，届时同城客户端和管理平台可能会短时间中断访问，请您提前做好准备。',
    target: 'all',
    time: '2023-10-25 10:00:00',
    status: 'sent',
    read: false
  },
  {
    id: 'ntf-102',
    title: '违规信息处理警告',
    content: '尊敬的用户您好，您于最近发布的若干款闲置商品涉嫌包含敏感词语或夸大描述，违背了平台二手物品安全管理规定，请在24小时内修改，否则平台将做强制下架，情节严重者予以封号。',
    target: 'specific',
    time: '2023-10-26 15:30:00',
    status: 'scheduled',
    read: false
  },
  {
    id: 'ntf-103',
    title: '国庆节放假安排及社区活动通知',
    content: '十一中秋假期将至，根据国家法定节假安排。同城生活社区物业服务中心将于10月1日至10月8日安排部分客服值班，紧急报修电话照常运行。此外，10月1日上午8:00将在小区中央广场举办升旗仪式，诚邀全体业主参与。',
    target: 'all',
    time: '2023-09-28 09:00:00',
    status: 'sent',
    read: true
  }
];

export const INITIAL_MANAGED_COMMENTS: ManagedComment[] = [
  {
    id: 'COM-901',
    targetType: 'dynamic',
    targetId: 'DYN-1001',
    targetTitle: '周末发现了一家超好吃的私房汉堡店！还可以...',
    authorName: '李四_1990',
    authorAvatar: AVATARS.linQingfeng,
    content: '看着好有食欲！求具体地址啊楼主！那附近有没有好停车的地方？',
    time: '2023-10-25 15:02:11',
    status: 'normal'
  },
  {
    id: 'COM-902',
    targetType: 'dynamic',
    targetId: 'DYN-1001',
    targetTitle: '周末发现了一家超好吃的私房汉堡店！还可以...',
    authorName: '张三不吃鱼',
    authorAvatar: AVATARS.zhangWuji,
    content: '前天刚去过，确实不错，就是排队太久了。服务态度也有待改善。',
    time: '2023-10-25 16:30:45',
    status: 'normal'
  },
  {
    id: 'COM-903',
    targetType: 'service',
    targetId: 'SRV-002',
    targetTitle: '周末金毛代遛服务 (限南山区)',
    authorName: '王小明',
    authorAvatar: AVATARS.wangXiaoming,
    content: '李同学非常细心，家里狗子出去遛完回来开心得很，好评！',
    time: '2023-10-22 17:40:00',
    status: 'normal'
  },
  {
    id: 'COM-904',
    targetType: 'goods',
    targetId: 'GDS-20231027-01',
    targetTitle: '99新 MacBook Pro M1 16G 512G',
    authorName: '无聊游客A',
    authorAvatar: AVATARS.genericUser,
    content: '大降价啦，急需转让，加薇扣 138-xxxx，内部低价出售保真！！！',
    time: '2023-10-27 18:22:05',
    status: 'flagged'
  }
];

export const INITIAL_BLACKLIST: BlacklistItem[] = [
  {
    id: 'BLK-001',
    targetType: 'user',
    targetValue: 'bad_spammer_99',
    reason: '持续在同城圈群发敏感刷单及微商导流广告',
    creator: 'admin',
    time: '2023-10-20 09:40:15'
  },
  {
    id: 'BLK-002',
    targetType: 'keyword',
    targetValue: '办证刻章',
    reason: '涉嫌非法办证、违法宣传词汇，实施一键拦截',
    creator: 'admin',
    time: '2023-09-15 11:20:00'
  },
  {
    id: 'BLK-003',
    targetType: 'keyword',
    targetValue: '买卖发票',
    reason: '涉嫌虚开增值税普通发票，实施严防词汇拦截',
    creator: 'admin',
    time: '2023-09-18 14:15:30'
  },
  {
    id: 'BLK-004',
    targetType: 'ip',
    targetValue: '192.168.45.210',
    reason: '检测到该IP恶意爬取多达1万条用户信息及电话，封锁其访问网关',
    creator: '系统监察',
    time: '2023-10-26 23:55:12'
  }
];

export const INITIAL_IMAGES: ManagedImage[] = [
  {
    id: 'IMG-001',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClA3Xn024iQfgp91jnC01LOBOWfC_tz49J-rcWXbUKT_yLjYDY2YE8XqYrv8uEB0fp4kUCfcKxrqo62SN9rsFFBRxCTaFONFmuFDQRuSxyIbtM_Z7i6QfkIwAiwYFsI5ashIjvwFkywcmz-sSsvpdt6a6-AWIUKHOwtJjuL_fdVTpBIJiQcKg5DVG5f8fSo6p64LhLB0cAvEVnQ8Wx1Ml28u0ClAIvue2MqYk05Q4EbkCfSHpT6fhsp8iescJ-h3mLy_zdbLhIO9Rc',
    name: 'chongqing_hotpot_delicious.jpg',
    size: '142 KB',
    category: 'dynamic',
    uploader: '王小明',
    uploadedAt: '2023-10-25 14:28:11',
    status: 'approved'
  },
  {
    id: 'IMG-002',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQHgCeKTz_Hfzw-xJ52i9CKCTGWq6wToGoZNUbSe7TbDw72uFrzFIGwT7o86pPe3E7S__vB-1oNJ_JKFxd87DdX3IwsxVwxLjnqKUTq2Bxj40_47x4-oxg2e5YACQIvV9ZHk3_DngRBU40k91r3Qlrxn806B8eMyfiD55937FaNb3RW5ympLdieT-jQrkR-Wi5hkjf4xK0eas2-cK4V4EkMICWNX7hBXFzGeonXAXd1EDjplkhUCsYKwWW-8pmP-w2YdTjYi9apjn4',
    name: 'macbook_pro_perfect_condition.png',
    size: '489 KB',
    category: 'goods',
    uploader: '张三丰',
    uploadedAt: '2023-10-27 14:15:22',
    status: 'approved'
  },
  {
    id: 'IMG-003',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB51BLmXrMHY3W_3w8lDMModFpDoXFpkEON0rvWsuR4TSbZDq63XDgYYu13h7muskvXx8GQfArBB5Aeb1BwnDeAxGZiFeN6A33g6O-xWwCXoplVZdCLi1mU2W--fIz1leAMb8JGnm5urSA40Dm5ExCbWsNSpr3XqujWCsxUzADuiE-4h_0E8oWAxQ9s2nDRgcouqlKl6nCuYrBrdMEXoWhJ0z38k-hx-jef_OcdV0Kq9xHZJ7O3K1_aL7SMjcZCpmTAK3odD-fEkDJJ',
    name: 'avatar_generic_guest_temp.jpg',
    size: '45 KB',
    category: 'avatar',
    uploader: '新注册市民_5516',
    uploadedAt: '2023-10-28 09:12:00',
    status: 'pending'
  }
];

export const INITIAL_LOGIN_LOGS: LoginLogItem[] = [
  {
    id: 'LOG-L101',
    userId: 'USR-88392-A',
    username: '林清风',
    ip: '220.181.38.112',
    device: 'iPhone 14 Pro, WeChat MiniApp',
    location: '北京市',
    time: '2023-10-28 09:15:32',
    status: 'success'
  },
  {
    id: 'LOG-L102',
    userId: 'USR-98432-C',
    username: '王小明',
    ip: '116.228.140.22',
    device: 'HUAWEI Mate 60 Pro, Android WeChat',
    location: '上海市 静安区',
    time: '2023-10-28 08:30:11',
    status: 'success'
  },
  {
    id: 'LOG-L103',
    userId: 'USR-10293-B',
    username: '张无忌',
    ip: '112.97.24.45',
    device: 'Xiaomi 13, WeChat',
    location: '深圳市 南山区',
    time: '2023-10-27 21:05:40',
    status: 'failed',
    failReason: '账号已被系统强制休眠禁用'
  },
  {
    id: 'LOG-L104',
    userId: 'UID-SYSTEM-ADMIN',
    username: 'admin',
    ip: '14.120.55.88',
    device: 'MacBook Pro, Chrome 118',
    location: '北京市 朝阳区',
    time: '2023-10-28 09:00:00',
    status: 'success'
  },
  {
    id: 'LOG-L105',
    userId: 'UID-SYSTEM-ADMIN',
    username: 'admin',
    ip: '14.120.55.88',
    device: 'MacBook Pro, Safari 17',
    location: '北京市 朝阳区',
    time: '2023-10-27 18:45:12',
    status: 'failed',
    failReason: '管理员口令校验不匹配'
  }
];

export const INITIAL_OP_LOGS: OperationLogItem[] = [
  {
    id: 'LOG-OP001',
    operator: 'admin',
    role: '超级管理员',
    action: '强制关闭二手闲置交易并退还担保金',
    target: 'ORD-20231023-089',
    ip: '14.120.55.88',
    time: '2023-10-28 09:30:15',
    status: 'success',
    details: '介入仲裁紧急疏通交易纠纷，对买家李四进行极速秒开小窗人道全额退款。'
  },
  {
    id: 'LOG-OP002',
    operator: 'admin',
    role: '超级管理员',
    action: '责令下架违规便民快速服务',
    target: 'SRV-003',
    ip: '14.120.55.88',
    time: '2023-10-25 10:15:00',
    status: 'success',
    details: '服务“高回报兼职打字员”经核审，由于判定其涉嫌网络兼职、变相收取押金诈骗，判定驳回入驻。'
  },
  {
    id: 'LOG-OP003',
    operator: '系统自动审计',
    role: 'AI风控总管',
    action: '一键熔断异常言论动态',
    target: 'DYN-1003',
    ip: '127.0.0.1',
    time: '2023-10-23 22:15:00',
    status: 'success',
    details: '检测到其发布文本包含微信、电话敏感引流敏感词句，自动移至垃圾广告保留库。'
  },
  {
    id: 'LOG-OP004',
    operator: 'admin',
    role: '超级管理员',
    action: '封禁恶意发布垃圾内容市民',
    target: 'USR-10293-B (张无忌)',
    ip: '14.120.55.88',
    time: '2023-11-02 09:18:00',
    status: 'success',
    details: '批量屏蔽恶意垃圾中介发贴，对其市民端账户执行 720 小时强制拉闸隔离。'
  }
];
