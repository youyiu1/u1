import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Item, Service } from '../../types';

interface ProfileMarketItemProps {
  item: Item | Service;
}

export const ProfileMarketItem: React.FC<ProfileMarketItemProps> = ({ item }) => {
  const navigate = useNavigate();
  // We need to check if it's an Item or Service for the URL
  const isItem = 'price' in item && 'condition' in item;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      key={item.id}
      onClick={() => navigate(isItem ? `/item/${item.id}` : `/service/${item.id}`)}
      className="bg-white border border-hairline rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="aspect-[4/3] relative">
        <img src={item.image || undefined} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black rounded-lg border border-hairline shadow-sm uppercase tracking-widest text-primary">
          {item.category === 'market' ? '闲置' : '服务'}
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-sm font-black text-ink mb-2 line-clamp-1">{item.title}</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-black text-primary">¥</span>
            <span className="text-lg font-black text-primary">{item.price}</span>
          </div>
          <span className="text-[10px] text-muted font-bold font-mono">
            {('distance' in item) ? item.distance : '0.5km'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
