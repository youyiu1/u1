/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Service, Item } from '../../types';

import { LikeButton } from './LikeButton';

interface CardProps {
  type: 'service' | 'item';
  data: any; // Using any temporarily to bypass strict union issues
}

export const GlobalCard: React.FC<CardProps> = ({ type, data }) => {
  const navigate = useNavigate();
  const isService = type === 'service';
  const service = data as Service;
  const item = data as Item;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div onClick={() => navigate(`/${isService ? 'service' : 'item'}/${data.id}`, { state: { from: '/' } })}>
        <div className="aspect-[4/5] overflow-hidden mb-6 relative rounded-[32px] bg-stone-100 shadow-inner group-hover:shadow-premium transition-all duration-700 ease-[0.16,1,0.3,1]">
          <img
            src={data.images?.[0] || null}
            alt={data.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[0.16,1,0.3,1]"
          />
          
          <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-10 transition-opacity duration-700" />

          <div className="absolute inset-0 flex items-end justify-start p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
             <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-ink shadow-sm">
                View Details
             </div>
          </div>

          <div className="absolute top-6 right-6 p-4 rounded-full backdrop-blur-xl transition-all duration-700 shadow-xl scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 bg-white/60 hover:bg-white">
            <LikeButton showCount={false} size="sm" />
          </div>
        </div>

        <div className="space-y-3 px-2">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-black text-ink group-hover:text-primary transition-colors duration-500 leading-[1.1] tracking-tight">
              {data.title}
            </h3>
            {isService && (
              <div className="flex items-center gap-1.5 shrink-0 pt-1 px-2 py-1 bg-primary/5 rounded-lg">
                <Star className="w-3 h-3 text-primary fill-current" />
                <span className="text-[10px] font-black text-ink tracking-tight">{service.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-ink tracking-tighter tabular-nums">¥{data.price}</span>
            {isService ? (
              <span className="text-[10px] text-secondary font-black tracking-widest uppercase">/{service.unit}</span>
            ) : (
              item.originalPrice && (
                <span className="text-[10px] text-muted font-medium line-through decoration-primary/30">¥{item.originalPrice}</span>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
