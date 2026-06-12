import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShoppingBag, TrendingUp, HandHelping, ArrowUpRight } from 'lucide-react';

export const BentoFeatures: React.FC = () => {
  const navigate = useNavigate();
  const features = [
    { 
      title: '邻里服务', 
      icon: <HandHelping className="w-5 h-5" />, 
      color: 'bg-blue-50 text-blue-600',
      path: '/service' 
    },
    { 
      title: '周边市场', 
      icon: <ShoppingBag className="w-5 h-5" />, 
      color: 'bg-orange-50 text-orange-600',
      path: '/market' 
    },
    { 
      title: '限时优惠', 
      icon: <Zap className="w-5 h-5" />, 
      color: 'bg-yellow-50 text-yellow-600',
      path: '/market' 
    },
    { 
      title: '热门推荐', 
      icon: <TrendingUp className="w-5 h-5" />, 
      color: 'bg-purple-50 text-purple-600',
      path: '/service' 
    },
  ];

  return (
    <section className="py-12 border-b border-hairline">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(item.path)}
            className="group cursor-pointer flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-hairline"
          >
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black text-ink tracking-tight">{item.title}</h3>
              <p className="text-[10px] text-secondary font-medium opacity-60 leading-tight uppercase tracking-wider">{item.title === '邻里服务' ? 'Help' : item.title === '周边市场' ? 'Shop' : item.title === '限时优惠' ? 'Offer' : 'Hot'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
